"use client";

import { useState } from "react";

const MEDICAL_ICONS = [
  "🧲", "☢️", "🫁", "💻", "🔬", "📡", "🖨️", "📠", "📺", "🔭",
  "🩺", "💉", "🏥", "🩻", "🧪", "🧬", "💊", "🩹", "🦠", "❤️",
  "⚕️", "🔩", "⚡", "🔋", "📱", "🖥️", "⌨️", "🖱️", "📞", "🔌",
  "🛠️", "🔧", "⚙️", "🧰", "📦", "🗄️", "🗃️", "📋", "📊", "📈",
  "🪫", "💡", "🔦", "🧊", "🌡️", "⏱️", "🔔", "🎯", "🏷️", "📍",
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input-field w-full text-left flex items-center gap-2 cursor-pointer hover:border-sky-500/50 transition-colors"
      >
        <span className="text-xl">{value || "📦"}</span>
        <span className="text-sm text-[var(--color-text-muted)]">
          {value ? "Bấm để đổi icon" : "Chọn icon"}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 left-0 z-50 glass-card p-3 w-[280px] fade-in shadow-xl shadow-black/30">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Chọn icon cho danh mục</p>
            <div className="grid grid-cols-10 gap-1">
              {MEDICAL_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => { onChange(emoji); setOpen(false); }}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-base hover:bg-white/10 transition-colors ${value === emoji ? "bg-sky-500/20 ring-1 ring-sky-500/50" : ""}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
