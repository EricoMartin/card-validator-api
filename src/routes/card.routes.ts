import { Router } from "express";
import { validateCardEndpoint } from "../controllers/card.controller";

const router = Router();

router.post("/validate", validateCardEndpoint);

export default router;