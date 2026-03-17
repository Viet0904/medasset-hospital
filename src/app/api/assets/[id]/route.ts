import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        manufacturer: true,
        supplier: true,
        checkouts: { include: { user: true }, orderBy: { createdAt: "desc" } },
        maintenanceLogs: { include: { performedBy: true }, orderBy: { createdAt: "desc" } },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Không tìm thấy thiết bị" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải thông tin" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        assetTag: body.assetTag,
        name: body.name,
        serial: body.serial || null,
        status: body.status,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchaseCost: body.purchaseCost ? parseFloat(body.purchaseCost) : null,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
        notes: body.notes || null,
        categoryId: body.categoryId || null,
        locationId: body.locationId || null,
        manufacturerId: body.manufacturerId || null,
        supplierId: body.supplierId || null,
      },
      include: { category: true, location: true, manufacturer: true },
    });

    return NextResponse.json(asset);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Mã thiết bị đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi cập nhật thiết bị" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xóa thiết bị" }, { status: 500 });
  }
}
