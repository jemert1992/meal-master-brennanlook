import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { v4 as uuidv4 } from "uuid";

// This is just a demo setup using a simple local authentication
// In a real application, you would use a proper authentication system

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "nutriplan-demo-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for both environments to ensure it works consistently
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Simple local strategy for demo purposes
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        // For demo, we'll auto-create users
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        
        if (existingUser) {
          return done(null, {
            id: existingUser.id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            profileImageUrl: existingUser.profileImageUrl
          });
        }
        
        // Create a new user for demo purposes
        const userId = uuidv4();
        const newUser = await storage.upsertUser({
          id: userId,
          email: email,
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: "https://ui-avatars.com/api/?name=Demo+User&background=random"
        });
        
        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Set up auth routes
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Redirect to homepage
        return res.redirect('/');
      });
    })(req, res, next);
  });
  
  // For demo purposes, simulate login
  app.get('/api/demo-login', async (req, res, next) => {
    const demoEmail = "demo@example.com";
    
    try {
      // Create or find demo user
      let [demoUser] = await db.select().from(users).where(eq(users.email, demoEmail));
      
      if (!demoUser) {
        const userId = uuidv4();
        demoUser = await storage.upsertUser({
          id: userId,
          email: demoEmail,
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: "https://ui-avatars.com/api/?name=Demo+User&background=random"
        });
      }
      
      req.login(demoUser, (err) => {
        if (err) return next(err);
        return res.redirect('/');
      });
    } catch (err) {
      next(err);
    }
  });
  
  app.get('/api/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  console.log('Auth setup completed successfully');
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
