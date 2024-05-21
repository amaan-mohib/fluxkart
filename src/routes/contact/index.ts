import { Router } from "express";
import { getContacts } from "./contact.controller";

const router = Router();

router.get("/", getContacts);

export default router;
