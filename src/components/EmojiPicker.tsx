"use client";

import { useState, useCallback } from "react";

const ICON_GROUPS = [
  {
    label: "🏥 Y tế",
    icons: [
      "🩺", "💉", "🩻", "🧲", "☢️", "🫁", "🧪", "🧬", "💊", "🩹",
      "🦠", "❤️", "⚕️", "🌡️", "🔬", "🫀", "🦷", "🦴", "👁️", "🧠",
    ],
  },
  {
    label: "💻 IT & Thiết bị",
    icons: [
      "💻", "🖥️", "🖨️", "📺", "⌨️", "🖱️", "📱", "📡", "📠", "🔌",
      "🔋", "💡", "📞", "🎧", "🎥", "📷", "🔊", "📟", "⚡", "🪫",
    ],
  },
  {
    label: "🔧 Dụng cụ & Chung",
    icons: [
      "🛠️", "🔧", "⚙️", "🧰", "🔩", "📦", "🗄️", "🗃️", "📋", "📊",
      "📈", "🔦", "🧊", "⏱️", "🔔", "🎯", "🏷️", "📍", "🔭", "🚿",
    ],
  },
];

const ALL_ICONS = ICON_GROUPS.flatMap((g) => g.icons);

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (emoji: string) => {
      onChange(emoji);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field w-full text-left flex items-center gap-2 cursor-pointer hover:border-sky-500/50 transition-colors"
      >
        <span className="text-2xl">{value || "📦"}</span>
        <span className="text-sm text-[var(--color-text-muted)]">
          {value ? "Bấm để đổi icon" : "Chọn icon"}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full mt-2 left-0 z-[110] p-4 w-[340px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-2xl shadow-black/50 fade-in max-h-[400px] overflow-y-auto"
          >
            {ICON_GROUPS.map((group) => (
              <div key={group.label} className="mb-3 last:mb-0">
                <p className="text-[11px] font-semibold text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {group.icons.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelect(emoji)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-xl transition-all hover:bg-white/10 hover:scale-110 ${
                        value === emoji
                          ? "bg-sky-500/20 ring-2 ring-sky-500/50 scale-110"
                          : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
