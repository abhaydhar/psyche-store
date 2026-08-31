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
  const [transform, setTransform] = useState<CanvasTransform>({
    x: PRINT_AREA.width * 0.15,
    y: PRINT_AREA.height * 0.15,
    width: PRINT_AREA.width * 0.7,
    height: PRINT_AREA.height * 0.7,
    rotation: 0,
  });
  const [sliderSize, setSliderSize] = useState(PRINT_AREA.width * 0.7);

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
    updateTransform({ width: newSize, height: newSize });
  }

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div
        id="tshirt-canvas"
        ref={canvasRef}
        className="relative border rounded-3xl overflow-hidden shadow-md bg-white w-full"
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
                <path d="M84,40 C76,41 68,42 60,46 C47,50 34,54 22,58 C18,62 17,68 19,74 C21,82 23,90 26,98 C31,104 47,110 57,106 L57,214 C57,218 60,220 65,220 L135,220 C140,220 143,218 143,214 L143,106 C153,110 169,104 174,98 C177,90 179,82 181,74 C183,68 182,62 178,58 C166,54 153,50 140,46 C132,42 124,41 116,40 C110,50 108,56 100,56 C92,56 90,50 84,40 Z" strokeLinejoin="round" />
                <path d="M88,44 C93,58 107,58 112,44" fill="none" stroke="rgba(120,120,120,0.55)" strokeWidth="3" strokeLinecap="round" />
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
              <path d="M84,40 C76,41 68,42 60,46 C47,50 34,54 22,58 C18,62 17,68 19,74 C21,82 23,90 26,98 C31,104 47,110 57,106 L57,214 C57,218 60,220 65,220 L135,220 C140,220 143,218 143,214 L143,106 C153,110 169,104 174,98 C177,90 179,82 181,74 C183,68 182,62 178,58 C166,54 153,50 140,46 C132,42 124,41 116,40 C110,50 108,56 100,56 C92,56 90,50 84,40 Z" strokeLinejoin="round" />
                <path d="M88,44 C93,58 107,58 112,44" fill="none" stroke="rgba(120,120,120,0.55)" strokeWidth="3" strokeLinecap="round" />
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
