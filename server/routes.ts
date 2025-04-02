import express from 'express';
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebsiteVisit, FocusSession, BlockedWebsite, Settings } from "@shared/schema";
import { insertWebsiteVisitSchema, insertFocusSessionSchema, insertBlockedWebsiteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  const apiRouter = express.Router();

  // --- Website Visits ---
  
  // Get all website visits
  apiRouter.get('/website-visits', async (req, res) => {
    try {
      const visits = await storage.getWebsiteVisits();
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get website visits' });
    }
  });

  // Add a new website visit
  apiRouter.post('/website-visits', async (req, res) => {
    try {
      const validatedData = insertWebsiteVisitSchema.parse(req.body);
      const visit = await storage.createWebsiteVisit(validatedData);
      res.status(201).json(visit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data format', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create website visit' });
      }
    }
  });

  // --- Focus Sessions ---
  
  // Get all focus sessions
  apiRouter.get('/focus-sessions', async (req, res) => {
    try {
      const sessions = await storage.getFocusSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get focus sessions' });
    }
  });

  // Get recent focus sessions (limited to 5)
  apiRouter.get('/focus-sessions/recent', async (req, res) => {
    try {
      const sessions = await storage.getFocusSessions();
      // Sort by start time descending and take first 5
      const recentSessions = sessions
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5);
      res.json(recentSessions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get recent focus sessions' });
    }
  });

  // Add a new focus session
  apiRouter.post('/focus-sessions', async (req, res) => {
    try {
      const validatedData = insertFocusSessionSchema.parse(req.body);
      const session = await storage.createFocusSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data format', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create focus session' });
      }
    }
  });

  // Update a focus session
  apiRouter.patch('/focus-sessions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { completed, endTime } = req.body;
      
      const updatedSession = await storage.updateFocusSession(id, {
        completed,
        endTime: endTime ? new Date(endTime) : undefined
      });
      
      if (!updatedSession) {
        return res.status(404).json({ message: 'Focus session not found' });
      }
      
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update focus session' });
    }
  });

  // --- Blocked Websites ---
  
  // Get all blocked websites
  apiRouter.get('/blocked-websites', async (req, res) => {
    try {
      const websites = await storage.getBlockedWebsites();
      res.json(websites);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get blocked websites' });
    }
  });

  // Add a new blocked website
  apiRouter.post('/blocked-websites', async (req, res) => {
    try {
      const validatedData = insertBlockedWebsiteSchema.parse(req.body);
      const website = await storage.createBlockedWebsite(validatedData);
      res.status(201).json(website);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data format', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create blocked website' });
      }
    }
  });

  // Delete a blocked website
  apiRouter.delete('/blocked-websites/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteBlockedWebsite(id);
      
      if (!result) {
        return res.status(404).json({ message: 'Blocked website not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete blocked website' });
    }
  });

  // --- Settings ---
  
  // Get settings
  apiRouter.get('/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || {
        startTracking: true,
        showNotifications: true,
        startOnBoot: true,
        dataSettings: {
          storageLimit: 90,
          autoDelete: 30
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get settings' });
    }
  });

  // Update settings
  apiRouter.put('/settings', async (req, res) => {
    try {
      const settings = req.body;
      const updatedSettings = await storage.updateSettings(settings);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  // Get specific settings
  apiRouter.get('/settings/:type', async (req, res) => {
    try {
      const type = req.params.type;
      const settings = await storage.getSettings();
      
      if (type === 'general') {
        res.json({
          startTracking: settings?.startTracking ?? true,
          showNotifications: settings?.showNotifications ?? true,
          startOnBoot: settings?.startOnBoot ?? true
        });
      } else if (type === 'data') {
        res.json(settings?.dataSettings || {
          storageLimit: 90,
          autoDelete: 30
        });
      } else {
        res.status(400).json({ message: 'Invalid settings type' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to get settings' });
    }
  });

  // Update specific settings
  apiRouter.post('/settings/:type', async (req, res) => {
    try {
      const type = req.params.type;
      const settings = await storage.getSettings() || {};
      
      if (type === 'general') {
        const updatedSettings = await storage.updateSettings({
          ...settings,
          ...req.body
        });
        res.json(updatedSettings);
      } else if (type === 'data') {
        const updatedSettings = await storage.updateSettings({
          ...settings,
          dataSettings: req.body
        });
        res.json(updatedSettings);
      } else {
        res.status(400).json({ message: 'Invalid settings type' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to update settings' });
    }
  });

  // --- Tracking ---
  
  // Get tracking status
  apiRouter.get('/tracking/status', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings?.startTracking ?? true);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get tracking status' });
    }
  });

  // Toggle tracking
  apiRouter.post('/tracking/toggle', async (req, res) => {
    try {
      const { enabled } = req.body;
      const settings = await storage.getSettings() || {};
      
      const updatedSettings = await storage.updateSettings({
        ...settings,
        startTracking: enabled
      });
      
      res.json({ enabled: updatedSettings.startTracking });
    } catch (error) {
      res.status(500).json({ message: 'Failed to toggle tracking' });
    }
  });

  // --- Analytics ---
  
  // Get summary data
  apiRouter.get('/summary', async (req, res) => {
    try {
      const viewPeriod = req.query.viewPeriod || 'Today';
      const periodMap = {
        'Today': 'day',
        'This Week': 'week',
        'This Month': 'month'
      };
      
      // Get website visits for the period
      const period = periodMap[viewPeriod as string] || 'day';
      const visits = await storage.getWebsiteVisitsByPeriod(period);
      
      // Calculate total time
      const totalTime = visits.reduce((total, visit) => total + visit.duration, 0);
      
      // Calculate previous period total time
      const previousVisits = await storage.getPreviousPeriodVisits(period);
      const previousTotal = previousVisits.reduce((total, visit) => total + visit.duration, 0);
      
      // Calculate trend
      const totalTimeTrend = previousTotal === 0 ? 0 : Math.round(((totalTime - previousTotal) / previousTotal) * 100);
      
      // Get most visited site
      let mostVisitedSite = { domain: '', time: 0, percentage: 0 };
      
      if (visits.length > 0) {
        // Group by domain
        const domainMap: Record<string, number> = {};
        visits.forEach(visit => {
          if (!domainMap[visit.domain]) {
            domainMap[visit.domain] = 0;
          }
          domainMap[visit.domain] += visit.duration;
        });
        
        // Get domain with max time
        const [maxDomain, maxTime] = Object.entries(domainMap).reduce(
          (max, [domain, time]) => time > max[1] ? [domain, time] : max,
          ['', 0]
        );
        
        mostVisitedSite = {
          domain: maxDomain,
          time: maxTime,
          percentage: totalTime === 0 ? 0 : Math.round((maxTime / totalTime) * 100)
        };
      }
      
      // Calculate projected annual usage
      const dailyAverage = totalTime / (period === 'day' ? 1 : period === 'week' ? 7 : 30);
      const projectedAnnual = dailyAverage * 365;
      
      // Get previous month's daily average
      const previousMonthVisits = await storage.getWebsiteVisitsByPeriod('month', true);
      const previousMonthTotal = previousMonthVisits.reduce((total, visit) => total + visit.duration, 0);
      const previousMonthAverage = previousMonthTotal / 30;
      
      // Calculate projection trend
      const projectionTrend = previousMonthAverage === 0 ? 0 : 
        Math.round(((dailyAverage - previousMonthAverage) / previousMonthAverage) * 100);
      
      res.json({
        totalTime,
        totalTimeTrend,
        mostVisitedSite,
        projectedAnnual: {
          time: projectedAnnual,
          trend: projectionTrend
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get summary data' });
    }
  });

  // Get chart data
  apiRouter.get('/chart', async (req, res) => {
    try {
      const viewPeriod = req.query.viewPeriod || 'Today';
      const periodMap = {
        'Today': 'day',
        'This Week': 'week',
        'This Month': 'month'
      };
      
      const period = periodMap[viewPeriod as string] || 'day';
      const chartData = await storage.getChartData(period);
      
      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get chart data' });
    }
  });

  // Get top websites
  apiRouter.get('/top-websites', async (req, res) => {
    try {
      const viewPeriod = req.query.viewPeriod || 'Today';
      const periodMap = {
        'Today': 'day',
        'This Week': 'week',
        'This Month': 'month'
      };
      
      const period = periodMap[viewPeriod as string] || 'day';
      const websites = await storage.getTopWebsites(period, 5);
      
      res.json(websites);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get top websites' });
    }
  });

  // Get projections
  apiRouter.get('/projections', async (req, res) => {
    try {
      const projections = await storage.getProjections();
      res.json(projections);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get projections' });
    }
  });

  // Get analytics data
  apiRouter.get('/analytics', async (req, res) => {
    try {
      const period = req.query.viewPeriod as string || 'week';
      const analytics = await storage.getAnalytics(period);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get analytics data' });
    }
  });

  // Get categories data
  apiRouter.get('/categories', async (req, res) => {
    try {
      const period = req.query.viewPeriod as string || 'week';
      const categories = await storage.getCategoriesData(period);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get categories data' });
    }
  });

  // Get trends data
  apiRouter.get('/trends', async (req, res) => {
    try {
      const period = req.query.viewPeriod as string || 'week';
      const trends = await storage.getTrendsData(period);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get trends data' });
    }
  });

  // --- Data Management ---
  
  // Clear all data
  apiRouter.delete('/data/clear', async (req, res) => {
    try {
      await storage.clearAllData();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to clear data' });
    }
  });

  // Export data
  apiRouter.get('/data/export', async (req, res) => {
    try {
      const data = await storage.exportData();
      
      res.setHeader('Content-Disposition', 'attachment; filename=timetrack-export.json');
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to export data' });
    }
  });

  // Register the API router with the /api prefix
  app.use('/api', apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
