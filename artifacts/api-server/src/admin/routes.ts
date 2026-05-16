import { Router, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { productDb, makeSlug, getUniqueSlug } from "./db.js";

declare module "express-session" {
  interface SessionData {
    loggedIn?: boolean;
    username?: string;
    flash?: Array<{ type: string; message: string }>;
  }
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "desicart2024";

function resolveFromRoot(...segments: string[]): string {
  const cwd = process.cwd();
  const inApiServer = /[/\\]api-server$/.test(cwd);
  return inApiServer
    ? path.resolve(cwd, ...segments)
    : path.resolve(cwd, "artifacts/api-server", ...segments);
}

export const UPLOADS_DIR =
  process.env.UPLOADS_DIR || resolveFromRoot("uploads");

export const VIEWS_DIR = resolveFromRoot("src/admin/views");

function setFlash(req: Request, type: string, message: string) {
  if (!req.session.flash) req.session.flash = [];
  req.session.flash.push({ type, message });
}

function getFlash(req: Request) {
  const flash = req.session.flash || [];
  req.session.flash = [];
  return flash;
}

function requireLogin(req: Request, res: Response, next: () => void) {
  if (!req.session.loggedIn) {
    return res.redirect("/admin-panel/login");
  }
  next();
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID().replace(/-/g, "")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const router = Router();

router.get(["/admin-panel", "/admin-panel/"], (_req, res) => {
  res.redirect("/admin-panel/login");
});

router.get("/admin-panel/login", (req, res) => {
  if (req.session.loggedIn) return res.redirect("/admin-panel/dashboard");
  res.render("login", { error: null });
});

router.post("/admin-panel/login", (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (username?.trim() === ADMIN_USERNAME && password?.trim() === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    req.session.username = username;
    return res.redirect("/admin-panel/dashboard");
  }
  res.render("login", { error: "Invalid username or password. Please try again." });
});

router.get("/admin-panel/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin-panel/login"));
});

router.get("/admin-panel/dashboard", requireLogin, (req, res) => {
  const search = (req.query["search"] as string || "").trim();
  const category = (req.query["category"] as string || "").trim();
  const products = productDb.getAll(search || undefined, category || undefined);
  const categories = productDb.categories();
  const total = productDb.count();
  res.render("dashboard", {
    products,
    categories,
    total,
    search,
    selectedCategory: category,
    username: req.session.username || "admin",
    flash: getFlash(req),
    currentPath: "/admin-panel/dashboard",
  });
});

router.get("/admin-panel/products/add", requireLogin, (req, res) => {
  res.render("add_product", {
    formData: {},
    username: req.session.username || "admin",
    flash: getFlash(req),
    currentPath: "/admin-panel/products/add",
  });
});

router.post("/admin-panel/products/add", requireLogin, upload.single("image"), (req, res) => {
  const { title, tagline, description, price, original_price, category, badge, features } =
    req.body as Record<string, string>;

  if (!title?.trim()) {
    setFlash(req, "danger", "Title is required.");
    return res.render("add_product", {
      formData: req.body,
      username: req.session.username || "admin",
      flash: getFlash(req),
      currentPath: "/admin-panel/products/add",
    });
  }

  const priceNum = parseFloat(price);
  const originalPriceNum = original_price ? parseFloat(original_price) : null;
  if (isNaN(priceNum)) {
    setFlash(req, "danger", "Price must be a valid number.");
    return res.render("add_product", {
      formData: req.body,
      username: req.session.username || "admin",
      flash: getFlash(req),
      currentPath: "/admin-panel/products/add",
    });
  }

  const featuresJson = JSON.stringify(
    (features || "").split("\n").map((f) => f.trim()).filter(Boolean)
  );
  const slug = getUniqueSlug(makeSlug(title.trim()));
  const image_path = req.file ? req.file.filename : null;

  productDb.insert({
    slug,
    title: title.trim(),
    tagline: tagline?.trim() || "",
    description: description?.trim() || "",
    features: featuresJson,
    price: priceNum,
    original_price: originalPriceNum,
    category: category?.trim() || null,
    badge: badge?.trim() || null,
    image_path,
  });

  setFlash(req, "success", `Product "${title.trim()}" added successfully!`);
  res.redirect("/admin-panel/dashboard");
});

router.get("/admin-panel/products/edit/:id", requireLogin, (req, res) => {
  const product = productDb.getById(Number(req.params["id"]));
  if (!product) {
    setFlash(req, "danger", "Product not found.");
    return res.redirect("/admin-panel/dashboard");
  }
  let featuresText = "";
  try {
    featuresText = product.features ? JSON.parse(product.features).join("\n") : "";
  } catch {}
  res.render("edit_product", {
    product,
    featuresText,
    username: req.session.username || "admin",
    flash: getFlash(req),
    currentPath: `/admin-panel/products/edit/${product.id}`,
  });
});

router.post("/admin-panel/products/edit/:id", requireLogin, upload.single("image"), (req, res) => {
  const id = Number(req.params["id"]);
  const product = productDb.getById(id);
  if (!product) {
    setFlash(req, "danger", "Product not found.");
    return res.redirect("/admin-panel/dashboard");
  }

  const { title, tagline, description, price, original_price, category, badge, features } =
    req.body as Record<string, string>;

  if (!title?.trim()) {
    setFlash(req, "danger", "Title is required.");
    return res.redirect(`/admin-panel/products/edit/${id}`);
  }

  const priceNum = parseFloat(price);
  const originalPriceNum = original_price ? parseFloat(original_price) : null;
  if (isNaN(priceNum)) {
    setFlash(req, "danger", "Price must be a valid number.");
    return res.redirect(`/admin-panel/products/edit/${id}`);
  }

  const featuresJson = JSON.stringify(
    (features || "").split("\n").map((f) => f.trim()).filter(Boolean)
  );

  let image_path = product.image_path;
  if (req.file) {
    if (image_path) {
      const old = path.join(UPLOADS_DIR, image_path);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }
    image_path = req.file.filename;
  }

  productDb.update(id, {
    title: title.trim(),
    tagline: tagline?.trim() || "",
    description: description?.trim() || "",
    features: featuresJson,
    price: priceNum,
    original_price: originalPriceNum,
    category: category?.trim() || null,
    badge: badge?.trim() || null,
    image_path,
  });

  setFlash(req, "success", `Product "${title.trim()}" updated!`);
  res.redirect("/admin-panel/dashboard");
});

router.post("/admin-panel/products/delete/:id", requireLogin, (req, res) => {
  const id = Number(req.params["id"]);
  const product = productDb.getById(id);
  if (product) {
    if (product.image_path) {
      const old = path.join(UPLOADS_DIR, product.image_path);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }
    productDb.delete(id);
    setFlash(req, "warning", `Product "${product.title}" deleted.`);
  }
  res.redirect("/admin-panel/dashboard");
});

router.get("/admin-panel/api/products", (_req, res) => {
  const products = productDb.getAll();
  const result = products.map((p) => {
    let features: string[] = [];
    try {
      features = p.features ? JSON.parse(p.features) : [];
    } catch {}
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      tagline: p.tagline || "",
      description: p.description || "",
      features,
      price: p.price,
      original_price: p.original_price,
      category: p.category || "",
      badge: p.badge || "",
      image_url: p.image_path ? `/admin-panel/static/uploads/${p.image_path}` : null,
    };
  });
  res.json(result);
});

export default router;
