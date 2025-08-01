import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DebateSetup } from "@/components/debate-setup";
import { ActiveDebate } from "@/components/active-debate";
import { DebateAnalysis } from "@/components/debate-analysis";
import { MessageSquare, User } from "lucide-react";
import type { InsertDebate, Debate, DebateResult } from "@shared/schema";

type DebatePhase = "setup" | "active" | "analysis";

export default function DebatePage() {
  const [currentPhase, setCurrentPhase] = useState<DebatePhase>("setup");
  const [currentDebate, setCurrentDebate] = useState<Debate | null>(null);

  const createDebateMutation = useMutation({
    mutationFn: async (config: InsertDebate) => {
      const response = await apiRequest("POST", "/api/debates", config);
      return response.json() as Promise<Debate>;
    },
    onSuccess: (debate) => {
      setCurrentDebate(debate);
      setCurrentPhase("active");
    },
  });

  const completeDebateMutation = useMutation({
    mutationFn: async (debateId: string) => {
      const response = await apiRequest("POST", `/api/debates/${debateId}/complete`, {});
      return response.json() as Promise<DebateResult>;
    },
    onSuccess: () => {
      setCurrentPhase("analysis");
    },
  });

  const { data: debateResult } = useQuery<DebateResult>({
    queryKey: ["/api/debates", currentDebate?.id, "result"],
    enabled: currentPhase === "analysis" && !!currentDebate?.id,
  });

  const handleStartDebate = (config: InsertDebate) => {
    createDebateMutation.mutate(config);
  };

  const handleDebateComplete = () => {
    if (currentDebate) {
      completeDebateMutation.mutate(currentDebate.id);
    }
  };

  const handleNewDebate = () => {
    setCurrentPhase("setup");
    setCurrentDebate(null);
  };

  if (createDebateMutation.isPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Setting up your debate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-900">
                  <MessageSquare className="text-primary inline mr-2" />
                  DebateAI
                </h1>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <a href="#" className="text-slate-700 hover:text-primary px-3 py-2 text-sm font-medium">
                  Practice
                </a>
                <a href="#" className="text-slate-500 hover:text-slate-700 px-3 py-2 text-sm font-medium">
                  History
                </a>
                <a href="#" className="text-slate-500 hover:text-slate-700 px-3 py-2 text-sm font-medium">
                  Leaderboard
                </a>
                <a href="#" className="text-slate-500 hover:text-slate-700 px-3 py-2 text-sm font-medium">
                  Help
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, Alex</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPhase === "setup" && (
          <DebateSetup onStartDebate={handleStartDebate} />
        )}

        {currentPhase === "active" && currentDebate && (
          <ActiveDebate
            debate={currentDebate}
            onDebateComplete={handleDebateComplete}
          />
        )}

        {currentPhase === "analysis" && debateResult && (
          <DebateAnalysis
            result={debateResult}
            onNewDebate={handleNewDebate}
          />
        )}

        {completeDebateMutation.isPending && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Analyzing your debate performance...</p>
          </div>
        )}
      </main>
    </div>
  );
}
