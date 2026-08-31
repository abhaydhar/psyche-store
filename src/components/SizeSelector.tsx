"use client";

import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  error?: boolean;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  error = false,
}: SizeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className={cn(
        "text-sm font-medium",
        error && "text-destructive"
      )}>
        Size {error && <span className="text-destructive">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
              selectedSize === size
                ? "bg-primary text-primary-foreground border-primary"
                : error
                ? "bg-background text-foreground border-destructive hover:bg-accent"
                : "bg-background text-foreground border-input hover:bg-accent"
            )}
          >
            {size}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1">
          Please select a size to continue
        </p>
      )}
    </div>
  );
}
