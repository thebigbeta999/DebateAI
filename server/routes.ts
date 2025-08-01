import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDebateSchema, insertArgumentSchema } from "@shared/schema";
import { analyzeArgument, generateAIArgument, analyzeDebatePerformance } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new debate
  app.post("/api/debates", async (req, res) => {
    try {
      const data = insertDebateSchema.parse(req.body);
      
      // For demo purposes, create a demo user
      let demoUser = await storage.getUserByUsername("demo");
      if (!demoUser) {
        demoUser = await storage.createUser({ username: "demo", password: "demo" });
      }
      
      const debate = await storage.createDebate({
        ...data,
        userId: demoUser.id,
      });
      
      res.json(debate);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Get debate by ID
  app.get("/api/debates/:id", async (req, res) => {
    try {
      const debate = await storage.getDebate(req.params.id);
      if (!debate) {
        return res.status(404).json({ message: "Debate not found" });
      }
      res.json(debate);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Update debate (for timer, phase changes)
  app.patch("/api/debates/:id", async (req, res) => {
    try {
      const debate = await storage.updateDebate(req.params.id, req.body);
      res.json(debate);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Submit an argument
  app.post("/api/arguments", async (req, res) => {
    try {
      const data = insertArgumentSchema.parse(req.body);
      
      // Get debate details for analysis
      const debate = await storage.getDebate(data.debateId || "");
      if (!debate) {
        return res.status(404).json({ message: "Debate not found" });
      }

      // Create the argument
      const argument = await storage.createArgument(data);

      // If it's a user argument, analyze it and generate AI response
      if (data.speaker === "user") {
        try {
          // Analyze user argument
          const analysis = await analyzeArgument(
            data.content,
            debate.topic,
            debate.userPosition,
            debate.format
          );

          // Update argument with analysis
          const updatedArgument = {
            ...argument,
            strengthScore: analysis.strengthScore,
            logicScore: analysis.logicScore,
            persuasivenessScore: analysis.persuasivenessScore,
            feedback: analysis.feedback,
          };

          // Generate AI counter-argument
          const aiPosition = debate.userPosition === "pro" ? "con" : "pro";
          const aiResponse = await generateAIArgument(
            debate.topic,
            aiPosition,
            data.content,
            debate.format,
            debate.aiDifficulty,
            data.phase
          );

          // Create AI argument
          const aiArgument = await storage.createArgument({
            debateId: data.debateId,
            speaker: "ai",
            content: aiResponse.content,
            phase: data.phase,
          });

          res.json({
            userArgument: updatedArgument,
            aiArgument,
            aiStrategy: aiResponse.strategy,
          });
        } catch (analysisError) {
          // If AI analysis fails, still return the argument
          console.error("AI analysis failed:", analysisError);
          const errorMessage = (analysisError as Error).message;
          let userFriendlyError = "AI analysis unavailable";
          
          if (errorMessage.includes("quota") || errorMessage.includes("429")) {
            userFriendlyError = "OpenAI API quota exceeded - please check your billing settings at platform.openai.com";
          } else if (errorMessage.includes("401") || errorMessage.includes("API key")) {
            userFriendlyError = "Invalid OpenAI API key";
          }
          
          res.json({ userArgument: argument, error: userFriendlyError });
        }
      } else {
        res.json({ argument });
      }
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Get debate arguments
  app.get("/api/debates/:id/arguments", async (req, res) => {
    try {
      const debateArgs = await storage.getDebateArguments(req.params.id);
      res.json(debateArgs);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Complete debate and get analysis
  app.post("/api/debates/:id/complete", async (req, res) => {
    try {
      const debate = await storage.getDebate(req.params.id);
      if (!debate) {
        return res.status(404).json({ message: "Debate not found" });
      }

      const allArguments = await storage.getDebateArguments(req.params.id);
      const userArguments = allArguments
        .filter(arg => arg.speaker === "user")
        .map(arg => arg.content);
      const aiArguments = allArguments
        .filter(arg => arg.speaker === "ai")
        .map(arg => arg.content);

      try {
        // Analyze overall debate performance
        const analysis = await analyzeDebatePerformance(
          debate.topic,
          debate.userPosition,
          userArguments,
          aiArguments,
          debate.format
        );

        // Save debate result
        const result = await storage.createDebateResult({
          debateId: req.params.id,
          overallScore: analysis.overallScore,
          strengthScore: analysis.strengthScore,
          logicScore: analysis.logicScore,
          persuasivenessScore: analysis.persuasivenessScore,
          responseScore: analysis.responseScore,
          winner: analysis.winner,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
        });

        // Update debate status
        await storage.updateDebate(req.params.id, {
          status: "completed",
          completedAt: new Date(),
        });

        res.json(result);
      } catch (analysisError) {
        console.error("Debate analysis failed:", analysisError);
        // Provide fallback analysis
        const fallbackResult = await storage.createDebateResult({
          debateId: req.params.id,
          overallScore: 7,
          strengthScore: 7,
          logicScore: 7,
          persuasivenessScore: 7,
          responseScore: 7,
          winner: "tie",
          strengths: ["Good effort", "Clear communication"],
          improvements: ["Add more evidence", "Strengthen conclusions"],
        });

        await storage.updateDebate(req.params.id, {
          status: "completed",
          completedAt: new Date(),
        });

        res.json({ ...fallbackResult, error: "AI analysis unavailable" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get debate result
  app.get("/api/debates/:id/result", async (req, res) => {
    try {
      const result = await storage.getDebateResult(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Debate result not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
