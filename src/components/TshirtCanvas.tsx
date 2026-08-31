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

const CANVAS_WIDTH = 550;
const CANVAS_HEIGHT = 560;
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
  const DEFAULT_SIZE = 130;
  const [transform, setTransform] = useState<CanvasTransform>({
    x: (PRINT_AREA.width - DEFAULT_SIZE) / 2,
    y: (PRINT_AREA.height - DEFAULT_SIZE) / 2,
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
    rotation: 0,
  });
  const [sliderSize, setSliderSize] = useState(DEFAULT_SIZE);

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

  function handleSizeChange(newSize: number) {
    setSliderSize(newSize);
    // Center the image when size changes
    const newX = (PRINT_AREA.width - newSize) / 2;
    const newY = (PRINT_AREA.height - newSize) / 2;
    updateTransform({
      width: newSize,
      height: newSize,
      x: newX,
      y: newY
    });
  }

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div
        id="tshirt-canvas"
        ref={canvasRef}
        className="relative border rounded-lg overflow-hidden shadow-sm bg-white w-full"
        style={{
          maxWidth: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          padding: '2px 4px 4px 4px',
        }}
      >
        {baseImageUrl ? (
          <>
            {/* Color layer behind the t-shirt image */}
            <div className="absolute inset-0 flex items-center justify-start pt-0 p-1">
              <svg
                viewBox="0 0 200 250"
                className="w-full h-full"
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
              style={{ padding: '0 4px 4px 4px' }}
              draggable={false}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-start pt-0 p-1">
            <svg
    viewBox="0 0 200 250"
    className="w-full h-full"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Defs for gradients and effects */}
    <defs>
      {/* Dynamic Stroke Logic based on colorHex */}
      <style>{`
        .dynamic-stroke {
          stroke: ${
            colorHex.toLowerCase() === "#ffffff" ||
            colorHex.toLowerCase() === "#fff" ||
            colorHex.toLowerCase() === "#eab308"
              ? "#666"
              : "rgba(0,0,0,0.1)"
          };
          stroke-width: 2;
        }
      `}</style>
      
      {/* Subtle Shadow for neck depth */}
      <linearGradient id="neck-shadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D9D9D9" />
        <stop offset="100%" stopColor="#F3F3F3" />
      </linearGradient>
    </defs>

    {/* 1. Main Shirt Body (Straight Rectangular Sides) with Neck Opening Hole */}
    <path
      className="dynamic-stroke"
      fill={colorHex}
      d="
        M 74,28 C 62,31 46,37 36,42 L 14,86 C 24,92 34,96 44,99 C 50,88 52,82 54,76 L 54,218
        L 146,218 L 146,76 C 148,82 150,88 156,99 C 166,96 176,92 186,86 L 164,42
        C 154,37 138,31 126,28 C 118,20 82,20 74,28 Z
        M 74,28 C 82,20 118,20 126,28 C 118,52 82,52 74,28 Z
      "
      fillRule="evenodd"
    />

    {/* 2. Inner Back Collar (Simulates Depth, not solid black) */}
    <path
      fill="url(#neck-shadow)"
      stroke="none"
      d="M 74,28 C 82,20 118,20 126,28 C 118,36 82,36 74,28 Z"
    />

    {/* 3. Defined White Crew-Neck Band */}
    <path
      fill="#FFFFFF"
      className="dynamic-stroke"
      d="M 74,28 C 82,20 118,20 126,28 L 128,30 C 120,24 80,24 72,30 L 74,28 Z"
    />
    
    {/* Subtle Inner Ribbing Detail on Collar */}
    <path
      fill="none"
      stroke="#666"
      strokeOpacity="0.2"
      strokeWidth="1"
      d="M 77,29 C 83,23 117,23 123,29"
    />

  </svg>
          </div>
        )}

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
                style={{
                  transform: `rotate(${transform.rotation}deg)`,
                  backgroundColor: colorHex,
                  backgroundBlendMode: 'multiply'
                }}
              >
                <img
                  src={activeDesignUrl}
                  alt="Your design"
                  className="w-full h-full object-contain pointer-events-none"
                  style={{ mixBlendMode: 'normal' }}
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
        <div className="flex flex-col gap-2 w-full">
          {activeDesignUrl && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Size:</label>
              <input
                type="range"
                min="50"
                max={PRINT_AREA.width}
                value={sliderSize}
                onChange={(e) => setSliderSize(Number(e.target.value))}
                onMouseUp={(e) => handleSizeChange(Number((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => handleSizeChange(Number((e.target as HTMLInputElement).value))}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12">{Math.round(sliderSize)}px</span>
            </div>
          )}
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
        </div>
      )}
    </div>
  );
}

export { CANVAS_WIDTH, CANVAS_HEIGHT, PRINT_AREA };
