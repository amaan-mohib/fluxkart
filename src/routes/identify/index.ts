import { Router } from "express";
import { computeIdentity } from "./identify.controller";

const router = Router();

router.post("/", computeIdentity);

export default router;
