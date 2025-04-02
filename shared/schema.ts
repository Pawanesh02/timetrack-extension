import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Website visits schema
export const websiteVisits = pgTable("website_visits", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  title: text("title").notNull(),
  category: text("category").default("Uncategorized"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: integer("duration").notNull(), // Duration in seconds
  userId: integer("user_id").references(() => users.id),
});

export const insertWebsiteVisitSchema = createInsertSchema(websiteVisits).pick({
  url: true,
  domain: true,
  title: true,
  category: true,
  startTime: true,
  endTime: true,
  duration: true,
  userId: true,
});

export type InsertWebsiteVisit = z.infer<typeof insertWebsiteVisitSchema>;
export type WebsiteVisit = typeof websiteVisits.$inferSelect;

// Focus sessions schema
export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration").notNull(), // Duration in minutes
  completed: boolean("completed").default(false),
  userId: integer("user_id").references(() => users.id),
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).pick({
  startTime: true,
  duration: true,
  userId: true,
});

export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;

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

export type InsertBlockedWebsite = z.infer<typeof insertBlockedWebsiteSchema>;
export type BlockedWebsite = typeof blockedWebsites.$inferSelect;
