import { Router } from "express";
import type { Auth } from "../config/auth.config.js";
import { blueprintRoutes } from "./blueprint.routes.js";
import { reviewRoutes } from "./review.routes.js";
import { aiRoutes } from "./ai.routes.js";
import { dashboardRoutes } from "./dashboard.routes.js";
import { adminRoutes } from "./admin.routes.js";

export function createApiRouter(auth: Auth) {
    const router = Router();

    router.use("/blueprints", blueprintRoutes(auth));
    router.use("/", reviewRoutes(auth));
    router.use("/ai", aiRoutes(auth));
    router.use("/dashboard", dashboardRoutes(auth));
    router.use("/admin", adminRoutes(auth));

    return router;
}