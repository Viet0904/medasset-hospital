"use client";

import { memo } from "react";
import { Cpu, MemoryStick, HardDrive, Monitor, Plug } from "lucide-react";

// Cấu hình field theo keyword trong tên danh mục
const CATEGORY_FIELDS: Record<string, { key: string; label: string; icon: any; placeholder: string }[]> = {
  "máy tính": [
    { key: "cpu", label: "CPU", icon: Cpu, placeholder: "VD: Intel Core i5-12400" },
    { key: "ram", label: "RAM", icon: MemoryStick, placeholder: "VD: 16GB DDR4 3200MHz" },
    { key: "ssd", label: "SSD", icon: HardDrive, placeholder: "VD: 512GB NVMe" },
    { key: "hdd", label: "HDD", icon: HardDrive, placeholder: "VD: 1TB 7200rpm" },
    { key: "vga", label: "VGA / GPU", icon: Monitor, placeholder: "VD: GTX 1650 4GB" },
    { key: "psu", label: "Nguồn (PSU)", icon: Plug, placeholder: "VD: 550W 80+ Bronze" },
    { key: "case", label: "Case", icon: HardDrive, placeholder: "VD: ATX Mid Tower" },
    { key: "mainboard", label: "Mainboard", icon: Cpu, placeholder: "VD: ASUS B660M" },
  ],
  "monitor": [
    { key: "screenSize", label: "Kích thước", icon: Monitor, placeholder: "VD: 27 inch" },
    { key: "resolution", label: "Độ phân giải", icon: Monitor, placeholder: "VD: 1920x1080 (FHD)" },
    { key: "panelType", label: "Loại panel", icon: Monitor, placeholder: "VD: IPS / VA / TN" },
    { key: "refreshRate", label: "Tần số quét", icon: Monitor, placeholder: "VD: 75Hz / 144Hz" },
    { key: "ports", label: "Cổng kết nối", icon: Plug, placeholder: "VD: HDMI, VGA, DisplayPort, DVI, USB-C" },
  ],
  "màn hình": [
    { key: "screenSize", label: "Kích thước", icon: Monitor, placeholder: "VD: 27 inch" },
    { key: "resolution", label: "Độ phân giải", icon: Monitor, placeholder: "VD: 1920x1080 (FHD)" },
    { key: "panelType", label: "Loại panel", icon: Monitor, placeholder: "VD: IPS / VA / TN" },
    { key: "refreshRate", label: "Tần số quét", icon: Monitor, placeholder: "VD: 75Hz / 144Hz" },
    { key: "ports", label: "Cổng kết nối", icon: Plug, placeholder: "VD: HDMI, VGA, DisplayPort, DVI, USB-C" },
  ],
  "laptop": [
    { key: "cpu", label: "CPU", icon: Cpu, placeholder: "VD: Intel Core i7-1365U" },
    { key: "ram", label: "RAM", icon: MemoryStick, placeholder: "VD: 16GB DDR5" },
    { key: "ssd", label: "Ổ cứng", icon: HardDrive, placeholder: "VD: 512GB NVMe" },
    { key: "vga", label: "VGA / GPU", icon: Monitor, placeholder: "VD: Intel Iris Xe" },
    { key: "screenSize", label: "Màn hình", icon: Monitor, placeholder: "VD: 14 inch FHD IPS" },
    { key: "ports", label: "Cổng kết nối", icon: Plug, placeholder: "VD: USB-C, HDMI, USB-A x2" },
  ],
};

// Tìm fields phù hợp dựa trên tên danh mục
export function getFieldsForCategory(categoryName: string): typeof CATEGORY_FIELDS[string] | null {
  if (!categoryName) return null;
  const lower = categoryName.toLowerCase();
  for (const [keyword, fields] of Object.entries(CATEGORY_FIELDS)) {
    if (lower.includes(keyword)) return fields;
  }
  return null;
}

interface CustomFieldsFormProps {
  categoryName: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export const CustomFieldsForm = memo(function CustomFieldsForm({
  categoryName,
  values,
  onChange,
}: CustomFieldsFormProps) {
  const fields = getFieldsForCategory(categoryName);
  if (!fields) return null;

  return (
    <div className="col-span-full">
      <div className="border border-sky-500/20 rounded-xl p-4 bg-sky-500/[0.03]">
        <h3 className="text-sm font-semibold text-sky-400 mb-3 flex items-center gap-2">
          <Cpu size={16} />
          Thông số kỹ thuật — {categoryName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 flex items-center gap-1.5">
                <Icon size={13} />
                {label}
              </label>
              <input
                value={values[key] || ""}
                onChange={(e) => onChange({ ...values, [key]: e.target.value })}
                className="input-field text-sm"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
