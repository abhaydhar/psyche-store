"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface DesignUploaderProps {
  designFile: File | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export function DesignUploader({
  designFile,
  onUpload,
  onRemove,
}: DesignUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a PNG or JPEG image");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be under 10MB");
      return;
    }

    onUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary" />
        Upload Your Own Design
      </label>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />
      {designFile ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary bg-primary/5">
          <ImageIcon className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{designFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(designFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full h-auto py-4 border-2 border-dashed hover:border-primary hover:bg-primary/5"
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Upload Your Design</p>
              <p className="text-xs text-muted-foreground">PNG or JPEG (max 10MB)</p>
            </div>
          </div>
        </Button>
      )}
    </div>
  );
}
