import { prisma } from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createAuthError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function registerUser(data) {
  const name = String(data?.name || "").trim();
  const email = String(data?.email || "")
    .trim()
    .toLowerCase();
  const password = typeof data?.password === "string" ? data.password : "";

  if (!name) {
    throw createAuthError("Name is required.", 400);
  }

  if (name.length < 2) {
    throw createAuthError("Name must be at least 2 characters long.", 400);
  }

  if (!email) {
    throw createAuthError("Email is required.", 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw createAuthError("Enter a valid email address.", 400);
  }

  if (!password.trim()) {
    throw createAuthError("Password is required.", 400);
  }

  if (password.length < 8) {
    throw createAuthError("Password must be at least 8 characters long.", 400);
  }

  const existingUser = await prisma.users.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw createAuthError("An account with this email already exists.", 409);
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      name,
      email,
      password_hash: hash,
      role: "client",
    },
  });

  return user;
}

export async function loginUser(data) {
  const email = String(data?.email || "")
    .trim()
    .toLowerCase();
  const password = typeof data?.password === "string" ? data.password : "";

  if (!email || !password.trim()) {
    throw createAuthError("Email and password are required.", 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw createAuthError("Enter a valid email address.", 400);
  }

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    throw createAuthError("Invalid email or password.", 401);
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw createAuthError("Invalid email or password.", 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
