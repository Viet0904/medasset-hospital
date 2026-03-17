import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải nhật ký" }, { status: 500 });
  }
}
