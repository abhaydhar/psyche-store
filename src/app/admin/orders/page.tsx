"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Order, OrderStatus } from "@/lib/types";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, RefreshCw, Package } from "lucide-react";
import { toast } from "sonner";

type FilterStatus = "all" | OrderStatus;

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${encodeURIComponent(filter)}` : "";
      const res = await fetch(`/api/admin/orders${params}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.data || []);
      } else if (res.status === 401) {
        router.push("/admin/login");
      } else {
        toast.error(data.error || "Failed to fetch orders");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function handleSelectOrder(order: Order) {
    setSelectedOrder(order);
    setDialogOpen(true);
  }

  function handleStatusUpdate(orderId: string, newStatus: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  }

  function handleDelete(orderId: string) {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setSelectedOrder(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-card border-b shadow-sm px-6 py-5 sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Orders Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage and track all custom orders</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-destructive hover:text-destructive-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <div className="flex items-center justify-between">
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as FilterStatus)}
            >
              <TabsList className="bg-muted">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All Orders
                </TabsTrigger>
                <TabsTrigger value="Pending Verification" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="Confirmed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Confirmed
                </TabsTrigger>
                <TabsTrigger value="Dispatched" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  Dispatched
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={fetchOrders} className="hover:bg-primary hover:text-primary-foreground">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <OrdersTable orders={orders} onSelectOrder={handleSelectOrder} />
          </div>
        )}
      </main>

      <OrderDetailsDialog
        order={selectedOrder}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
