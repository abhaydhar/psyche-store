"use client";

import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Size</label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
              selectedSize === size
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-input hover:bg-accent"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
