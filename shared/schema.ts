import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Website visits schema
export const websiteVisits = pgTable("website_visits", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(),
  url: text("url").notNull(),
  title: text("title"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  userId: integer("user_id").references(() => users.id),
  category: text("category"),
});

export const insertWebsiteVisitSchema = createInsertSchema(websiteVisits).pick({
  domain: true,
  url: true,
  title: true,
  startTime: true,
  endTime: true,
  duration: true,
  userId: true,
  category: true,
});

// Focus sessions schema
export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  completed: boolean("completed").default(false),
  userId: integer("user_id").references(() => users.id),
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).pick({
  startTime: true,
  endTime: true,
  duration: true,
  completed: true,
  userId: true,
});

// Blocked websites schema
export const blockedWebsites = pgTable("blocked_websites", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertBlockedWebsiteSchema = createInsertSchema(blockedWebsites).pick({
  domain: true,
  userId: true,
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  focusDuration: integer("focus_duration").default(25),
  breakDuration: integer("break_duration").default(5),
  autoStartBreaks: boolean("auto_start_breaks").default(false),
  autoStartSessions: boolean("auto_start_sessions").default(false),
  trackingEnabled: boolean("tracking_enabled").default(true),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  focusDuration: true,
  breakDuration: true,
  autoStartBreaks: true,
  autoStartSessions: true,
  trackingEnabled: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWebsiteVisit = z.infer<typeof insertWebsiteVisitSchema>;
export type WebsiteVisit = typeof websiteVisits.$inferSelect;

export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;

export type InsertBlockedWebsite = z.infer<typeof insertBlockedWebsiteSchema>;
export type BlockedWebsite = typeof blockedWebsites.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
