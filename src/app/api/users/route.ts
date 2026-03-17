import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      phone: true,
      department: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { username, name, email, password, role, permissions, phone, department } = body;

  if (!username || !name || !password) {
    return NextResponse.json({ error: "Tên đăng nhập, họ tên và mật khẩu là bắt buộc" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      name,
      email: email || null,
      password: hashed,
      role: role || "STAFF",
      permissions: permissions || "{}",
      phone,
      department,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
