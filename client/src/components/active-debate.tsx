import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer } from "./timer";
import { MessageSquare, User, Bot, TrendingUp, CheckCircle, Clock, FileText } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Debate, Argument } from "@shared/schema";

interface ActiveDebateProps {
  debate: Debate;
  onDebateComplete: () => void;
}

interface ArgumentResponse {
  userArgument: Argument;
  aiArgument?: Argument;
  aiStrategy?: string;
  error?: string;
}

export function ActiveDebate({ debate, onDebateComplete }: ActiveDebateProps) {
  const [currentArgument, setCurrentArgument] = useState("");
  const [aiResponse, setAiResponse] = useState<Argument | null>(null);
  const [aiStrategy, setAiStrategy] = useState<string>("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(debate.currentPhase);
  const [feedback, setFeedback] = useState({
    strength: 0,
    logic: 0,
    persuasiveness: 0,
  });

  const queryClient = useQueryClient();

  const { data: debateArgs = [] } = useQuery<Argument[]>({
    queryKey: ["/api/debates", debate.id, "arguments"],
  });

  const submitArgumentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/arguments", {
        debateId: debate.id,
        speaker: "user",
        content,
        phase: currentPhase,
      });
      return response.json() as Promise<ArgumentResponse>;
    },
    onSuccess: (data) => {
      setCurrentArgument("");
      setIsAiThinking(false);
      
      if (data.userArgument.strengthScore) {
        setFeedback({
          strength: data.userArgument.strengthScore,
          logic: data.userArgument.logicScore || 0,
          persuasiveness: data.userArgument.persuasivenessScore || 0,
        });
      }
      
      if (data.aiArgument) {
        setAiResponse(data.aiArgument);
        setAiStrategy(data.aiStrategy || "");
      }

      queryClient.invalidateQueries({
        queryKey: ["/api/debates", debate.id, "arguments"],
      });
    },
  });

  const handleSubmitArgument = () => {
    if (!currentArgument.trim()) return;
    
    setIsAiThinking(true);
    submitArgumentMutation.mutate(currentArgument.trim());
  };

  const handleTimerComplete = () => {
    // Move to next phase or complete debate
    if (currentPhase === "opening") {
      setCurrentPhase("rebuttal");
    } else {
      onDebateComplete();
    }
  };

  const getPhaseTime = (format: string, phase: string): number => {
    const formatRules: Record<string, Record<string, number>> = {
      oxford: { opening: 360, rebuttal: 240 },
      parliamentary: { opening: 420, rebuttal: 480 },
      "lincoln-douglas": { opening: 360, rebuttal: 180 },
    };
    return formatRules[format]?.[phase] || 360;
  };

  const userArguments = debateArgs.filter(arg => arg.speaker === "user");
  const aiArguments = debateArgs.filter(arg => arg.speaker === "ai");
  const wordCount = currentArgument.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div>
      {/* Debate Header with Timer */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {debate.topic}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span className="flex items-center">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  {debate.format.charAt(0).toUpperCase() + debate.format.slice(1)} Style
                </span>
                <span className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  You: {debate.userPosition.toUpperCase()}
                </span>
                <span className="flex items-center">
                  <Bot className="mr-1 h-4 w-4" />
                  AI: {debate.userPosition === "pro" ? "CON" : "PRO"}
                </span>
              </div>
            </div>
            <Timer
              initialSeconds={getPhaseTime(debate.format, currentPhase)}
              onComplete={handleTimerComplete}
              phase={currentPhase}
            />
          </div>
        </CardContent>
      </Card>

      {/* Debate Arena */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Your Argument Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              Your Argument
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your argument here..."
              value={currentArgument}
              onChange={(e) => setCurrentArgument(e.target.value)}
              className="h-48 resize-none"
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                {feedback.strength > 0 && (
                  <>
                    <span className="flex items-center">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Grammar: Good
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="mr-1 h-4 w-4" />
                      Strength: {feedback.strength}/10
                    </span>
                  </>
                )}
                <span className="flex items-center">
                  <FileText className="mr-1 h-4 w-4" />
                  {wordCount} words
                </span>
              </div>
              <Button
                onClick={handleSubmitArgument}
                disabled={!currentArgument.trim() || submitArgumentMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {submitArgumentMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Response Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              AI Response
              <div className="ml-auto">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Bot className="mr-1 h-3 w-3" />
                  {isAiThinking ? "Analyzing..." : "Ready"}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAiThinking ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>
            ) : aiResponse ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-700 leading-relaxed">
                    {aiResponse.content}
                  </p>
                </div>
                {aiStrategy && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-2">AI Strategy Preview</h4>
                    <p className="text-sm text-purple-700">{aiStrategy}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-16">
                Submit your argument to see the AI response
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Feedback Panel */}
      {debate.realTimeFeedback && feedback.strength > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="text-primary mr-2 h-5 w-5" />
              Live Feedback & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {feedback.strength}
                </div>
                <div className="text-sm text-slate-600">Argument Strength</div>
                <Progress value={(feedback.strength / 10) * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {feedback.logic}
                </div>
                <div className="text-sm text-slate-600">Logic Flow</div>
                <Progress value={(feedback.logic / 10) * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {feedback.persuasiveness}
                </div>
                <div className="text-sm text-slate-600">Persuasiveness</div>
                <Progress value={(feedback.persuasiveness / 10) * 100} className="mt-2" />
              </div>
            </div>
            {userArguments.length > 0 && userArguments[userArguments.length - 1].feedback && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Suggestions for Improvement</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {(userArguments[userArguments.length - 1].feedback as { suggestions?: string[] })?.suggestions?.map((suggestion: string, index: number) => (
                    <li key={index}>• {suggestion}</li>
                  )) ?? []}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
