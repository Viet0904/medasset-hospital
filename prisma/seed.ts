import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // === Clean all existing data ===
  await prisma.auditLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.assetCheckout.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.location.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // === Users ===
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedManager = await bcrypt.hash("manager123", 10);
  const hashedStaff = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      name: "Nguyễn Quản Trị",
      email: "admin@hospital.vn",
      password: hashedAdmin,
      role: "ADMIN",
      permissions: JSON.stringify({ canCreate: true, canEdit: true, canDelete: true, canExport: true }),
      department: "Phòng CNTT",
      phone: "0901234567",
    },
  });

  const manager = await prisma.user.create({
    data: {
      username: "manager",
      name: "Trần Quản Lý",
      email: "manager@hospital.vn",
      password: hashedManager,
      role: "MANAGER",
      permissions: JSON.stringify({ canCreate: true, canEdit: true, canDelete: false, canExport: true }),
      department: "Phòng Vật tư",
      phone: "0907654321",
    },
  });

  const staff = await prisma.user.create({
    data: {
      username: "staff",
      name: "Lê Nhân Viên",
      password: hashedStaff,
      role: "STAFF",
      permissions: JSON.stringify({ canCreate: false, canEdit: false, canDelete: false, canExport: false }),
      department: "Khoa Nội",
      phone: "0909876543",
    },
  });

  // === Categories ===
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Máy MRI", description: "Máy chụp cộng hưởng từ", icon: "🧲" } }),
    prisma.category.create({ data: { name: "Máy X-quang", description: "Máy chụp X-quang", icon: "☢️" } }),
    prisma.category.create({ data: { name: "Máy thở", description: "Máy thở hỗ trợ", icon: "🫁" } }),
    prisma.category.create({ data: { name: "Máy tính", description: "Máy tính để bàn, laptop", icon: "💻" } }),
    prisma.category.create({ data: { name: "Máy CT Scanner", description: "Máy chụp CT", icon: "🔬" } }),
    prisma.category.create({ data: { name: "Máy siêu âm", description: "Máy siêu âm chẩn đoán", icon: "📡" } }),
    prisma.category.create({ data: { name: "Máy in", description: "Máy in laser, mực", icon: "🖨️" } }),
    prisma.category.create({ data: { name: "Máy photocopy", description: "Máy photocopy văn phòng", icon: "📠" } }),
    prisma.category.create({ data: { name: "Monitor theo dõi", description: "Monitor bệnh nhân", icon: "📺" } }),
    prisma.category.create({ data: { name: "Máy nội soi", description: "Máy nội soi chẩn đoán", icon: "🔭" } }),
  ]);

  // === Locations ===
  const locations = await Promise.all([
    prisma.location.create({ data: { name: "Khoa Nội", description: "Khoa Nội tổng hợp", address: "Tầng 2 - Tòa A" } }),
    prisma.location.create({ data: { name: "Khoa Ngoại", description: "Khoa Ngoại tổng hợp", address: "Tầng 3 - Tòa A" } }),
    prisma.location.create({ data: { name: "Phòng Mổ", description: "Khu phẫu thuật", address: "Tầng 4 - Tòa B" } }),
    prisma.location.create({ data: { name: "Khoa Cấp cứu", description: "Khoa Cấp cứu", address: "Tầng 1 - Tòa A" } }),
    prisma.location.create({ data: { name: "Phòng Khám", description: "Khu phòng khám ngoại trú", address: "Tầng 1 - Tòa C" } }),
    prisma.location.create({ data: { name: "Phòng IT", description: "Phòng Công nghệ thông tin", address: "Tầng 5 - Tòa B" } }),
    prisma.location.create({ data: { name: "Kho Vật tư", description: "Kho thiết bị và vật tư", address: "Tầng hầm - Tòa A" } }),
    prisma.location.create({ data: { name: "Phòng Hành chính", description: "Khu hành chính", address: "Tầng 1 - Tòa B" } }),
  ]);

  // === Manufacturers ===
  const manufacturers = await Promise.all([
    prisma.manufacturer.create({ data: { name: "Siemens Healthineers", website: "https://www.siemens-healthineers.com", phone: "1800-599-0000" } }),
    prisma.manufacturer.create({ data: { name: "GE Healthcare", website: "https://www.gehealthcare.com", phone: "1800-543-7777" } }),
    prisma.manufacturer.create({ data: { name: "Philips Medical", website: "https://www.philips.com/healthcare", phone: "1800-328-3456" } }),
    prisma.manufacturer.create({ data: { name: "Canon Medical", website: "https://global.medical.canon", phone: "1800-421-1968" } }),
    prisma.manufacturer.create({ data: { name: "HP Inc.", website: "https://www.hp.com", phone: "1800-474-6836" } }),
    prisma.manufacturer.create({ data: { name: "Dell Technologies", website: "https://www.dell.com", phone: "1800-624-9897" } }),
    prisma.manufacturer.create({ data: { name: "Mindray", website: "https://www.mindray.com", phone: "1800-288-8898" } }),
  ]);

  // === Suppliers ===
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: "Cty TNHH Thiết bị Y tế An Phát", contactName: "Nguyễn Văn An", email: "sales@anphat-med.com", phone: "0283456789", address: "123 Nguyễn Trãi, Q.1, TP.HCM" } }),
    prisma.supplier.create({ data: { name: "Cty CP Tin học Minh Phúc", contactName: "Trần Minh Phúc", email: "info@minhphuc.com", phone: "0281234567", address: "456 Lê Lợi, Q.3, TP.HCM" } }),
  ]);

  // === Assets (18 items) ===
  const assets = await Promise.all([
    prisma.asset.create({ data: { assetTag: "MRI-001", name: "Máy MRI Siemens MAGNETOM Sola 1.5T", serial: "SN-MRI-2024-001", status: "IN_USE", purchaseDate: new Date("2024-01-15"), purchaseCost: 45000000000, warrantyExpiry: new Date("2029-01-15"), categoryId: categories[0].id, locationId: locations[2].id, manufacturerId: manufacturers[0].id, supplierId: suppliers[0].id, notes: "Máy MRI chính của bệnh viện" } }),
    prisma.asset.create({ data: { assetTag: "MRI-002", name: "Máy MRI GE SIGNA Premier 3T", serial: "SN-MRI-2024-002", status: "AVAILABLE", purchaseDate: new Date("2024-06-01"), purchaseCost: 55000000000, warrantyExpiry: new Date("2029-06-01"), categoryId: categories[0].id, locationId: locations[6].id, manufacturerId: manufacturers[1].id, supplierId: suppliers[0].id } }),
    prisma.asset.create({ data: { assetTag: "XR-001", name: "Máy X-quang Canon CXDI-710C", serial: "SN-XR-2024-001", status: "IN_USE", purchaseDate: new Date("2023-08-20"), purchaseCost: 2500000000, warrantyExpiry: new Date("2026-08-20"), categoryId: categories[1].id, locationId: locations[4].id, manufacturerId: manufacturers[3].id, supplierId: suppliers[0].id } }),
    prisma.asset.create({ data: { assetTag: "XR-002", name: "Máy X-quang Siemens Multix Fusion", serial: "SN-XR-2024-002", status: "IN_USE", purchaseDate: new Date("2023-11-10"), purchaseCost: 3000000000, warrantyExpiry: new Date("2026-11-10"), categoryId: categories[1].id, locationId: locations[3].id, manufacturerId: manufacturers[0].id, supplierId: suppliers[0].id } }),
    prisma.asset.create({ data: { assetTag: "VENT-001", name: "Máy thở Philips Trilogy Evo", serial: "SN-VENT-2024-001", status: "IN_USE", purchaseDate: new Date("2024-02-01"), purchaseCost: 500000000, warrantyExpiry: new Date("2027-02-01"), categoryId: categories[2].id, locationId: locations[3].id, manufacturerId: manufacturers[2].id, supplierId: suppliers[0].id } }),
    prisma.asset.create({ data: { assetTag: "VENT-002", name: "Máy thở Mindray SV800", serial: "SN-VENT-2024-002", status: "BROKEN", purchaseDate: new Date("2023-05-15"), purchaseCost: 350000000, categoryId: categories[2].id, locationId: locations[6].id, manufacturerId: manufacturers[6].id, notes: "Hỏng bộ van, chờ linh kiện thay thế" } }),
    prisma.asset.create({ data: { assetTag: "PC-001", name: "Máy tính Dell OptiPlex 7090", serial: "SN-PC-2024-001", status: "IN_USE", purchaseDate: new Date("2024-03-10"), purchaseCost: 25000000, warrantyExpiry: new Date("2027-03-10"), categoryId: categories[3].id, locationId: locations[5].id, manufacturerId: manufacturers[5].id, supplierId: suppliers[1].id } }),
    prisma.asset.create({ data: { assetTag: "PC-002", name: "Laptop Dell Latitude 5540", serial: "SN-PC-2024-002", status: "IN_USE", purchaseDate: new Date("2024-04-05"), purchaseCost: 28000000, warrantyExpiry: new Date("2027-04-05"), categoryId: categories[3].id, locationId: locations[0].id, manufacturerId: manufacturers[5].id, supplierId: suppliers[1].id } }),
    prisma.asset.create({ data: { assetTag: "PC-003", name: "Máy tính HP ProDesk 400 G9", serial: "SN-PC-2024-003", status: "AVAILABLE", purchaseDate: new Date("2024-05-20"), purchaseCost: 18000000, categoryId: categories[3].id, locationId: locations[6].id, manufacturerId: manufacturers[4].id, supplierId: suppliers[1].id } }),
    prisma.asset.create({ data: { assetTag: "CT-001", name: "Máy CT Canon Aquilion ONE PRISM", serial: "SN-CT-2024-001", status: "IN_USE", purchaseDate: new Date("2024-01-20"), purchaseCost: 35000000000, warrantyExpiry: new Date("2029-01-20"), categoryId: categories[4].id, locationId: locations[2].id, manufacturerId: manufacturers[3].id, supplierId: suppliers[0].id } }),
    prisma.asset.create({ data: { assetTag: "US-001", name: "Máy siêu âm GE LOGIQ E10s", serial: "SN-US-2024-001", status: "IN_USE", purchaseDate: new Date("2024-02-15"), purchaseCost: 1800000000, warrantyExpiry: new Date("2027-02-15"), categoryId: categories[5].id, locationId: locations[4].id, manufacturerId: manufacturers[1].id, supplierId: suppliers[0].id } }),
    prisma.asset.create({ data: { assetTag: "PR-001", name: "Máy in HP LaserJet Enterprise M611dn", serial: "SN-PR-2024-001", status: "IN_USE", purchaseDate: new Date("2024-03-01"), purchaseCost: 15000000, categoryId: categories[6].id, locationId: locations[5].id, manufacturerId: manufacturers[4].id, supplierId: suppliers[1].id } }),
    prisma.asset.create({ data: { assetTag: "PR-002", name: "Máy in HP Color LaserJet Pro M454dw", serial: "SN-PR-2024-002", status: "IN_USE", purchaseDate: new Date("2024-04-10"), purchaseCost: 12000000, categoryId: categories[6].id, locationId: locations[4].id, manufacturerId: manufacturers[4].id, supplierId: suppliers[1].id } }),
    prisma.asset.create({ data: { assetTag: "CP-001", name: "Máy photocopy Canon imageRUNNER C3530i", serial: "SN-CP-2024-001", status: "IN_USE", purchaseDate: new Date("2024-05-01"), purchaseCost: 45000000, categoryId: categories[7].id, locationId: locations[5].id, manufacturerId: manufacturers[3].id, supplierId: suppliers[1].id } }),
    prisma.asset.create({ data: { assetTag: "MON-001", name: "Monitor Philips IntelliVue MX800", serial: "SN-MON-2024-001", status: "IN_USE", purchaseDate: new Date("2024-03-15"), purchaseCost: 120000000, warrantyExpiry: new Date("2027-03-15"), categoryId: categories[8].id, locationId: locations[3].id, manufacturerId: manufacturers[2].id, supplierId: suppliers[0].id } }),
    prisma.asset.create({ data: { assetTag: "MON-002", name: "Monitor Mindray BeneVision N22", serial: "SN-MON-2024-002", status: "IN_USE", purchaseDate: new Date("2024-04-20"), purchaseCost: 80000000, warrantyExpiry: new Date("2027-04-20"), categoryId: categories[8].id, locationId: locations[0].id, manufacturerId: manufacturers[6].id, supplierId: suppliers[0].id } }),
    prisma.asset.create({ data: { assetTag: "MON-003", name: "Monitor Mindray BeneVision N15", serial: "SN-MON-2024-003", status: "MAINTENANCE", purchaseDate: new Date("2024-02-10"), purchaseCost: 60000000, categoryId: categories[8].id, locationId: locations[6].id, manufacturerId: manufacturers[6].id, notes: "Đang bảo trì định kỳ" } }),
    prisma.asset.create({ data: { assetTag: "ENDO-001", name: "Máy nội soi Olympus EVIS X1", serial: "SN-ENDO-2024-001", status: "AVAILABLE", purchaseDate: new Date("2024-06-15"), purchaseCost: 2000000000, warrantyExpiry: new Date("2029-06-15"), categoryId: categories[9].id, locationId: locations[6].id, manufacturerId: manufacturers[1].id, supplierId: suppliers[0].id } }),
  ]);

  // === Sample checkouts ===
  await prisma.assetCheckout.create({ data: { assetId: assets[0].id, userId: manager.id, notes: "Sử dụng cho Khoa Ngoại" } });
  await prisma.assetCheckout.create({ data: { assetId: assets[6].id, userId: staff.id, notes: "Máy tính cá nhân" } });
  await prisma.assetCheckout.create({ data: { assetId: assets[2].id, userId: manager.id, notes: "Phòng khám số 3" } });

  // === Sample maintenance log ===
  await prisma.maintenanceLog.create({
    data: {
      assetId: assets[16].id,
      performedById: admin.id,
      maintenanceType: "PREVENTIVE",
      title: "Bảo trì định kỳ Q1/2026",
      description: "Kiểm tra, vệ sinh và hiệu chuẩn thiết bị",
      cost: 5000000,
      status: "IN_PROGRESS",
    },
  });

  // === Sample audit log ===
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE",
      entityType: "ASSET",
      entityId: assets[0].id,
      details: "Khởi tạo hệ thống, thêm dữ liệu mẫu",
    },
  });

  console.log("✅ Seeding completed!");
  console.log(`   👤 Users: 3 (admin/manager/staff)`);
  console.log(`   📦 Assets: ${assets.length}`);
  console.log(`   📁 Categories: ${categories.length}`);
  console.log(`   📍 Locations: ${locations.length}`);
  console.log(`   🏭 Manufacturers: ${manufacturers.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
