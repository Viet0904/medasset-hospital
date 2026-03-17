import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { username, name, email, password, role, permissions, phone, department, active } = body;

  const data: any = { username, name, email: email || null, role, permissions, phone, department };
  if (typeof active === "boolean") data.active = active;
  if (password) data.password = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json(user);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.user.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
