"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product, Category, CanvasTransform, TextConfig, TextTransform } from "@/lib/types";
import { TshirtCanvas } from "@/components/TshirtCanvas";
import { ColorSwatchSelector } from "@/components/ColorSwatchSelector";
import { SizeSelector } from "@/components/SizeSelector";
import { DesignUploader } from "@/components/DesignUploader";
import { TextCustomizer } from "@/components/TextCustomizer";
import { DesignCarousel } from "@/components/DesignCarousel";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shirt, ShoppingBag, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PRINT_AREA } from "@/components/TshirtCanvas";

// Helper to convert URL to File object
async function urlToFile(url: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  const filename = url.split('/').pop() || 'design.png';
  return new File([blob], filename, { type: blob.type });
}

export default function CustomizerPage() {
  const [category, setCategory] = useState<Category>("Adults");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [selectedDesignUrl, setSelectedDesignUrl] = useState<string | null>(null);
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
  });
  const [textConfig, setTextConfig] = useState<TextConfig | null>(null);
  const [textTransform, setTextTransform] = useState<TextTransform>({
    x: 20,
    y: 160,
    rotation: 0,
  });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .order("created_at");

    if (error) {
      toast.error("Failed to load products");
      console.error(error);
    } else if (data && data.length > 0) {
      setProducts(data as Product[]);
      setSelectedProduct(data[0] as Product);
      setSelectedSize(null);
    } else {
      setProducts([]);
      setSelectedProduct(null);
    }
    setLoading(false);
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleCategoryChange(cat: string) {
    setCategory(cat as Category);
    setSelectedSize(null);
    setDesignFile(null);
    setSelectedDesignUrl(null);
  }

  function handleColorSelect(product: Product) {
    setSelectedProduct(product);
    setSelectedSize(null);
  }

  function handleDesignUpload(file: File) {
    setDesignFile(file);
    setSelectedDesignUrl(null); // Clear template selection when uploading
  }

  function handleTemplateSelect(url: string) {
    setSelectedDesignUrl(url);
    setDesignFile(null); // Clear uploaded file when selecting template
  }

  function handleSaveAndOrder() {
    if (!selectedProduct) {
      toast.error("Please select a color");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!designFile && !selectedDesignUrl) {
      toast.error("Please upload a design or select a template");
      return;
    }
    setCheckoutOpen(true);
  }

  async function handleOrderSubmit(customer: {
    name: string;
    phone: string;
    address: string;
  }): Promise<{ success: boolean; orderNumber?: string }> {
    try {
      let mockupBlob: Blob | null = null;
      const activeDesignFile = designFile || (selectedDesignUrl ? await urlToFile(selectedDesignUrl) : null);

      if (activeDesignFile) {
        try {
          const scale = 2;
          const offscreen = document.createElement("canvas");
          offscreen.width = CANVAS_WIDTH * scale;
          offscreen.height = CANVAS_HEIGHT * scale;
          const ctx = offscreen.getContext("2d")!;
          ctx.scale(scale, scale);

          // Fill background with white
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Draw t-shirt shape filled with the selected color
          const tshirtPath = new Path2D("M60,30 L30,50 L10,90 L40,100 L50,70 L50,190 L150,190 L150,70 L160,100 L190,90 L170,50 L140,30 L120,40 C110,50 90,50 80,40 Z");
          ctx.save();
          ctx.translate(CANVAS_WIDTH * 0.1, CANVAS_HEIGHT * 0.1);
          ctx.scale(CANVAS_WIDTH * 0.8 / 200, CANVAS_HEIGHT * 0.8 / 250);
          ctx.fillStyle = selectedProduct?.color_hex || "#1a1a1a";
          ctx.fill(tshirtPath);
          ctx.restore();

          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = "rgba(128,128,128,0.5)";
          ctx.lineWidth = 2;
          ctx.strokeRect(PRINT_AREA.x, PRINT_AREA.y, PRINT_AREA.width, PRINT_AREA.height);

          const designImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(activeDesignFile);
          });

          const dx = PRINT_AREA.x + canvasTransform.x;
          const dy = PRINT_AREA.y + canvasTransform.y;
          const cx = dx + canvasTransform.width / 2;
          const cy = dy + canvasTransform.height / 2;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((canvasTransform.rotation * Math.PI) / 180);
          ctx.drawImage(
            designImg,
            -canvasTransform.width / 2,
            -canvasTransform.height / 2,
            canvasTransform.width,
            canvasTransform.height
          );
          ctx.restore();
          URL.revokeObjectURL(designImg.src);

          // Render text layer on mockup
          if (textConfig) {
            const tx = PRINT_AREA.x + textTransform.x;
            const ty = PRINT_AREA.y + textTransform.y;

            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate((textTransform.rotation * Math.PI) / 180);
            ctx.font = `${textConfig.fontSize}px "${textConfig.fontFamily}"`;
            ctx.fillStyle = textConfig.color;
            ctx.textBaseline = "top";

            const words = textConfig.text.split(" ");
            const maxWidth = PRINT_AREA.width - 10;
            let line = "";
            let lineY = 0;
            for (const word of words) {
              const testLine = line ? `${line} ${word}` : word;
              if (ctx.measureText(testLine).width > maxWidth && line) {
                ctx.fillText(line, 0, lineY);
                line = word;
                lineY += textConfig.fontSize * 1.2;
              } else {
                line = testLine;
              }
            }
            if (line) ctx.fillText(line, 0, lineY);
            ctx.restore();
          }

          mockupBlob = await new Promise<Blob | null>((resolve) =>
            offscreen.toBlob((blob) => resolve(blob), "image/png")
          );
        } catch (err) {
          console.error("Mockup generation failed:", err);
        }
      }

      const formData = new FormData();
      formData.append("designFile", activeDesignFile!);
      if (mockupBlob) {
        formData.append("mockupBlob", mockupBlob, "mockup.png");
      }
      formData.append(
        "orderData",
        JSON.stringify({
          category,
          color: selectedProduct!.color_name,
          size: selectedSize,
          canvasTransform,
          textConfig: textConfig || null,
          textTransform: textConfig ? textTransform : null,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerAddress: customer.address,
        })
      );

      const res = await fetch("/api/orders/create", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Order ${data.data.orderNumber} placed!`);
        return { success: true, orderNumber: data.data.orderNumber };
      } else {
        toast.error(data.error || "Order failed");
        return { success: false };
      }
    } catch (err) {
      console.error("Order submit error:", err);
      toast.error("Something went wrong. Please try again.");
      return { success: false };
    }
  }

  return (
    <>
      <Toaster position="top-center" richColors />

      <header className="border-b bg-card shadow-sm px-4 py-4 sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shirt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PsycheStore
              </h1>
              <p className="text-xs text-muted-foreground">Custom T-Shirt Studio</p>
            </div>
          </div>
          <Tabs value={category} onValueChange={handleCategoryChange}>
            <TabsList className="bg-muted">
              <TabsTrigger value="Adults" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Adults
              </TabsTrigger>
              <TabsTrigger value="Kids" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Kids
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            <div className="flex justify-center">
              <TshirtCanvas
                colorHex={selectedProduct?.color_hex || "#1a1a1a"}
                colorName={selectedProduct?.color_name || "Black"}
                baseImageUrl={selectedProduct?.base_image_url || ""}
                designFile={designFile}
                designUrl={selectedDesignUrl}
                onTransformChange={setCanvasTransform}
                textConfig={textConfig}
                onTextTransformChange={setTextTransform}
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Customize Your Design</h2>
                <p className="text-sm text-muted-foreground">
                  Choose your color, size, and upload your design to create something unique.
                </p>
              </div>

              <div className="bg-card rounded-xl border p-6 space-y-5 shadow-sm">
                <ColorSwatchSelector
                  products={products}
                  selectedProductId={selectedProduct?.id || null}
                  onSelect={handleColorSelect}
                />

                {selectedProduct && (
                  <SizeSelector
                    sizes={selectedProduct.available_sizes}
                    selectedSize={selectedSize}
                    onSelect={setSelectedSize}
                  />
                )}

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-xs text-muted-foreground font-medium">
                      ADD YOUR DESIGN
                    </span>
                    <div className="h-px bg-border flex-1" />
                  </div>

                  <DesignCarousel
                    selectedDesignUrl={selectedDesignUrl}
                    onSelectDesign={handleTemplateSelect}
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>

                  <DesignUploader
                    designFile={designFile}
                    onUpload={handleDesignUpload}
                    onRemove={() => setDesignFile(null)}
                  />

                  {/* TextCustomizer hidden - needs refinement
                  <TextCustomizer
                    textConfig={textConfig}
                    onApply={setTextConfig}
                    onRemove={() => setTextConfig(null)}
                  />
                  */}
                </div>
              </div>

              <Button
                className="w-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                size="lg"
                onClick={handleSaveAndOrder}
                disabled={!selectedProduct || !selectedSize || (!designFile && !selectedDesignUrl)}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue to Checkout
              </Button>

              {selectedProduct && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h6 className="font-semibold text-sm mb-3">Order Summary</h6>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-medium">{selectedProduct.color_name}</span>
                    {selectedSize && (
                      <>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{selectedSize}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onSubmit={handleOrderSubmit}
        orderSummary={{
          category,
          color: selectedProduct?.color_name || "",
          size: selectedSize || "",
        }}
      />
    </>
  );
}
