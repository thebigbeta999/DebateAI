import { type User, type InsertUser, type Debate, type InsertDebate, type Argument, type InsertArgument, type DebateResult, type InsertDebateResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createDebate(debate: InsertDebate & { userId: string }): Promise<Debate>;
  getDebate(id: string): Promise<Debate | undefined>;
  updateDebate(id: string, updates: Partial<Debate>): Promise<Debate>;
  getUserDebates(userId: string): Promise<Debate[]>;
  
  createArgument(argument: InsertArgument): Promise<Argument>;
  getDebateArguments(debateId: string): Promise<Argument[]>;
  
  createDebateResult(result: InsertDebateResult): Promise<DebateResult>;
  getDebateResult(debateId: string): Promise<DebateResult | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private debates: Map<string, Debate>;
  private debateArgs: Map<string, Argument>;
  private debateResults: Map<string, DebateResult>;

  constructor() {
    this.users = new Map();
    this.debates = new Map();
    this.debateArgs = new Map();
    this.debateResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDebate(debate: InsertDebate & { userId: string }): Promise<Debate> {
    const id = randomUUID();
    const newDebate: Debate = {
      ...debate,
      id,
      userId: debate.userId,
      status: "setup",
      currentPhase: "opening",
      timeRemaining: this.getPhaseTime(debate.format, "opening"),
      realTimeFeedback: debate.realTimeFeedback ?? true,
      createdAt: new Date(),
      completedAt: null,
    };
    this.debates.set(id, newDebate);
    return newDebate;
  }

  async getDebate(id: string): Promise<Debate | undefined> {
    return this.debates.get(id);
  }

  async updateDebate(id: string, updates: Partial<Debate>): Promise<Debate> {
    const existing = this.debates.get(id);
    if (!existing) {
      throw new Error("Debate not found");
    }
    const updated = { ...existing, ...updates };
    this.debates.set(id, updated);
    return updated;
  }

  async getUserDebates(userId: string): Promise<Debate[]> {
    return Array.from(this.debates.values()).filter(
      (debate) => debate.userId === userId
    );
  }

  async createArgument(argument: InsertArgument): Promise<Argument> {
    const id = randomUUID();
    const newArgument: Argument = {
      ...argument,
      id,
      debateId: argument.debateId || null,
      strengthScore: null,
      logicScore: null,
      persuasivenessScore: null,
      feedback: null,
      createdAt: new Date(),
    };
    this.debateArgs.set(id, newArgument);
    return newArgument;
  }

  async getDebateArguments(debateId: string): Promise<Argument[]> {
    return Array.from(this.debateArgs.values()).filter(
      (arg) => arg.debateId === debateId
    );
  }

  async createDebateResult(result: InsertDebateResult): Promise<DebateResult> {
    const id = randomUUID();
    const newResult: DebateResult = {
      ...result,
      id,
      debateId: result.debateId || null,
      createdAt: new Date(),
    };
    this.debateResults.set(id, newResult);
    return newResult;
  }

  async getDebateResult(debateId: string): Promise<DebateResult | undefined> {
    return Array.from(this.debateResults.values()).find(
      (result) => result.debateId === debateId
    );
  }

  private getPhaseTime(format: string, phase: string): number {
    const formatRules: Record<string, Record<string, number>> = {
      oxford: { opening: 360, rebuttal: 240 },
      parliamentary: { opening: 420, rebuttal: 480 },
      "lincoln-douglas": { opening: 360, rebuttal: 180 },
      "public-forum": { opening: 240, rebuttal: 180, summary: 120 },
    };
    return formatRules[format]?.[phase] || 360;
  }
}

export const storage = new MemStorage();
