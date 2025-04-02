import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertWebsiteVisitSchema, 
  insertFocusSessionSchema, 
  insertBlockedWebsiteSchema,
  insertSettingsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for website visits
  app.get("/api/visits", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const visits = await storage.getWebsiteVisitsByUser(userId);
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve website visits" });
    }
  });

  app.get("/api/visits/domain", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const domain = req.query.domain as string;
      
      if (isNaN(userId) || !domain) {
        return res.status(400).json({ message: "Valid userId and domain are required" });
      }
      
      const visits = await storage.getWebsiteVisitsByUserAndDomain(userId, domain);
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve website visits" });
    }
  });

  app.get("/api/visits/timerange", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const startTime = new Date(req.query.startTime as string);
      const endTime = new Date(req.query.endTime as string);
      
      if (isNaN(userId) || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({ message: "Valid userId, startTime, and endTime are required" });
      }
      
      const visits = await storage.getWebsiteVisitsByUserAndTimeRange(userId, startTime, endTime);
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve website visits" });
    }
  });

  app.post("/api/visits", async (req, res) => {
    try {
      const validatedData = insertWebsiteVisitSchema.parse(req.body);
      const visit = await storage.createWebsiteVisit(validatedData);
      res.status(201).json(visit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid visit data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create website visit" });
    }
  });

  app.put("/api/visits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid ID is required" });
      }
      
      const updatedVisit = await storage.updateWebsiteVisit(id, req.body);
      if (!updatedVisit) {
        return res.status(404).json({ message: "Website visit not found" });
      }
      
      res.json(updatedVisit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update website visit" });
    }
  });

  // API Routes for focus sessions
  app.get("/api/focus-sessions", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const sessions = await storage.getFocusSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve focus sessions" });
    }
  });

  app.post("/api/focus-sessions", async (req, res) => {
    try {
      const validatedData = insertFocusSessionSchema.parse(req.body);
      const session = await storage.createFocusSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create focus session" });
    }
  });

  app.put("/api/focus-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid ID is required" });
      }
      
      const updatedSession = await storage.updateFocusSession(id, req.body);
      if (!updatedSession) {
        return res.status(404).json({ message: "Focus session not found" });
      }
      
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update focus session" });
    }
  });

  // API Routes for blocked websites
  app.get("/api/blocked-websites", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const blockedWebsites = await storage.getBlockedWebsitesByUser(userId);
      res.json(blockedWebsites);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve blocked websites" });
    }
  });

  app.post("/api/blocked-websites", async (req, res) => {
    try {
      const validatedData = insertBlockedWebsiteSchema.parse(req.body);
      const blockedWebsite = await storage.createBlockedWebsite(validatedData);
      res.status(201).json(blockedWebsite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blocked website data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blocked website" });
    }
  });

  app.delete("/api/blocked-websites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid ID is required" });
      }
      
      const success = await storage.deleteBlockedWebsite(id);
      if (!success) {
        return res.status(404).json({ message: "Blocked website not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blocked website" });
    }
  });

  // API Routes for settings
  app.get("/api/settings", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const settings = await storage.getSettingsByUser(userId);
      if (!settings) {
        // Return default settings if none exist
        return res.json({
          id: 0,
          userId,
          focusDuration: 25,
          breakDuration: 5,
          autoStartBreaks: false,
          autoStartSessions: false,
          trackingEnabled: true
        });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.createOrUpdateSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create/update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
