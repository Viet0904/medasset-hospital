import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { assetTag: { contains: search } },
        { serial: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (category) where.categoryId = category;
    if (location) where.locationId = location;

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: { category: true, location: true, manufacturer: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.asset.count({ where }),
    ]);

    return NextResponse.json({
      assets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải danh sách" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const asset = await prisma.asset.create({
      data: {
        assetTag: body.assetTag,
        name: body.name,
        serial: body.serial || null,
        status: body.status || "AVAILABLE",
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

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Mã thiết bị đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi tạo thiết bị" }, { status: 500 });
  }
}
