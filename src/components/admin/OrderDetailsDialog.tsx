"use client";

import { Order, OrderStatus } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Download, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  onDelete: (orderId: string) => void;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  "Pending Verification": "bg-yellow-100 text-yellow-800 border-yellow-300",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  Dispatched: "bg-green-100 text-green-800 border-green-300",
};

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onStatusUpdate,
  onDelete,
}: OrderDetailsDialogProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  if (!order) return null;

  async function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        onStatusUpdate(order!.id, newStatus as OrderStatus);
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order!.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order deleted successfully");
        onDelete(order!.id);
        onOpenChange(false);
      } else {
        toast.error(data.error || "Failed to delete order");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeleting(false);
      setShowDeleteAlert(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Order {order.order_number}
            <Badge className={STATUS_COLORS[order.status]}>
              {order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Update */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Update Status:</span>
            <Select
              value={order.status}
              onValueChange={handleStatusChange}
              disabled={updatingStatus}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending Verification">
                  Pending Verification
                </SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Dispatched">Dispatched</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                {order.customer_name}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {order.customer_phone}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Address:</span>{" "}
                {order.customer_address}
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Info */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Order Details</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Category:</span>{" "}
                {order.category}
              </div>
              <div>
                <span className="text-muted-foreground">Color:</span>{" "}
                {order.color}
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>{" "}
                {order.size}
              </div>
            </div>
          </div>

          {/* Canvas Transform */}
          {order.canvas_transform_json && (
            <div className="text-sm">
              <span className="text-muted-foreground">Design Placement:</span>{" "}
              X:{order.canvas_transform_json.x?.toFixed(0)}, Y:
              {order.canvas_transform_json.y?.toFixed(0)}, W:
              {order.canvas_transform_json.width?.toFixed(0)}, H:
              {order.canvas_transform_json.height?.toFixed(0)}, Rotation:
              {order.canvas_transform_json.rotation}°
            </div>
          )}

          <Separator />

          {/* Preview & Downloads */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Assets</h3>
            <div className="flex flex-wrap gap-2">
              {order.design_image_url && (
                <a
                  href={order.design_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Download className="w-3 h-3" />
                  High-Res Design
                </a>
              )}
              {order.mockup_url && (
                <a
                  href={order.mockup_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Preview Mockup
                </a>
              )}
            </div>
          </div>

          {/* Mockup Preview */}
          {order.mockup_url && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Mockup Preview</h3>
              <img
                src={order.mockup_url}
                alt="Order mockup"
                className="w-full max-w-sm rounded-md border"
              />
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created: {new Date(order.created_at).toLocaleString()}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAlert(true)}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Order
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete order {order.order_number}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
