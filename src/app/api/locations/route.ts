import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { assets: true } } },
    });
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải vị trí" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const location = await prisma.location.create({
      data: { name: body.name, description: body.description, address: body.address },
    });
    return NextResponse.json(location, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Vị trí đã tồn tại" }, { status: 400 });
    return NextResponse.json({ error: "Lỗi tạo vị trí" }, { status: 500 });
  }
}
