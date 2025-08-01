import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const debates = pgTable("debates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  topic: text("topic").notNull(),
  format: text("format").notNull(), // oxford, parliamentary, lincoln-douglas, public-forum
  userPosition: text("user_position").notNull(), // pro, con
  aiDifficulty: text("ai_difficulty").notNull(), // beginner, intermediate, advanced, expert
  status: text("status").notNull().default("active"), // setup, active, completed
  currentPhase: text("current_phase").notNull().default("opening"), // opening, rebuttal, closing, summary
  timeRemaining: integer("time_remaining").notNull().default(360), // seconds
  realTimeFeedback: boolean("real_time_feedback").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

export const debateArguments = pgTable("arguments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  debateId: varchar("debate_id").references(() => debates.id),
  speaker: text("speaker").notNull(), // user, ai
  content: text("content").notNull(),
  phase: text("phase").notNull(), // opening, rebuttal, closing, summary
  strengthScore: integer("strength_score"), // 1-10
  logicScore: integer("logic_score"), // 1-10
  persuasivenessScore: integer("persuasiveness_score"), // 1-10
  feedback: jsonb("feedback"), // structured feedback from AI
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const debateResults = pgTable("debate_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  debateId: varchar("debate_id").references(() => debates.id),
  overallScore: integer("overall_score").notNull(), // 1-10
  strengthScore: integer("strength_score").notNull(), // 1-10
  logicScore: integer("logic_score").notNull(), // 1-10
  persuasivenessScore: integer("persuasiveness_score").notNull(), // 1-10
  responseScore: integer("response_score").notNull(), // 1-10
  winner: text("winner").notNull(), // user, ai, tie
  strengths: jsonb("strengths").notNull(), // array of strength points
  improvements: jsonb("improvements").notNull(), // array of improvement suggestions
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertDebateSchema = createInsertSchema(debates).pick({
  topic: true,
  format: true,
  userPosition: true,
  aiDifficulty: true,
  realTimeFeedback: true,
});

export const insertArgumentSchema = createInsertSchema(debateArguments).pick({
  debateId: true,
  speaker: true,
  content: true,
  phase: true,
});

export const insertDebateResultSchema = createInsertSchema(debateResults).pick({
  debateId: true,
  overallScore: true,
  strengthScore: true,
  logicScore: true,
  persuasivenessScore: true,
  responseScore: true,
  winner: true,
  strengths: true,
  improvements: true,
});

export type InsertDebate = z.infer<typeof insertDebateSchema>;
export type Debate = typeof debates.$inferSelect;
export type InsertArgument = z.infer<typeof insertArgumentSchema>;
export type Argument = typeof debateArguments.$inferSelect;
export type InsertDebateResult = z.infer<typeof insertDebateResultSchema>;
export type DebateResult = typeof debateResults.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
