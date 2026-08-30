"use client";

import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorSwatchSelectorProps {
  products: Product[];
  selectedProductId: string | null;
  onSelect: (product: Product) => void;
}

export function ColorSwatchSelector({
  products,
  selectedProductId,
  onSelect,
}: ColorSwatchSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Color</label>
      <div className="flex flex-wrap gap-3">
        {products.map((product) => {
          const isSelected = product.id === selectedProductId;
          const isLight =
            product.color_hex.toLowerCase() === "#ffffff" ||
            product.color_hex.toLowerCase() === "#fff";
          return (
            <button
              key={product.id}
              onClick={() => onSelect(product)}
              className={cn(
                "relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                isSelected
                  ? "border-primary ring-2 ring-primary/30"
                  : isLight
                    ? "border-gray-300"
                    : "border-transparent"
              )}
              style={{ backgroundColor: product.color_hex }}
              title={product.color_name}
            >
              {isSelected && (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto w-5 h-5",
                    isLight ? "text-gray-800" : "text-white"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
      {products.find((p) => p.id === selectedProductId) && (
        <p className="text-xs text-muted-foreground">
          {products.find((p) => p.id === selectedProductId)?.color_name}
        </p>
      )}
    </div>
  );
}
