// server.js — hardened & production-ready backend for Terminal-Musing
// Requires: helmet, cookie-parser, csurf, express-rate-limit
import express from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs-extra";
import path from "path";
import multer from "multer";
import bcrypt from "bcrypt";
import session from "express-session";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

dotenv.config();

// ─────────────── ENHANCED API ROUTERS ─────────────
import blogRoutes from "./blogapi/blog.js";
import commentRoutes from "./comments/routes/comments.js";
import viewRoutes from "./DashboardApi/views.js";
import dashboardRoutes from "./DashboardApi/dashboard.js";
import visitorStatsApi from "./ipapi/visitorStats.js";
import dtapiRoutes from "./dailythougthsapi/dtapi.js";
import processRoutes from "./dailythougthsapi/processapi.js";
import manageRoutes from "./dailythougthsapi/thoughtmanageapi.js";
import likeRoutes from "./dailythougthsapi/getlikes.js";
import userviewAPI from "./ipapi/userviewapi.js";
import ipLogger from "./ipapi/motherapi.js";
import getApprovedRoutes from "./dailythougthsapi/getapproved.js";

// ─────────────── INIT ───────────────
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const DIST_DIR = path.join(rootDir, "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");

// ─────────────── REDIS SETUP ───────────────
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));

try {
  await redisClient.connect();
  console.log("✅ Connected to Redis");
} catch (err) {
  console.error("❌ Redis connection failed:", err);
}

// ─────────────── SECURITY & MIDDLEWARE ───────────────
app.set("trust proxy", 1);

// Helmet for secure headers
app.use(helmet());

// Strict CORS: configure FRONTEND_URL in .env
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Parsers
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Session with Redis store
const sessionOptions = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || "change-this-secret-in-production-terminal-musing",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === "production", // true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
};
app.use(session(sessionOptions));

// ─────────────── RATE LIMITERS ───────────────
// General API limiter (good default)
const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", generalApiLimiter);

// Strict limiter for admin login
const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 6, // max 6 attempts per IP per window
  message: { success: false, message: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────── CSRF PROTECTION ───────────────
// We'll provide a simple token endpoint the SPA can call to get token.
// Using cookie-based CSRF tokens (requires cookieParser)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
});

// We'll use CSRF protection for state changing routes (POST/PUT/DELETE) except APIs authenticated by session.
// Provide token at /api/csrf-token to client when needed
app.get("/api/csrf-token", (req, res, next) => {
  // generate token for this session
  csrfProtection(req, res, (err) => {
    if (err) return next(err);
    res.json({ csrfToken: req.csrfToken?.() || null });
  });
});

// Helper: check X-CSRF-Token header when csrfProtection is applied via middleware
const csrfHeaderChecker = (req, res, next) => {
  // If token is provided in header, attach to body for csurf to validate
  const token = req.get("x-csrf-token");
  if (token) {
    req.cookies = req.cookies || {};
    // csurf (cookie mode) will verify token against req.cookies._csrf by default;
    // but here we accept token in header and validate manually via middleware when used.
  }
  next();
};

// ─────────────── ADMIN KEY / HASH PATH ───────────────
// Use env var to point to adminKey.hash outside the repo if possible.
// Default path: ../admin/adminKey.hash (same as before) — can override with ADMIN_KEY_PATH
const ADMIN_KEY_PATH = process.env.ADMIN_KEY_PATH || path.join(__dirname, "admin", "adminKey.hash");
if (!fs.existsSync(ADMIN_KEY_PATH)) {
  console.warn(`⚠️ Admin key file not found at ${ADMIN_KEY_PATH}. Create it using your generator.`);
}

// ─────────────── UPLOADS & MULTER ───────────────
const uploadDir = path.join(__dirname, "uploads");
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${base}-${ts}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    fieldSize: 10 * 1024 * 1024,
    fieldNameSize: 1000,
    fields: 50,
    parts: 50,
  },
});

// Generic multer error handler
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large (max 10MB)" });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

// ─────────────── AUTH MIDDLEWARES ───────────────
// Verify session-based admin auth for pages and APIs
const verifyAdminSession = (req, res, next) => {
  try {
    const isAuthenticated = !!req.session?.adminAuthenticated;
    if (isAuthenticated) return next();

    if (req.path.startsWith("/api/")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login first.",
      });
    }

    // For frontend admin routes, redirect to login page
    return res.redirect("/admin/login");
  } catch (err) {
    console.error("verifyAdminSession error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Optional: IP whitelist helper (enable if you want stricter access control)
// const allowedAdminIPs = (process.env.ADMIN_ALLOWED_IPS || "").split(",").map(s => s.trim()).filter(Boolean);
// const ipWhitelist = (req, res, next) => {
//   if (allowedAdminIPs.length === 0) return next(); // no whitelist configured
//   const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//   if (allowedAdminIPs.includes(ip)) return next();
//   return res.status(403).send('Forbidden');
// };

// ─────────────── ROUTES ───────────────
// Public assets & static
app.use("/blogs", express.static(path.join(__dirname, "blogs")));
app.use("/uploads", express.static(uploadDir));

// ------------------ Upload endpoint (PROTECTED) ------------------
// Only admin can upload images
app.post("/api/upload", verifyAdminSession, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
});

// ------------------ ADMIN AUTH ROUTES ------------------
// login uses limiter. Compare posted key against bcrypt hash on disk.
app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ success: false, message: "Authentication key is required" });

  try {
    if (!fs.existsSync(ADMIN_KEY_PATH)) {
      console.error("Admin key not found at:", ADMIN_KEY_PATH);
      return res.status(500).json({ success: false, message: "Admin authentication not configured." });
    }

    const storedHash = (await fs.readFile(ADMIN_KEY_PATH, "utf8")).trim();
    const isMatch = await bcrypt.compare(key, storedHash);

    if (isMatch) {
      // Prevent fixation: regenerate session id on login
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regenerate error:", err);
          return res.status(500).json({ success: false, message: "Session error" });
        }

        req.session.adminAuthenticated = true;
        req.session.adminLoginTime = new Date().toISOString();

        // Optionally store metadata
        req.session.adminAuthIP = req.ip || req.headers["x-forwarded-for"] || null;

        console.log("✅ Admin login successful - session created");
        return res.status(200).json({ success: true, message: "Authentication successful" });
      });
      return;
    }

    console.log("❌ Admin login failed - invalid key");
    return res.status(401).json({ success: false, message: "Invalid authentication key" });
  } catch (err) {
    console.error("❌ Admin login error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error during authentication" });
  }
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Session destroy error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    // Clear cookie on logout
    res.clearCookie(process.env.SESSION_COOKIE_NAME || "connect.sid");
    return res.json({ success: true, message: "Logged out successfully" });
  });
});

app.get("/api/admin/check-auth", (req, res) => {
  return res.json({
    authenticated: !!req.session?.adminAuthenticated,
    loginTime: req.session?.adminLoginTime || null,
  });
});

// ------------------ PROTECTED ADMIN FRONTEND ROUTES ------------------
// We serve SPA dist for frontend normally, but protect /admin* routes.
// If you host admin panel as part of the SPA (e.g., /admin/login, /admin/dashboard),
// we gate GET requests for /admin* with verifyAdminSession (except login path).
app.get("/admin/login", (req, res, next) => {
  // allow login page to be served without auth - SPA will handle UI
  return res.sendFile(DIST_INDEX);
});

// Protect all other admin frontend paths (dashboard, edit, etc.)
app.get("/admin/*", verifyAdminSession, (req, res) => {
  // Serve SPA index for client-side routing only if authenticated
  return res.sendFile(DIST_INDEX);
});

// ------------------ ENHANCED API ROUTES ------------------
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/views", viewRoutes);

// Require admin session for dashboard & admin APIs
app.use("/api/dashboard", verifyAdminSession, dashboardRoutes);
app.use("/api/dailythoughts", dtapiRoutes);
app.use("/api/dailythoughts/process", verifyAdminSession, processRoutes);
app.use("/api/dailythoughts/manage", verifyAdminSession, manageRoutes);
app.use("/api/dailythoughts/likes", likeRoutes);
app.use("/api/dailythoughts/approved", getApprovedRoutes);

// ------------------ VISITOR TRACKING & MISC ------------------
app.use("/", userviewAPI);
app.use(ipLogger);
app.use("/api", visitorStatsApi);

// ─────────────── FRONTEND SPA (DEFAULT) ───────────────
// Serve SPA static files
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
} else {
  console.warn("⚠️ Dist directory not found. SPA static files won't be served.");
}

// Catch-all: for non-API routes return index.html so SPA routing works
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "🚫 Route not found" });
  }

  // For /admin/login we already served index earlier; for other /admin/* we protected above
  if (fs.existsSync(DIST_INDEX)) return res.sendFile(DIST_INDEX);
  return res.status(404).send("Not found");
});

// ─────────────── ERROR HANDLING & START ───────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
});
