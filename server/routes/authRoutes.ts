import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { generateToken, requireAuth, AuthenticatedRequest } from "../auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", (req: Request, res: Response) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Full name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: "RECRUITER" as const,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  const token = generateToken({
    userId: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
    role: newUser.role,
  });

  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/demo-login - Instant 1-click recruiter login
router.post("/demo-login", (_req: Request, res: Response) => {
  const user = db.users[0] || {
    id: "usr_recruiter_01",
    fullName: "Sarah Jenkins",
    email: "recruiter@talentrank.ai",
    role: "RECRUITER" as const,
  };

  const token = generateToken({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = db.users.find((u) => u.id === req.user?.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

export default router;
