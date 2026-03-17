import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { assets: true } } },
    });
    return NextResponse.json(manufacturers);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải nhà sản xuất" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mfr = await prisma.manufacturer.create({ data: { name: body.name, website: body.website, phone: body.phone } });
    return NextResponse.json(mfr, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Nhà sản xuất đã tồn tại" }, { status: 400 });
    return NextResponse.json({ error: "Lỗi tạo nhà sản xuất" }, { status: 500 });
  }
}
