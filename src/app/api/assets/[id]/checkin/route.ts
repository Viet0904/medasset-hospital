import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const checkout = await prisma.assetCheckout.findFirst({
      where: { assetId: id, checkinDate: null },
      orderBy: { checkoutDate: "desc" },
    });

    if (checkout) {
      await prisma.assetCheckout.update({
        where: { id: checkout.id },
        data: { checkinDate: new Date(), notes: body.notes ? `${checkout.notes || ""} | Thu hồi: ${body.notes}` : checkout.notes },
      });
    }

    await prisma.asset.update({
      where: { id },
      data: { status: "AVAILABLE", assignedToId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi thu hồi thiết bị" }, { status: 500 });
  }
}
