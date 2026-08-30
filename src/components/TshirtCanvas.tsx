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
                <path d="M60,30 L30,50 L10,90 L40,100 L50,70 L50,190 L150,190 L150,70 L160,100 L190,90 L170,50 L140,30 L120,40 C110,50 90,50 80,40 Z" />
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
              strokeWidth="2"
            >
              <path d="M60,30 L30,50 L10,90 L40,100 L50,70 L50,190 L150,190 L150,70 L160,100 L190,90 L170,50 L140,30 L120,40 C110,50 90,50 80,40 Z" />
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
              style={{ backgroundColor: colorHex }}
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
