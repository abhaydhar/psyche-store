"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  QrCode,
  ArrowRight,
  CheckCircle2,
  User,
  Phone,
  MapPin,
} from "lucide-react";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (customer: {
    name: string;
    phone: string;
    address: string;
  }) => Promise<{ success: boolean; orderNumber?: string }>;
  orderSummary: {
    category: string;
    color: string;
    size: string;
  };
}

type Step = "payment" | "info" | "submitting" | "success";

export function CheckoutModal({
  open,
  onOpenChange,
  onSubmit,
  orderSummary,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("payment");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function reset() {
    setStep("payment");
    setName("");
    setPhone("");
    setAddress("");
    setOrderNumber("");
    setErrors({});
  }

  function handleOpenChange(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  function validateInfo(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!phone.trim()) errs.phone = "Phone number is required";
    if (!address.trim()) errs.address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePaymentDone() {
    if (!validateInfo()) return;

    setStep("submitting");
    const result = await onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });

    if (result.success) {
      setOrderNumber(result.orderNumber || "");
      setStep("success");
    } else {
      setStep("info");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Scan the QR code below to make payment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                <h6 className="font-semibold text-[13px] mb-2">Order Summary</h6>
                <div className="grid grid-cols-2 gap-1.5 text-[13px]">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{orderSummary.category}</span>
                  <span className="text-muted-foreground">Color:</span>
                  <span className="font-medium">{orderSummary.color}</span>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{orderSummary.size}</span>
                </div>
              </div>

              <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/30">
                {/* Payment QR - user provides their own image at /payment-qr.png */}
                <img
                  src="/payment-qr.png"
                  alt="Payment QR Code"
                  className="max-w-[320px] max-h-[320px] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML =
                      '<div class="flex flex-col items-center gap-2 text-muted-foreground py-8"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg><span class="text-sm">Place payment-qr.png in /public</span></div>';
                  }}
                />
              </div>

              <Button className="w-full" onClick={() => setStep("info")}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {(step === "info" || step === "submitting") && (
          <>
            <DialogHeader>
              <DialogTitle>Your Details</DialogTitle>
              <DialogDescription>
                Enter your contact and delivery information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checkout-name">
                  <User className="w-3 h-3 inline mr-1" />
                  Full Name
                </Label>
                <Input
                  id="checkout-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={step === "submitting"}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-phone">
                  <Phone className="w-3 h-3 inline mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="checkout-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  disabled={step === "submitting"}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkout-address">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Delivery Address
                </Label>
                <Textarea
                  id="checkout-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full delivery address"
                  rows={3}
                  disabled={step === "submitting"}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address}</p>
                )}
              </div>

              <Separator />

              <Button
                className="w-full"
                onClick={handlePaymentDone}
                disabled={step === "submitting"}
              >
                {step === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Payment Done - Place Order
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                Order Placed Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold">{orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Your order is pending verification. We&apos;ll confirm it
                  shortly!
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
