import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ error: "Không tìm thấy thiết bị" }, { status: 404 });
    }
    if (asset.status !== "AVAILABLE") {
      return NextResponse.json({ error: "Thiết bị không sẵn sàng để cấp phát" }, { status: 400 });
    }

    const [checkout] = await Promise.all([
      prisma.assetCheckout.create({
        data: {
          assetId: id,
          userId: body.userId,
          notes: body.notes,
          expectedReturn: body.expectedReturn ? new Date(body.expectedReturn) : null,
        },
        include: { user: true, asset: true },
      }),
      prisma.asset.update({
        where: { id },
        data: { status: "IN_USE", assignedToId: body.userId },
      }),
    ]);

    return NextResponse.json(checkout, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cấp phát thiết bị" }, { status: 500 });
  }
}
