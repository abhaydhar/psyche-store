export interface Product {
  id: string;
  category: "Adults" | "Kids";
  color_name: string;
  color_hex: string;
  base_image_url: string;
  available_sizes: string[];
  created_at: string;
}

export interface CanvasTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface Order {
  id: string;
  order_number: string;
  category: string;
  color: string;
  size: string;
  design_image_url: string;
  mockup_url: string;
  canvas_transform_json: CanvasTransform;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  status: "Pending Verification" | "Confirmed" | "Dispatched";
  created_at: string;
}

export interface OrderCreatePayload {
  category: string;
  color: string;
  size: string;
  canvasTransform: CanvasTransform;
  textConfig?: TextConfig | null;
  textTransform?: TextTransform | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface OrderCreateResponse {
  orderId: string;
  orderNumber: string;
}

export interface TextConfig {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
}

export interface TextTransform {
  x: number;
  y: number;
  rotation: number;
}

export type OrderStatus = "Pending Verification" | "Confirmed" | "Dispatched";
export type Category = "Adults" | "Kids";
