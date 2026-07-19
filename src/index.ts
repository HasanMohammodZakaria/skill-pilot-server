import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { createAuth } from "./config/auth.config.js"; 
import { createApiRouter } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

async function bootstrap() {
  await connectDB();

  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );

  const auth = createAuth(); 

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json());

  app.use("/api", createApiRouter(auth));

  app.get("/", (_req, res) => {
    res.send("✅ SkillPilot API is running");
  });

  app.use(errorMiddleware);

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});