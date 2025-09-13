// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  restaurants;
  reviews;
  constructor() {
    this.restaurants = /* @__PURE__ */ new Map();
    this.reviews = /* @__PURE__ */ new Map();
  }
  async getRestaurants() {
    const restaurantList = Array.from(this.restaurants.values());
    const restaurantsWithStats = [];
    for (const restaurant of restaurantList) {
      const reviews2 = Array.from(this.reviews.values()).filter(
        (review) => review.restaurantId === restaurant.id
      );
      if (reviews2.length === 0) {
        restaurantsWithStats.push({
          ...restaurant,
          averagePrice: 0,
          averageQuality: 0,
          averageBureaucracy: 0,
          mostCommonFoodOptions: "none",
          reviewCount: 0,
          reviews: []
        });
        continue;
      }
      const averagePrice = reviews2.reduce((sum, review) => sum + review.price, 0) / reviews2.length;
      const averageQuality = reviews2.reduce((sum, review) => sum + review.quality, 0) / reviews2.length;
      const averageBureaucracy = reviews2.reduce((sum, review) => sum + review.bureaucracy, 0) / reviews2.length;
      const foodOptionsCount = reviews2.reduce((acc, review) => {
        acc[review.foodOptionsForAugusto] = (acc[review.foodOptionsForAugusto] || 0) + 1;
        return acc;
      }, {});
      const mostCommonFoodOptions = Object.entries(foodOptionsCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "none";
      restaurantsWithStats.push({
        ...restaurant,
        averagePrice: Math.round(averagePrice * 100) / 100,
        averageQuality: Math.round(averageQuality * 10) / 10,
        averageBureaucracy: Math.round(averageBureaucracy * 10) / 10,
        mostCommonFoodOptions,
        reviewCount: reviews2.length,
        reviews: reviews2
      });
    }
    return restaurantsWithStats.sort((a, b) => b.averageQuality - a.averageQuality);
  }
  async getRestaurant(id) {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) return void 0;
    const reviews2 = Array.from(this.reviews.values()).filter(
      (review) => review.restaurantId === restaurant.id
    );
    if (reviews2.length === 0) {
      return {
        ...restaurant,
        averagePrice: 0,
        averageQuality: 0,
        averageBureaucracy: 0,
        mostCommonFoodOptions: "none",
        reviewCount: 0,
        reviews: []
      };
    }
    const averagePrice = reviews2.reduce((sum, review) => sum + review.price, 0) / reviews2.length;
    const averageQuality = reviews2.reduce((sum, review) => sum + review.quality, 0) / reviews2.length;
    const averageBureaucracy = reviews2.reduce((sum, review) => sum + review.bureaucracy, 0) / reviews2.length;
    const foodOptionsCount = reviews2.reduce((acc, review) => {
      acc[review.foodOptionsForAugusto] = (acc[review.foodOptionsForAugusto] || 0) + 1;
      return acc;
    }, {});
    const mostCommonFoodOptions = Object.entries(foodOptionsCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "none";
    return {
      ...restaurant,
      averagePrice: Math.round(averagePrice * 100) / 100,
      averageQuality: Math.round(averageQuality * 10) / 10,
      averageBureaucracy: Math.round(averageBureaucracy * 10) / 10,
      mostCommonFoodOptions,
      reviewCount: reviews2.length,
      reviews: reviews2.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    };
  }
  async createRestaurant(insertRestaurant) {
    const id = randomUUID();
    const restaurant = {
      id,
      name: insertRestaurant.name,
      operatingHours: insertRestaurant.operatingHours || void 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.restaurants.set(id, restaurant);
    const initialReview = {
      id: randomUUID(),
      restaurantId: id,
      userName: "Sistema",
      price: insertRestaurant.initialPrice,
      quality: insertRestaurant.initialQuality,
      foodOptionsForAugusto: insertRestaurant.initialFoodOptionsForAugusto,
      bureaucracy: insertRestaurant.initialBureaucracy,
      comment: "Avalia\xE7\xE3o inicial do restaurante",
      photos: insertRestaurant.photos || [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.reviews.set(initialReview.id, initialReview);
    return restaurant;
  }
  async getReviewsForRestaurant(restaurantId) {
    return Array.from(this.reviews.values()).filter((review) => review.restaurantId === restaurantId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createReview(insertReview) {
    const id = randomUUID();
    const review = {
      ...insertReview,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.reviews.set(id, review);
    return review;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { z } from "zod";
var restaurants = z.object({
  id: z.string(),
  name: z.string(),
  operatingHours: z.string().optional(),
  createdAt: z.date()
});
var reviews = z.object({
  id: z.string(),
  restaurantId: z.string(),
  userName: z.string(),
  price: z.number().min(0).max(5),
  quality: z.number().min(0).max(5),
  foodOptionsForAugusto: z.enum(["many", "some", "few", "none"]),
  bureaucracy: z.number().min(0).max(5),
  comment: z.string().optional(),
  photos: z.array(z.string()).optional(),
  createdAt: z.date()
});
var insertRestaurantSchema = z.object({
  name: z.string().min(1, "Nome \xE9 obrigat\xF3rio"),
  operatingHours: z.string().optional(),
  initialPrice: z.number().min(0).max(5),
  initialQuality: z.number().min(0).max(5),
  initialFoodOptionsForAugusto: z.enum(["many", "some", "few", "none"]),
  initialBureaucracy: z.number().min(0).max(5),
  photos: z.array(z.string()).optional()
});
var insertReviewSchema = z.object({
  restaurantId: z.string(),
  userName: z.string().min(1, "Nome \xE9 obrigat\xF3rio"),
  price: z.number().min(0).max(5),
  quality: z.number().min(0).max(5),
  foodOptionsForAugusto: z.enum(["many", "some", "few", "none"]),
  bureaucracy: z.number().min(0).max(5),
  comment: z.string().optional(),
  photos: z.array(z.string()).optional()
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/restaurants", async (req, res) => {
    try {
      const restaurants2 = await storage.getRestaurants();
      res.json(restaurants2);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar restaurantes" });
    }
  });
  app2.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante n\xE3o encontrado" });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar restaurante" });
    }
  });
  app2.post("/api/restaurants", async (req, res) => {
    try {
      const validatedData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(validatedData);
      res.status(201).json(restaurant);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error });
      }
      res.status(500).json({ message: "Erro ao criar restaurante" });
    }
  });
  app2.post("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        restaurantId: req.params.id
      });
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante n\xE3o encontrado" });
      }
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ message: "Dados inv\xE1lidos", errors: error });
      }
      res.status(500).json({ message: "Erro ao criar avalia\xE7\xE3o" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
