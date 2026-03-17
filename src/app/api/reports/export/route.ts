import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "xlsx";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";

    const where: any = {};
    if (status) where.status = status;
    if (category) where.categoryId = category;
    if (location) where.locationId = location;

    const assets = await prisma.asset.findMany({
      where,
      include: { category: true, location: true, manufacturer: true, supplier: true },
      orderBy: { assetTag: "asc" },
    });

    const statusLabels: Record<string, string> = {
      AVAILABLE: "Sẵn sàng",
      IN_USE: "Đang sử dụng",
      MAINTENANCE: "Bảo trì",
      BROKEN: "Hỏng",
      DISPOSED: "Thanh lý",
    };

    const data = assets.map((a) => ({
      "Mã thiết bị": a.assetTag,
      "Tên thiết bị": a.name,
      "Số serial": a.serial || "",
      "Trạng thái": statusLabels[a.status] || a.status,
      "Danh mục": a.category?.name || "",
      "Vị trí": a.location?.name || "",
      "Nhà sản xuất": a.manufacturer?.name || "",
      "Nhà cung cấp": a.supplier?.name || "",
      "Ngày mua": a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString("vi-VN") : "",
      "Giá mua (VNĐ)": a.purchaseCost || "",
      "Hết bảo hành": a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString("vi-VN") : "",
      "Ghi chú": a.notes || "",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
      { wch: 12 }, { wch: 40 }, { wch: 20 }, { wch: 15 },
      { wch: 18 }, { wch: 25 }, { wch: 20 }, { wch: 30 },
      { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Thiết bị");

    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(ws);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bao-cao-thiet-bi-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="bao-cao-thiet-bi-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Lỗi xuất báo cáo" }, { status: 500 });
  }
}
