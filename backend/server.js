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
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

dotenv.config();

// ─────────────── VALIDATE ENV ───────────────
if (!process.env.SESSION_SECRET) {
  throw new Error("❌ SESSION_SECRET must be set in .env");
}

// ─────────────── API ROUTERS ───────────────
import blogRoutes from "./blogapi/blog.js";
import commentRoutes from "./comments/routes/comments.js";
import viewRoutes from "./DashboardApi/views.js";
import dashboardRoutes from "./DashboardApi/dashboard.js";
import dtapiRoutes from "./dailythougthsapi/dtapi.js";
import processRoutes from "./dailythougthsapi/processapi.js";
import manageRoutes from "./dailythougthsapi/thoughtmanageapi.js";
import likeRoutes from "./dailythougthsapi/getlikes.js";
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

// ─────────────── REDIS ───────────────
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    keepAlive: true,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));

try {
  await redisClient.connect();
  console.log("✅ Connected to Redis");
} catch (err) {
  console.error("❌ Redis connection failed:", err);
}

// ─────────────── SECURITY ───────────────
app.set("trust proxy", 1);
app.use(helmet());

// ─────────────── COMPRESSION ───────────────
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

// ─────────────── CORS ───────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://terminalmusing.space",
  "https://www.terminalmusing.space",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 86400,
  })
);

// ─────────────── PARSERS ───────────────
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
app.use(cookieParser());

// ─────────────── SESSION ───────────────
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
});

// Skip session for static assets
app.use((req, res, next) => {
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
const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.session?.adminAuthenticated,
});
app.use("/api", generalApiLimiter);

const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  message: { success: false, message: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────── ADMIN KEY ───────────────
const ADMIN_KEY_PATH =
  process.env.ADMIN_KEY_PATH || path.join(__dirname, "admin", "adminKey.hash");
if (!fs.existsSync(ADMIN_KEY_PATH)) {
  console.warn(`⚠️ Admin key file not found at ${ADMIN_KEY_PATH}.`);
}

// ─────────────── MULTER ───────────────
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

// ─────────────── AUTH MIDDLEWARE ───────────────
const verifyAdminSession = (req, res, next) => {
  try {
    if (req.session?.adminAuthenticated) return next();
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

// ─────────────── STATIC ASSETS ───────────────
app.use(
  "/blogs",
  express.static(path.join(__dirname, "blogs"), {
    maxAge: "1d",
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=3600");
      } else {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    },
  })
);

app.use(
  "/uploads",
  express.static(uploadDir, {
    maxAge: "1y",
    etag: true,
    lastModified: true,
    immutable: true,
  })
);

// ─────────────── ROUTES ───────────────

// Upload
app.post("/api/upload", verifyAdminSession, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.status(200).json({ success: true, imageUrl: `/uploads/${req.file.filename}` });
  } catch (err) {
    console.error("❌ File upload error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during file upload" });
  }
});

// Admin auth
app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ success: false, message: "Authentication key is required" });

  try {
    if (!fs.existsSync(ADMIN_KEY_PATH)) {
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
        req.session.adminAuthIP = req.ip || null;
        console.log("✅ Admin login successful");
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

// Admin frontend
app.get("/admin/login", (_req, res) => res.sendFile(DIST_INDEX));
app.get("/admin/*", verifyAdminSession, (_req, res) => res.sendFile(DIST_INDEX));

// API routes
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/views", viewRoutes);
app.use("/api/dashboard", verifyAdminSession, dashboardRoutes);
app.use("/api/dailythoughts", dtapiRoutes);
app.use("/api/dailythoughts/process", verifyAdminSession, processRoutes);
app.use("/api/dailythoughts/manage", verifyAdminSession, manageRoutes);
app.use("/api/dailythoughts/likes", likeRoutes);
app.use("/api/dailythoughts/approved", getApprovedRoutes);

// Visitor tracking
app.use("/api/visitorstats", verifyAdminSession);
app.use(ipLogger);

// ─────────────── SPA STATIC ───────────────
if (fs.existsSync(DIST_DIR)) {
  app.use(
    express.static(DIST_DIR, {
      maxAge: process.env.NODE_ENV === "production" ? "1h" : "0",
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.match(/\.[a-f0-9]{8,}\.(js|css)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, must-revalidate");
        } else {
          res.setHeader("Cache-Control", "public, max-age=3600");
        }
      },
    })
  );
} else {
  console.warn("⚠️ Dist directory not found.");
}

// Catch-all SPA
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "🚫 Route not found" });
  }
  if (fs.existsSync(DIST_INDEX)) return res.sendFile(DIST_INDEX);
  return res.status(404).send("Not found");
});

// ─────────────── ERROR HANDLERS (must be last) ───────────────
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large (max 10MB)" });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ─────────────── START ───────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
  console.log(`⚡ NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`⚡ Compression: enabled`);
  console.log(`⚡ Caching: optimized`);
});