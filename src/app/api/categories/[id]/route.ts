import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const category = await prisma.category.update({
      where: { id },
      data: { name: body.name, description: body.description, icon: body.icon },
    });
    return NextResponse.json(category);
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Danh mục đã tồn tại" }, { status: 400 });
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const count = await prisma.asset.count({ where: { categoryId: id } });
    if (count > 0) return NextResponse.json({ error: `Không thể xóa: đang có ${count} thiết bị thuộc danh mục này` }, { status: 400 });
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xóa danh mục" }, { status: 500 });
  }
}
