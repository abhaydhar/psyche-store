"use client";

import { useState } from "react";
import { TextConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Type, X, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TextCustomizerProps {
  textConfig: TextConfig | null;
  onApply: (config: TextConfig) => void;
  onRemove: () => void;
}

const FONTS = [
  "Bebas Neue",
  "Montserrat",
  "Oswald",
  "Inter",
  "Poppins",
  "Anton",
  "Playfair Display",
  "Pacifico",
  "Lobster",
  "Arvo",
  "Space Grotesk",
  "Bungee",
];

const TEXT_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Royal Blue", hex: "#0000FF" },
  { name: "Dark Green", hex: "#006400" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Orange", hex: "#FF6600" },
  { name: "Purple", hex: "#800080" },
  { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Gray", hex: "#808080" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Navy", hex: "#000080" },
];

const SIZE_PRESETS = [
  { label: "S", value: 16 },
  { label: "M", value: 24 },
  { label: "L", value: 36 },
  { label: "XL", value: 48 },
  { label: "XXL", value: 64 },
];

const MAX_WORDS = 25;

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function TextCustomizer({
  textConfig,
  onApply,
  onRemove,
}: TextCustomizerProps) {
  const [text, setText] = useState(textConfig?.text || "");
  const [font, setFont] = useState(textConfig?.fontFamily || FONTS[0]);
  const [color, setColor] = useState(textConfig?.color || "#000000");
  const [fontSize, setFontSize] = useState(textConfig?.fontSize || 36);

  function handleTextChange(value: string) {
    if (countWords(value) > MAX_WORDS) {
      toast.error(`Maximum ${MAX_WORDS} words allowed`);
      return;
    }
    setText(value);
  }

  function handleApply() {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Please enter some text");
      return;
    }
    onApply({ text: trimmed, fontFamily: font, fontSize, color });
  }

  function handleRemove() {
    setText("");
    onRemove();
  }

  const wordCount = countWords(text);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-px bg-border flex-1" />
        <span className="text-xs text-muted-foreground font-medium">
          ADD TEXT
        </span>
        <div className="h-px bg-border flex-1" />
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Your Text</Label>
            <span
              className={cn(
                "text-[10px]",
                wordCount >= MAX_WORDS
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {wordCount}/{MAX_WORDS} words
            </span>
          </div>
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter your text here..."
            rows={2}
            className="text-sm resize-none"
          />
        </div>

        {/* Font Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs">Font</Label>
          <div className="grid grid-cols-2 gap-1 max-h-[120px] overflow-y-auto border rounded-md p-1">
            {FONTS.map((f) => (
              <button
                key={f}
                onClick={() => setFont(f)}
                className={cn(
                  "px-2 py-1.5 text-xs rounded text-left truncate transition-colors",
                  font === f
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                style={{ fontFamily: f }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs">Text Color</Label>
          <div className="flex flex-wrap gap-1.5">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c.hex)}
                className={cn(
                  "w-6 h-6 rounded-full border transition-all",
                  color === c.hex
                    ? "ring-2 ring-primary ring-offset-1 scale-110"
                    : c.hex === "#FFFFFF"
                      ? "border-gray-300"
                      : "border-transparent"
                )}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {color === c.hex && (
                  <Check
                    className={cn(
                      "w-3 h-3 mx-auto",
                      c.hex === "#FFFFFF" || c.hex === "#FFD700"
                        ? "text-gray-800"
                        : "text-white"
                    )}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Size Presets */}
        <div className="space-y-1.5">
          <Label className="text-xs">Size</Label>
          <div className="flex gap-1.5">
            {SIZE_PRESETS.map((s) => (
              <button
                key={s.label}
                onClick={() => setFontSize(s.value)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md border transition-colors",
                  fontSize === s.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-input hover:bg-accent"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {text.trim() && (
          <div
            className="p-3 border rounded-md bg-muted/30 text-center overflow-hidden"
            style={{ fontFamily: font, fontSize: Math.min(fontSize, 32), color }}
          >
            {text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleApply}
            disabled={!text.trim()}
          >
            <Type className="w-3 h-3 mr-1" />
            {textConfig ? "Update Text" : "Apply Text"}
          </Button>
          {textConfig && (
            <Button variant="outline" size="sm" onClick={handleRemove}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
