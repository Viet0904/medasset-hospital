import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { asset: true, performedBy: true },
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tải bảo trì" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const log = await prisma.maintenanceLog.create({
      data: {
        assetId: body.assetId,
        performedById: body.performedById,
        maintenanceType: body.maintenanceType,
        title: body.title,
        description: body.description,
        cost: body.cost ? parseFloat(body.cost) : null,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "IN_PROGRESS",
      },
      include: { asset: true, performedBy: true },
    });
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tạo bảo trì" }, { status: 500 });
  }
}
