import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Lightbulb, Settings, Play } from "lucide-react";
import type { InsertDebate } from "@shared/schema";

interface DebateSetupProps {
  onStartDebate: (config: InsertDebate) => void;
}

const POPULAR_TOPICS = [
  "Social media should be regulated by government",
  "Universal basic income should be implemented",
  "AI development should be paused",
  "Climate change requires immediate action",
  "College education should be free",
];

const DEBATE_FORMATS = [
  {
    id: "oxford",
    name: "Oxford Style",
    description: "6 minute opening, 4 minute rebuttals",
  },
  {
    id: "parliamentary",
    name: "Parliamentary",
    description: "7 minute speeches, 8 minute rebuttals",
  },
  {
    id: "lincoln-douglas",
    name: "Lincoln-Douglas",
    description: "6 minute case, 3 minute cross-examination",
  },
  {
    id: "public-forum",
    name: "Public Forum",
    description: "4 minute constructive, 3 minute rebuttal, 2 minute summary",
  },
];

export function DebateSetup({ onStartDebate }: DebateSetupProps) {
  const [format, setFormat] = useState("oxford");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [userPosition, setUserPosition] = useState("pro");
  const [aiDifficulty, setAiDifficulty] = useState("intermediate");
  const [realTimeFeedback, setRealTimeFeedback] = useState(true);

  const handleStartDebate = () => {
    const topic = customTopic.trim() || selectedTopic;
    if (!topic) return;

    const config: InsertDebate = {
      topic,
      format,
      userPosition,
      aiDifficulty,
      realTimeFeedback,
    };

    onStartDebate(config);
  };

  const finalTopic = customTopic.trim() || selectedTopic;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Start Your Debate</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Choose your debate format, select a topic, and prepare to argue against our AI opponent
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Debate Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="text-primary mr-2 h-5 w-5" />
              Debate Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={format} onValueChange={setFormat} className="space-y-3">
              {DEBATE_FORMATS.map((fmt) => (
                <div key={fmt.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={fmt.id} id={fmt.id} className="mt-1" />
                  <Label htmlFor={fmt.id} className="cursor-pointer flex-1">
                    <div className="font-medium text-slate-900">{fmt.name}</div>
                    <div className="text-sm text-slate-600">{fmt.description}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="text-primary mr-2 h-5 w-5" />
              Debate Topic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Popular Topics
              </Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a topic..." />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_TOPICS.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-center text-slate-500 text-sm">or</div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Custom Topic
              </Label>
              <Textarea
                placeholder="Enter your own debate topic..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Position & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="text-primary mr-2 h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Your Position
              </Label>
              <Select value={userPosition} onValueChange={setUserPosition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">Pro (Supporting the motion)</SelectItem>
                  <SelectItem value="con">Con (Opposing the motion)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                AI Difficulty
              </Label>
              <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-700">
                Real-time feedback
              </Label>
              <Switch
                checked={realTimeFeedback}
                onCheckedChange={setRealTimeFeedback}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button
          onClick={handleStartDebate}
          disabled={!finalTopic}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl"
          size="lg"
        >
          <Play className="mr-2 h-5 w-5" />
          Start Debate
        </Button>
      </div>
    </div>
  );
}
