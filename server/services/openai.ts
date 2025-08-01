import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ArgumentAnalysis {
  strengthScore: number;
  logicScore: number;
  persuasivenessScore: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  };
}

export interface AIArgument {
  content: string;
  strategy: string;
}

export interface DebateAnalysis {
  overallScore: number;
  strengthScore: number;
  logicScore: number;
  persuasivenessScore: number;
  responseScore: number;
  winner: "user" | "ai" | "tie";
  strengths: string[];
  improvements: string[];
}

export async function analyzeArgument(
  argument: string,
  topic: string,
  position: string,
  format: string
): Promise<ArgumentAnalysis> {
  try {
    const prompt = `You are an expert debate coach analyzing an argument. Please analyze the following argument and provide scores and feedback.

Topic: ${topic}
Position: ${position}
Format: ${format}
Argument: ${argument}

Please respond with JSON in this exact format:
{
  "strengthScore": number (1-10),
  "logicScore": number (1-10), 
  "persuasivenessScore": number (1-10),
  "feedback": {
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "suggestions": ["suggestion 1", "suggestion 2"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert debate coach providing constructive analysis of arguments. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      strengthScore: Math.max(1, Math.min(10, Math.round(result.strengthScore || 5))),
      logicScore: Math.max(1, Math.min(10, Math.round(result.logicScore || 5))),
      persuasivenessScore: Math.max(1, Math.min(10, Math.round(result.persuasivenessScore || 5))),
      feedback: {
        strengths: result.feedback?.strengths || [],
        improvements: result.feedback?.improvements || [],
        suggestions: result.feedback?.suggestions || [],
      },
    };
  } catch (error) {
    throw new Error("Failed to analyze argument: " + (error as Error).message);
  }
}

export async function generateAIArgument(
  topic: string,
  position: string,
  userArgument: string,
  format: string,
  difficulty: string,
  phase: string
): Promise<AIArgument> {
  try {
    const difficultyMap: Record<string, string> = {
      beginner: "Use simple, clear arguments with basic reasoning",
      intermediate: "Use moderate complexity with some nuanced points",
      advanced: "Use sophisticated arguments with complex reasoning",
      expert: "Use highly sophisticated arguments with deep analysis and expert-level reasoning"
    };

    const prompt = `You are an AI debate opponent in a ${format} debate. 

Topic: ${topic}
Your position: ${position}
Current phase: ${phase}
Difficulty level: ${difficulty} - ${difficultyMap[difficulty]}
User's argument: ${userArgument}

Please generate a compelling counter-argument and explain your strategy. Respond with JSON in this format:
{
  "content": "your debate argument here",
  "strategy": "brief explanation of your strategic approach"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a skilled debate opponent. Generate persuasive arguments appropriate to the specified difficulty level. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      content: result.content || "I disagree with your position and will provide a counter-argument.",
      strategy: result.strategy || "Standard counter-argumentation approach",
    };
  } catch (error) {
    throw new Error("Failed to generate AI argument: " + (error as Error).message);
  }
}

export async function analyzeDebatePerformance(
  topic: string,
  userPosition: string,
  userArguments: string[],
  aiArguments: string[],
  format: string
): Promise<DebateAnalysis> {
  try {
    const prompt = `You are an expert debate judge analyzing a complete debate performance.

Topic: ${topic}
User Position: ${userPosition}
Format: ${format}
User Arguments: ${userArguments.join("\n\n")}
AI Arguments: ${aiArguments.join("\n\n")}

Please provide a comprehensive analysis with scores and feedback. Respond with JSON in this format:
{
  "overallScore": number (1-10),
  "strengthScore": number (1-10),
  "logicScore": number (1-10),
  "persuasivenessScore": number (1-10),
  "responseScore": number (1-10),
  "winner": "user" | "ai" | "tie",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert debate judge providing fair, constructive analysis. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      overallScore: Math.max(1, Math.min(10, Math.round(result.overallScore || 5))),
      strengthScore: Math.max(1, Math.min(10, Math.round(result.strengthScore || 5))),
      logicScore: Math.max(1, Math.min(10, Math.round(result.logicScore || 5))),
      persuasivenessScore: Math.max(1, Math.min(10, Math.round(result.persuasivenessScore || 5))),
      responseScore: Math.max(1, Math.min(10, Math.round(result.responseScore || 5))),
      winner: result.winner || "tie",
      strengths: result.strengths || [],
      improvements: result.improvements || [],
    };
  } catch (error) {
    throw new Error("Failed to analyze debate performance: " + (error as Error).message);
  }
}
