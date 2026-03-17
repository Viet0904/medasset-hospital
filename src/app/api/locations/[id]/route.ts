import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const location = await prisma.location.update({ where: { id }, data: { name: body.name, description: body.description, address: body.address } });
    return NextResponse.json(location);
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Vị trí đã tồn tại" }, { status: 400 });
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const count = await prisma.asset.count({ where: { locationId: id } });
    if (count > 0) return NextResponse.json({ error: `Không thể xóa: đang có ${count} thiết bị tại vị trí này` }, { status: 400 });
    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xóa vị trí" }, { status: 500 });
  }
}
