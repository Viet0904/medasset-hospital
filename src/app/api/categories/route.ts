import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { assets: true } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải danh mục" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = await prisma.category.create({
      data: { name: body.name, description: body.description, icon: body.icon },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Danh mục đã tồn tại" }, { status: 400 });
    return NextResponse.json({ error: "Lỗi tạo danh mục" }, { status: 500 });
  }
}
