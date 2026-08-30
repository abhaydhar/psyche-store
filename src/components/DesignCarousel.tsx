"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Design {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
}

interface DesignCarouselProps {
  selectedDesignUrl: string | null;
  onSelectDesign: (url: string) => void;
}

export function DesignCarousel({
  selectedDesignUrl,
  onSelectDesign,
}: DesignCarouselProps) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDesigns() {
      try {
        const res = await fetch("/designs/designs.json");
        if (res.ok) {
          const data = await res.json();
          setDesigns(data);
        } else {
          toast.error("Failed to load design templates");
        }
      } catch (err) {
        console.error("Failed to load designs:", err);
        toast.error("Failed to load design templates");
      } finally {
        setLoading(false);
      }
    }
    loadDesigns();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Choose from Templates
        </label>
        <div className="text-sm text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Choose from Templates
        </label>
        <div className="text-sm text-muted-foreground">
          No templates available. Add designs to the /public/designs folder.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Choose from Templates
      </label>
      <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-muted/30">
        <div className="flex gap-3 p-4">
          {designs.map((design) => {
            const isSelected = selectedDesignUrl === design.thumbnail;
            return (
              <button
                key={design.id}
                onClick={() => onSelectDesign(design.thumbnail)}
                className={`relative flex-shrink-0 w-28 h-28 rounded-lg border-2 overflow-hidden transition-all hover:scale-105 hover:shadow-lg ${
                  isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-2 shadow-lg"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src={design.thumbnail}
                  alt={design.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback for missing images
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary drop-shadow-lg" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs text-white font-medium truncate">
                    {design.name}
                  </p>
                  <p className="text-[10px] text-white/80">{design.category}</p>
                </div>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {selectedDesignUrl && (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            Template selected. Upload your own to replace it.
          </span>
        </div>
      )}
    </div>
  );
}
