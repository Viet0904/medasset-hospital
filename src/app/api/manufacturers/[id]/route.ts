import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const mfr = await prisma.manufacturer.update({ where: { id }, data: { name: body.name, website: body.website, phone: body.phone } });
    return NextResponse.json(mfr);
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Nhà sản xuất đã tồn tại" }, { status: 400 });
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.manufacturer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xóa nhà sản xuất" }, { status: 500 });
  }
}
