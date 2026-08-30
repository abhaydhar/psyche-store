"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { CanvasTransform, TextConfig, TextTransform } from "@/lib/types";
import { RotateCw } from "lucide-react";

interface TshirtCanvasProps {
  colorHex: string;
  colorName: string;
  baseImageUrl: string;
  designFile: File | null;
  designUrl?: string | null;
  onTransformChange: (transform: CanvasTransform) => void;
  textConfig?: TextConfig | null;
  onTextTransformChange?: (transform: TextTransform) => void;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PRINT_AREA = {
  x: CANVAS_WIDTH * 0.2,
  y: CANVAS_HEIGHT * 0.2,
  width: CANVAS_WIDTH * 0.6,
  height: CANVAS_HEIGHT * 0.45,
};

export function TshirtCanvas({
  colorHex,
  colorName,
  baseImageUrl,
  designFile,
  designUrl: externalDesignUrl,
  onTransformChange,
  textConfig,
  onTextTransformChange,
}: TshirtCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeDesignUrl, setActiveDesignUrl] = useState<string | null>(null);
  const [textTransform, setTextTransform] = useState<TextTransform>({
    x: PRINT_AREA.width * 0.1,
    y: PRINT_AREA.height * 0.7,
    rotation: 0,
  });
  const [transform, setTransform] = useState<CanvasTransform>({
    x: PRINT_AREA.width * 0.15,
    y: PRINT_AREA.height * 0.15,
    width: PRINT_AREA.width * 0.7,
    height: PRINT_AREA.height * 0.7,
    rotation: 0,
  });

  useEffect(() => {
    if (designFile) {
      const url = URL.createObjectURL(designFile);
      setActiveDesignUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (externalDesignUrl) {
      setActiveDesignUrl(externalDesignUrl);
    } else {
      setActiveDesignUrl(null);
    }
  }, [designFile, externalDesignUrl]);

  const updateTransform = useCallback(
    (partial: Partial<CanvasTransform>) => {
      setTransform((prev) => {
        const next = { ...prev, ...partial };
        onTransformChange(next);
        return next;
      });
    },
    [onTransformChange]
  );

  const updateTextTransform = useCallback(
    (partial: Partial<TextTransform>) => {
      setTextTransform((prev) => {
        const next = { ...prev, ...partial };
        onTextTransformChange?.(next);
        return next;
      });
    },
    [onTextTransformChange]
  );

  function handleRotate() {
    updateTransform({ rotation: (transform.rotation + 15) % 360 });
  }

  function handleTextRotate() {
    updateTextTransform({ rotation: (textTransform.rotation + 15) % 360 });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        id="tshirt-canvas"
        ref={canvasRef}
        className="relative border rounded-lg overflow-hidden shadow-sm bg-white"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        }}
      >
        {baseImageUrl ? (
          <>
            {/* Color layer behind the t-shirt image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 200 250"
                className="w-[80%] h-[80%]"
                fill={colorHex}
                stroke="none"
              >
                <path d="
                  M 65,35
                  L 40,45
                  L 25,75
                  L 45,82
                  L 48,65
                  L 48,235
                  L 152,235
                  L 152,65
                  L 155,82
                  L 175,75
                  L 160,45
                  L 135,35

                  C 130,38 125,42 120,45
                  Q 110,50 100,50
                  Q 90,50 80,45
                  C 75,42 70,38 65,35
                  Z

                  M 80,45
                  Q 90,52 100,52
                  Q 110,52 120,45
                  Q 115,40 110,37
                  Q 105,35 100,35
                  Q 95,35 90,37
                  Q 85,40 80,45
                  Z
                " />
              </svg>
            </div>
            <img
              src={baseImageUrl}
              alt={`${colorName} T-Shirt`}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 200 250"
              className="w-[80%] h-[80%]"
              fill={colorHex}
              stroke={
                colorHex.toLowerCase() === "#ffffff" ||
                colorHex.toLowerCase() === "#fff" ||
                colorHex.toLowerCase() === "#eab308"
                  ? "#666"
                  : "rgba(0,0,0,0.1)"
              }
              strokeWidth="1.5"
            >
              {/* Modern round neck t-shirt shape */}
              <path d="
                M 65,35
                L 40,45
                L 25,75
                L 45,82
                L 48,65
                L 48,235
                L 152,235
                L 152,65
                L 155,82
                L 175,75
                L 160,45
                L 135,35

                C 130,38 125,42 120,45
                Q 110,50 100,50
                Q 90,50 80,45
                C 75,42 70,38 65,35
                Z

                M 80,45
                Q 90,52 100,52
                Q 110,52 120,45
                Q 115,40 110,37
                Q 105,35 100,35
                Q 95,35 90,37
                Q 85,40 80,45
                Z
              " />
            </svg>
          </div>
        )}

        {/* Printable area boundary */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: PRINT_AREA.x,
            top: PRINT_AREA.y,
            width: PRINT_AREA.width,
            height: PRINT_AREA.height,
            border: "2px dashed rgba(128, 128, 128, 0.5)",
            borderRadius: 4,
          }}
        />

        {/* Design overlay */}
        {activeDesignUrl && (
          <div
            className="absolute"
            style={{
              left: PRINT_AREA.x,
              top: PRINT_AREA.y,
              width: PRINT_AREA.width,
              height: PRINT_AREA.height,
            }}
          >
            <Rnd
              size={{ width: transform.width, height: transform.height }}
              position={{ x: transform.x, y: transform.y }}
              bounds="parent"
              lockAspectRatio
              onDragStop={(_e, d) => {
                updateTransform({ x: d.x, y: d.y });
              }}
              onResizeStop={(_e, _dir, ref, _delta, position) => {
                updateTransform({
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                  x: position.x,
                  y: position.y,
                });
              }}
              className="z-10"
            >
              <div
                className="w-full h-full cursor-move"
                style={{ transform: `rotate(${transform.rotation}deg)` }}
              >
                <img
                  src={activeDesignUrl}
                  alt="Your design"
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
              </div>
            </Rnd>
          </div>
        )}

        {/* Text overlay */}
        {textConfig && (
          <div
            className="absolute"
            style={{
              left: PRINT_AREA.x,
              top: PRINT_AREA.y,
              width: PRINT_AREA.width,
              height: PRINT_AREA.height,
            }}
          >
            <Rnd
              position={{ x: textTransform.x, y: textTransform.y }}
              size={{ width: "auto" as unknown as number, height: "auto" as unknown as number }}
              bounds="parent"
              enableResizing={false}
              onDragStop={(_e, d) => {
                updateTextTransform({ x: d.x, y: d.y });
              }}
              className="z-20"
            >
              <div
                className="cursor-move select-none whitespace-pre-wrap break-words px-1"
                style={{
                  fontFamily: textConfig.fontFamily,
                  fontSize: textConfig.fontSize,
                  color: textConfig.color,
                  transform: `rotate(${textTransform.rotation}deg)`,
                  lineHeight: 1.2,
                  maxWidth: PRINT_AREA.width - 10,
                  textShadow:
                    textConfig.color === "#FFFFFF" || textConfig.color === "#FFD700"
                      ? "0 1px 2px rgba(0,0,0,0.3)"
                      : "none",
                }}
              >
                {textConfig.text}
              </div>
            </Rnd>
          </div>
        )}
      </div>

      {(activeDesignUrl || textConfig) && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeDesignUrl && (
            <button
              onClick={handleRotate}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border"
            >
              <RotateCw className="w-3 h-3" />
              Rotate Image
            </button>
          )}
          {textConfig && (
            <button
              onClick={handleTextRotate}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border"
            >
              <RotateCw className="w-3 h-3" />
              Rotate Text
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            Drag elements within the print area
          </span>
        </div>
      )}
    </div>
  );
}

export { CANVAS_WIDTH, CANVAS_HEIGHT, PRINT_AREA };
