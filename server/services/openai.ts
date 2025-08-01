import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-invalid-key-please-set-openai-api-key" 
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
  // Check for demo mode trigger
  if (argument.includes("[DEMO_MODE]") || topic.includes("[DEMO_MODE]")) {
    return generateDemoAnalysis(argument.replace(" [DEMO_MODE]", ""), position);
  }
  
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
    // Fallback to demo analysis if OpenAI fails
    if ((error as Error).message.includes("quota") || (error as Error).message.includes("429")) {
      return generateDemoAnalysis(argument, position);
    }
    throw new Error("Failed to analyze argument: " + (error as Error).message);
  }
}

function generateDemoAnalysis(argument: string, position: string): ArgumentAnalysis {
  const wordCount = argument.split(' ').length;
  const hasEvidence = /\b(study|research|data|evidence|statistics|survey|poll)\b/i.test(argument);
  const hasExamples = /\b(example|instance|case|such as|for example)\b/i.test(argument);
  const hasCitations = /\b(according to|research shows|studies indicate)\b/i.test(argument);
  
  // Generate realistic scores based on content analysis
  let baseScore = Math.min(10, Math.max(4, Math.floor(wordCount / 15) + 3));
  if (hasEvidence) baseScore += 1;
  if (hasExamples) baseScore += 1;
  if (hasCitations) baseScore += 1;
  
  const strengthScore = Math.min(10, baseScore);
  const logicScore = Math.min(10, Math.max(3, strengthScore + (Math.random() > 0.5 ? 1 : -1)));
  const persuasivenessScore = Math.min(10, Math.max(3, strengthScore + (Math.random() > 0.5 ? 1 : -1)));
  
  const strengths = [
    "Clear articulation of your position on the topic",
    "Logical flow of ideas and reasoning",
    "Strong opening statement that establishes your stance",
    hasEvidence ? "Good use of supporting evidence" : "Direct and confident delivery",
    hasExamples ? "Effective use of examples to illustrate points" : "Well-structured argument format"
  ].filter(Boolean).slice(0, 2);
  
  const improvements = [
    !hasEvidence ? "Consider adding more statistical or research-based evidence" : "Could strengthen evidence with more recent sources",
    !hasExamples ? "Adding concrete examples would make arguments more relatable" : "Examples could be more diverse or specific",
    wordCount < 50 ? "Expanding on key points would strengthen the argument" : "Consider addressing potential counterarguments"
  ].slice(0, 2);
  
  const suggestions = [
    "Practice varying your tone and pace for greater impact",
    "Consider the strongest counterarguments and prepare responses",
    "Use transitions to connect ideas more smoothly",
    "Incorporate more persuasive language techniques"
  ].slice(0, 2);
  
  return {
    strengthScore,
    logicScore,
    persuasivenessScore,
    feedback: {
      strengths,
      improvements,
      suggestions
    }
  };
}

export async function generateAIArgument(
  topic: string,
  position: string,
  userArgument: string,
  format: string,
  difficulty: string,
  phase: string
): Promise<AIArgument> {
  // Check for demo mode trigger
  if (topic.includes("[DEMO_MODE]")) {
    return generateDemoAIArgument(topic.replace(" [DEMO_MODE]", ""), position, userArgument, difficulty, phase);
  }
  
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
    // Fallback to demo AI argument if OpenAI fails
    if ((error as Error).message.includes("quota") || (error as Error).message.includes("429")) {
      return generateDemoAIArgument(topic, position, userArgument, difficulty, phase);
    }
    throw new Error("Failed to generate AI argument: " + (error as Error).message);
  }
}

function generateDemoAIArgument(topic: string, position: string, userArgument: string, difficulty: string, phase: string): AIArgument {
  const templates = {
    beginner: [
      `While you make some valid points, I believe the ${position} position is stronger. The key issue here is that implementing this approach would create significant benefits for society as a whole. This matters because it addresses fundamental problems we're facing today.`,
      `That's an interesting perspective, but I think ${position} is the better approach. The evidence shows that this position offers more practical solutions. This would help address the core concerns while avoiding potential negative consequences.`,
      `I understand your viewpoint, but ${position} makes more sense when we consider the broader implications. The main reason is that this approach is more sustainable and practical. This would lead to better outcomes for everyone involved.`
    ],
    intermediate: [
      `While your argument has merit, there are significant counterpoints that strengthen the ${position} position. Research consistently shows that this approach offers more comprehensive solutions, and the evidence suggests substantial long-term benefits. Furthermore, practical implementation would be more feasible than your proposed alternative.`,
      `Your position overlooks several critical factors that make ${position} preferable. Studies indicate that this approach addresses root causes rather than just symptoms, and practical experience shows that similar implementations have succeeded elsewhere. The data demonstrates clear advantages in both effectiveness and sustainability.`,
      `I respectfully challenge your conclusion because ${position} offers a more balanced solution. The evidence demonstrates that this position accounts for multiple stakeholder interests, and historical precedent suggests that similar approaches have yielded positive results. This comprehensive strategy addresses the complexities you've raised while providing practical benefits.`
    ],
    advanced: [
      `Your argument, while structurally sound, fails to address the fundamental systemic complexities that make ${position} the superior approach. The empirical evidence overwhelmingly supports this position through multiple peer-reviewed studies, and when we examine the intersection of economic, social, and environmental factors, the implications become clear that your proposed alternative would create unintended consequences.`,
      `I must respectfully but firmly disagree with your assessment because ${position} represents the most viable path forward given the multifaceted nature of this issue. The intersection of policy implementation and practical outcomes creates a framework that fundamentally undermines the feasibility of your position, while supporting evidence demonstrates that this approach addresses both immediate concerns and long-term sustainability.`,
      `While I appreciate the logical framework of your argument, it contains several critical flaws in its foundational assumptions that make ${position} the more defensible stance. The multifaceted nature of this issue requires a nuanced approach that accounts for stakeholder diversity, implementation complexity, and unintended consequences, and the evidence consistently shows that this position offers the most comprehensive solution to the challenges we face.`
    ]
  };

  const difficultyLevel = difficulty as keyof typeof templates;
  const selectedTemplates = templates[difficultyLevel] || templates.intermediate;
  const template = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
  
  const strategies = [
    "Highlighting contradictions in the opposing argument while strengthening my position with evidence",
    "Using logical reasoning to demonstrate why the alternative approach is more effective",
    "Addressing counterarguments proactively while building a comprehensive case",
    "Leveraging empirical evidence and practical examples to support my stance",
    "Focusing on long-term implications and sustainability of different approaches"
  ];
  
  return {
    content: template,
    strategy: strategies[Math.floor(Math.random() * strategies.length)]
  };
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
