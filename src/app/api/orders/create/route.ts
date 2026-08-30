import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { OrderCreatePayload, ApiResponse, OrderCreateResponse } from "@/lib/types";

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${dateStr}-${suffix}`;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<OrderCreateResponse>>> {
  try {
    const formData = await request.formData();
    const designFile = formData.get("designFile") as File | null;
    const mockupBlob = formData.get("mockupBlob") as File | null;
    const orderDataRaw = formData.get("orderData") as string;

    if (!designFile || !orderDataRaw) {
      return NextResponse.json(
        { success: false, error: "Missing design file or order data" },
        { status: 400 }
      );
    }

    const orderData: OrderCreatePayload = JSON.parse(orderDataRaw);
    const supabase = getServiceClient();

    // Upload design file
    const designExt = designFile.name.split(".").pop() || "png";
    const designPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${designExt}`;
    const designBuffer = Buffer.from(await designFile.arrayBuffer());

    const { error: designUploadError } = await supabase.storage
      .from("tshirt-designs")
      .upload(designPath, designBuffer, {
        contentType: designFile.type,
      });

    if (designUploadError) {
      return NextResponse.json(
        { success: false, error: `Design upload failed: ${designUploadError.message}` },
        { status: 500 }
      );
    }

    const { data: designUrlData } = supabase.storage
      .from("tshirt-designs")
      .getPublicUrl(designPath);

    // Upload mockup if provided
    let mockupUrl = "";
    if (mockupBlob) {
      const mockupPath = `mockup-${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
      const mockupBuffer = Buffer.from(await mockupBlob.arrayBuffer());

      const { error: mockupUploadError } = await supabase.storage
        .from("order-mockups")
        .upload(mockupPath, mockupBuffer, {
          contentType: "image/png",
        });

      if (!mockupUploadError) {
        const { data: mockupUrlData } = supabase.storage
          .from("order-mockups")
          .getPublicUrl(mockupPath);
        mockupUrl = mockupUrlData.publicUrl;
      }
    }

    // Generate unique order number
    let orderNumber = "";
    for (let i = 0; i < 3; i++) {
      const candidate = generateOrderNumber();
      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", candidate)
        .maybeSingle();

      if (!existing) {
        orderNumber = candidate;
        break;
      }
    }

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Could not generate unique order number" },
        { status: 500 }
      );
    }

    // Insert order
    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        category: orderData.category,
        color: orderData.color,
        size: orderData.size,
        design_image_url: designUrlData.publicUrl,
        mockup_url: mockupUrl,
        canvas_transform_json: orderData.canvasTransform,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        status: "Pending Verification",
      })
      .select("id")
      .single();

    if (insertError || !order) {
      return NextResponse.json(
        { success: false, error: `Order creation failed: ${insertError?.message}` },
        { status: 500 }
      );
    }

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhookUrl && !webhookUrl.includes("/xxx/")) {
      const payload = JSON.stringify({
        orderId: order.id,
        orderNumber,
        category: orderData.category,
        color: orderData.color,
        size: orderData.size,
        designImageUrl: designUrlData.publicUrl,
        mockupUrl,
        canvasTransform: orderData.canvasTransform,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        status: "Pending Verification",
        timestamp: new Date().toISOString(),
      });

      // Google Apps Script returns 302→200 with the script's JSON response.
      // redirect:"follow" lets fetch handle the full chain automatically.
      (async () => {
        try {
          const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            redirect: "follow",
          });
          const text = await res.text();
          console.log("Webhook response:", res.status, text.slice(0, 200));
        } catch (err) {
          console.error("Google Sheets webhook failed:", err);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      data: { orderId: order.id, orderNumber },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
