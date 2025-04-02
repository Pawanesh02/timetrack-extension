import {
  users, 
  type User, 
  type InsertUser,
  websiteVisits,
  type WebsiteVisit,
  type InsertWebsiteVisit,
  focusSessions,
  type FocusSession,
  type InsertFocusSession,
  blockedWebsites,
  type BlockedWebsite,
  type InsertBlockedWebsite,
  settings,
  type Settings,
  type InsertSettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Website visits methods
  getWebsiteVisit(id: number): Promise<WebsiteVisit | undefined>;
  getWebsiteVisitsByUser(userId: number): Promise<WebsiteVisit[]>;
  getWebsiteVisitsByUserAndDomain(userId: number, domain: string): Promise<WebsiteVisit[]>;
  getWebsiteVisitsByUserAndTimeRange(userId: number, startTime: Date, endTime: Date): Promise<WebsiteVisit[]>;
  createWebsiteVisit(visit: InsertWebsiteVisit): Promise<WebsiteVisit>;
  updateWebsiteVisit(id: number, visit: Partial<WebsiteVisit>): Promise<WebsiteVisit | undefined>;
  deleteWebsiteVisit(id: number): Promise<boolean>;
  
  // Focus session methods
  getFocusSession(id: number): Promise<FocusSession | undefined>;
  getFocusSessionsByUser(userId: number): Promise<FocusSession[]>;
  getFocusSessionsByUserAndTimeRange(userId: number, startTime: Date, endTime: Date): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: number, session: Partial<FocusSession>): Promise<FocusSession | undefined>;
  deleteFocusSession(id: number): Promise<boolean>;
  
  // Blocked websites methods
  getBlockedWebsite(id: number): Promise<BlockedWebsite | undefined>;
  getBlockedWebsitesByUser(userId: number): Promise<BlockedWebsite[]>;
  createBlockedWebsite(website: InsertBlockedWebsite): Promise<BlockedWebsite>;
  deleteBlockedWebsite(id: number): Promise<boolean>;
  
  // Settings methods
  getSettingsByUser(userId: number): Promise<Settings | undefined>;
  createOrUpdateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private websiteVisits: Map<number, WebsiteVisit>;
  private focusSessions: Map<number, FocusSession>;
  private blockedWebsites: Map<number, BlockedWebsite>;
  private userSettings: Map<number, Settings>;
  
  private userIdCounter: number;
  private visitIdCounter: number;
  private sessionIdCounter: number;
  private blockedWebsiteIdCounter: number;
  private settingsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.websiteVisits = new Map();
    this.focusSessions = new Map();
    this.blockedWebsites = new Map();
    this.userSettings = new Map();
    
    this.userIdCounter = 1;
    this.visitIdCounter = 1;
    this.sessionIdCounter = 1;
    this.blockedWebsiteIdCounter = 1;
    this.settingsIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Website visits methods
  async getWebsiteVisit(id: number): Promise<WebsiteVisit | undefined> {
    return this.websiteVisits.get(id);
  }

  async getWebsiteVisitsByUser(userId: number): Promise<WebsiteVisit[]> {
    return Array.from(this.websiteVisits.values()).filter(
      visit => visit.userId === userId
    );
  }

  async getWebsiteVisitsByUserAndDomain(userId: number, domain: string): Promise<WebsiteVisit[]> {
    return Array.from(this.websiteVisits.values()).filter(
      visit => visit.userId === userId && visit.domain === domain
    );
  }

  async getWebsiteVisitsByUserAndTimeRange(userId: number, startTime: Date, endTime: Date): Promise<WebsiteVisit[]> {
    return Array.from(this.websiteVisits.values()).filter(
      visit => visit.userId === userId && 
               visit.startTime >= startTime &&
               (visit.endTime ? visit.endTime <= endTime : true)
    );
  }

  async createWebsiteVisit(visit: InsertWebsiteVisit): Promise<WebsiteVisit> {
    const id = this.visitIdCounter++;
    const newVisit: WebsiteVisit = { ...visit, id };
    this.websiteVisits.set(id, newVisit);
    return newVisit;
  }

  async updateWebsiteVisit(id: number, visitUpdate: Partial<WebsiteVisit>): Promise<WebsiteVisit | undefined> {
    const visit = this.websiteVisits.get(id);
    if (!visit) return undefined;
    
    const updatedVisit = { ...visit, ...visitUpdate };
    this.websiteVisits.set(id, updatedVisit);
    return updatedVisit;
  }

  async deleteWebsiteVisit(id: number): Promise<boolean> {
    return this.websiteVisits.delete(id);
  }

  // Focus session methods
  async getFocusSession(id: number): Promise<FocusSession | undefined> {
    return this.focusSessions.get(id);
  }

  async getFocusSessionsByUser(userId: number): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values()).filter(
      session => session.userId === userId
    );
  }

  async getFocusSessionsByUserAndTimeRange(userId: number, startTime: Date, endTime: Date): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values()).filter(
      session => session.userId === userId && 
                session.startTime >= startTime &&
                (session.endTime ? session.endTime <= endTime : true)
    );
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const id = this.sessionIdCounter++;
    const newSession: FocusSession = { ...session, id };
    this.focusSessions.set(id, newSession);
    return newSession;
  }

  async updateFocusSession(id: number, sessionUpdate: Partial<FocusSession>): Promise<FocusSession | undefined> {
    const session = this.focusSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionUpdate };
    this.focusSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteFocusSession(id: number): Promise<boolean> {
    return this.focusSessions.delete(id);
  }

  // Blocked websites methods
  async getBlockedWebsite(id: number): Promise<BlockedWebsite | undefined> {
    return this.blockedWebsites.get(id);
  }

  async getBlockedWebsitesByUser(userId: number): Promise<BlockedWebsite[]> {
    return Array.from(this.blockedWebsites.values()).filter(
      website => website.userId === userId
    );
  }

  async createBlockedWebsite(website: InsertBlockedWebsite): Promise<BlockedWebsite> {
    const id = this.blockedWebsiteIdCounter++;
    const newBlockedWebsite: BlockedWebsite = { ...website, id };
    this.blockedWebsites.set(id, newBlockedWebsite);
    return newBlockedWebsite;
  }

  async deleteBlockedWebsite(id: number): Promise<boolean> {
    return this.blockedWebsites.delete(id);
  }

  // Settings methods
  async getSettingsByUser(userId: number): Promise<Settings | undefined> {
    return Array.from(this.userSettings.values()).find(
      settings => settings.userId === userId
    );
  }

  async createOrUpdateSettings(settingsData: InsertSettings): Promise<Settings> {
    const existingSettings = await this.getSettingsByUser(settingsData.userId);
    
    if (existingSettings) {
      const updatedSettings = { ...existingSettings, ...settingsData };
      this.userSettings.set(existingSettings.id, updatedSettings);
      return updatedSettings;
    } else {
      const id = this.settingsIdCounter++;
      const newSettings: Settings = { ...settingsData, id };
      this.userSettings.set(id, newSettings);
      return newSettings;
    }
  }
}

export const storage = new MemStorage();
