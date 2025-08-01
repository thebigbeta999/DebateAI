import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, Lightbulb, RotateCcw, TrendingUp, Save } from "lucide-react";
import type { DebateResult } from "@shared/schema";

interface DebateAnalysisProps {
  result: DebateResult;
  onNewDebate: () => void;
}

export function DebateAnalysis({ result, onNewDebate }: DebateAnalysisProps) {
  const getPerformanceMessage = (score: number) => {
    if (score >= 8) return "Excellent Performance!";
    if (score >= 7) return "Great Job!";
    if (score >= 6) return "Good Work!";
    if (score >= 5) return "Fair Performance";
    return "Room for Improvement";
  };

  const getWinnerMessage = (winner: string) => {
    switch (winner) {
      case "user":
        return "You won this debate";
      case "ai":
        return "AI won this debate";
      default:
        return "This debate was a tie";
    }
  };

  const strokeDasharray = `${(result.overallScore / 10) * 100}, 100`;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Debate Complete!</h2>
        <p className="text-xl text-slate-600">Here's your performance analysis and AI feedback</p>
      </div>

      {/* Score Summary */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Final Scores</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Overall Performance</span>
                  <span className="text-2xl font-bold text-green-600">
                    {result.overallScore}/10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Argument Strength</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {result.strengthScore}/10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Logic & Reasoning</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {result.logicScore}/10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Persuasiveness</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {result.persuasivenessScore}/10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Response Quality</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {result.responseScore}/10
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-32 h-32" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="hsl(20, 5.9%, 90%)"
                    strokeWidth="3"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-600">
                    {result.overallScore}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-lg font-semibold text-slate-900">
                  {getPerformanceMessage(result.overallScore)}
                </div>
                <div className="text-slate-600">
                  {getWinnerMessage(result.winner)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ThumbsUp className="text-green-500 mr-2 h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-slate-700">
              {Array.isArray(result.strengths) && result.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="text-orange-500 mr-2 h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-slate-700">
              {Array.isArray(result.improvements) && result.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="text-center space-x-4">
        <Button
          onClick={onNewDebate}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 font-semibold"
          size="lg"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Debate Again
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="px-6 py-3 font-semibold"
        >
          <TrendingUp className="mr-2 h-5 w-5" />
          View Analysis
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="px-6 py-3 font-semibold"
        >
          <Save className="mr-2 h-5 w-5" />
          Save Debate
        </Button>
      </div>
    </div>
  );
}
