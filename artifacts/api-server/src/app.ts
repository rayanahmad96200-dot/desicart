import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import path from "path";
import fs from "fs";
import { logger } from "./lib/logger.js";
import router from "./routes/index.js";
import adminRouter, { UPLOADS_DIR, VIEWS_DIR } from "./admin/routes.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "desicart-session-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.set("view engine", "ejs");
app.set("views", VIEWS_DIR);

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use("/admin-panel/static/uploads", express.static(UPLOADS_DIR));

app.use(adminRouter);

app.use("/api", router);

const STATIC_DIR =
  process.env.STATIC_DIR ||
  path.resolve(process.cwd(), "artifacts/desicart/dist/public");

if (fs.existsSync(STATIC_DIR)) {
  app.use(express.static(STATIC_DIR));
  app.get("*", (_req, res, next) => {
    if (_req.path.startsWith("/admin-panel") || _req.path.startsWith("/api")) {
      return next();
    }
    const indexPath = path.join(STATIC_DIR, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

export default app;
