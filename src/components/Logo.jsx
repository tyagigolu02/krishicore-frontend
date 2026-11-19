// src/components/Logo.jsx
import { Sprout } from 'lucide-react';

export default function Logo({ className = "", size = "md" }) {
  const sizeMap = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  };

  const iconSizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const containerSize = sizeMap[size] || sizeMap.md;
  const iconSize = iconSizeMap[size] || iconSizeMap.md;

  return (
    <div
      className={`${containerSize} bg-[#1B5E20] text-amber-400 flex items-center justify-center font-extrabold text-xl shadow-sm shrink-0 ${className}`}
      title="KrishiCore"
    >
      <Sprout className={iconSize} />
    </div>
  );
}
