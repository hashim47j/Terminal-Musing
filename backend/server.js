import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
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
  socket: {
    keepAlive: true,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
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

// ⚡ COMPRESSION - Add this early to compress all responses
app.use(
  compression({
    level: 6, // balance between speed and compression ratio
    threshold: 1024, // only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Strict CORS: configure FRONTEND_URL in .env
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 86400, // cache preflight requests for 24 hours
  })
);

// ⚡ OPTIMIZED PARSERS - Reduced default limits
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
app.use(cookieParser());

// ⚡ SESSION OPTIMIZATION - Skip session for static assets
const sessionOptions = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || "change-this-secret-in-production-terminal-musing",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
};

const sessionMiddleware = session(sessionOptions);

// Smart session middleware - skip for static assets
app.use((req, res, next) => {
  // Skip session processing for static files
  if (
    req.path.startsWith("/uploads") ||
    req.path.startsWith("/blogs") ||
    req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|map)$/i)
  ) {
    return next();
  }
  sessionMiddleware(req, res, next);
});

// ─────────────── RATE LIMITERS ───────────────
// ⚡ OPTIMIZED - More lenient for authenticated users
const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200, // increased from 120
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.session?.adminAuthenticated, // skip for authenticated admins
});
app.use("/api", generalApiLimiter);

// Strict limiter for admin login
const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  message: { success: false, message: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────── CSRF PROTECTION ───────────────
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
});

app.get("/api/csrf-token", (req, res, next) => {
  csrfProtection(req, res, (err) => {
    if (err) return next(err);
    res.json({ csrfToken: req.csrfToken?.() || null });
  });
});

const csrfHeaderChecker = (req, res, next) => {
  const token = req.get("x-csrf-token");
  if (token) {
    req.cookies = req.cookies || {};
  }
  next();
};

// ─────────────── ADMIN KEY / HASH PATH ───────────────
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
    fileSize: 10 * 1024 * 1024,
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

    return res.redirect("/admin/login");
  } catch (err) {
    console.error("verifyAdminSession error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────── STATIC ASSETS (OPTIMIZED) ───────────────
// ⚡ PERFORMANCE: Serve static files with aggressive caching
app.use(
  "/blogs",
  express.static(path.join(__dirname, "blogs"), {
    maxAge: "1d", // cache for 1 day
    etag: true,
    lastModified: true,
    immutable: false,
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour for HTML
      } else {
        res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day for assets
      }
    },
  })
);

app.use(
  "/uploads",
  express.static(uploadDir, {
    maxAge: "1y", // uploads are immutable
    etag: true,
    lastModified: true,
    immutable: true,
  })
);

// ─────────────── ROUTES ───────────────

// ------------------ UPLOAD & BLOG ENDPOINTS (PROTECTED) ------------------
// ⚡ Higher limits only for upload routes
app.post(
  "/api/blogs",
  verifyAdminSession,
  bodyParser.json({ limit: "10mb" }),
  async (req, res) => {
    try {
      const blogData = req.body;
      return res.status(201).json({ success: true, message: "Blog published successfully", blog: blogData });
    } catch (err) {
      console.error("❌ Blog creation error:", err);
      return res.status(500).json({ success: false, message: "Internal server error while publishing blog" });
    }
  }
);

app.post("/api/upload", verifyAdminSession, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.status(200).json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
  } catch (err) {
    console.error("❌ File upload error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during file upload" });
  }
});

// ------------------ ADMIN AUTH ROUTES ------------------
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
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regenerate error:", err);
          return res.status(500).json({ success: false, message: "Session error" });
        }

        req.session.adminAuthenticated = true;
        req.session.adminLoginTime = new Date().toISOString();
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
app.get("/admin/login", (req, res, next) => {
  return res.sendFile(DIST_INDEX);
});

app.get("/admin/*", verifyAdminSession, (req, res) => {
  return res.sendFile(DIST_INDEX);
});

// ------------------ ENHANCED API ROUTES ------------------
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/views", viewRoutes);
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

// ─────────────── FRONTEND SPA (OPTIMIZED) ───────────────
// ⚡ Serve SPA static files with optimized caching
if (fs.existsSync(DIST_DIR)) {
  app.use(
    express.static(DIST_DIR, {
      maxAge: process.env.NODE_ENV === "production" ? "1h" : "0",
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Aggressive caching for JS/CSS with hashes
        if (path.match(/\.[a-f0-9]{8,}\.(js|css)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
        // Short cache for HTML
        else if (path.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, must-revalidate");
        }
        // Medium cache for other assets
        else {
          res.setHeader("Cache-Control", "public, max-age=3600");
        }
      },
    })
  );
} else {
  console.warn("⚠️ Dist directory not found. SPA static files won't be served.");
}

// Catch-all: for non-API routes return index.html so SPA routing works
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "🚫 Route not found" });
  }

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
  console.log(`⚡ NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`⚡ Compression: enabled`);
  console.log(`⚡ Caching: optimized`);
});
