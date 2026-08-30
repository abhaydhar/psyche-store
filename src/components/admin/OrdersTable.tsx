"use client";

import { Order, OrderStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  "Pending Verification": "bg-yellow-100 text-yellow-800 border-yellow-300",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  Dispatched: "bg-green-100 text-green-800 border-green-300",
};

export function OrdersTable({ orders, onSelectOrder }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No orders found
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectOrder(order)}
            >
              <TableCell className="font-mono text-sm">
                {order.order_number}
              </TableCell>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>{order.category}</TableCell>
              <TableCell>{order.color}</TableCell>
              <TableCell>{order.size}</TableCell>
              <TableCell>
                <Badge className={STATUS_COLORS[order.status]}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
