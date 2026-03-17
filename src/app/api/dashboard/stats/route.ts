import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalAssets,
      availableAssets,
      inUseAssets,
      maintenanceAssets,
      brokenAssets,
      disposedAssets,
      totalCategories,
      totalLocations,
      totalUsers,
      recentCheckouts,
      recentAuditLogs,
      assetsByCategory,
      assetsByLocation,
      assetsByStatus,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: "AVAILABLE" } }),
      prisma.asset.count({ where: { status: "IN_USE" } }),
      prisma.asset.count({ where: { status: "MAINTENANCE" } }),
      prisma.asset.count({ where: { status: "BROKEN" } }),
      prisma.asset.count({ where: { status: "DISPOSED" } }),
      prisma.category.count(),
      prisma.location.count(),
      prisma.user.count(),
      prisma.assetCheckout.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { asset: true, user: true },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
      prisma.asset.groupBy({
        by: ["categoryId"],
        _count: true,
        where: { categoryId: { not: null } },
      }),
      prisma.asset.groupBy({
        by: ["locationId"],
        _count: true,
        where: { locationId: { not: null } },
      }),
      prisma.asset.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    // Get category and location names for charts
    const categoryIds = assetsByCategory.map((a) => a.categoryId!);
    const locationIds = assetsByLocation.map((a) => a.locationId!);
    const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
    const locations = await prisma.location.findMany({ where: { id: { in: locationIds } } });

    const categoryChart = assetsByCategory.map((a) => ({
      name: categories.find((c) => c.id === a.categoryId)?.name || "Khác",
      value: a._count,
    }));

    const locationChart = assetsByLocation.map((a) => ({
      name: locations.find((l) => l.id === a.locationId)?.name || "Khác",
      value: a._count,
    }));

    const statusChart = assetsByStatus.map((a) => ({
      name: a.status,
      value: a._count,
    }));

    return NextResponse.json({
      stats: {
        totalAssets,
        availableAssets,
        inUseAssets,
        maintenanceAssets,
        brokenAssets,
        disposedAssets,
        totalCategories,
        totalLocations,
        totalUsers,
      },
      charts: { categoryChart, locationChart, statusChart },
      recentCheckouts,
      recentAuditLogs,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Lỗi tải dữ liệu" }, { status: 500 });
  }
}
