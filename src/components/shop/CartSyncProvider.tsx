"use client";
import { useCartSync } from "@/hooks/useCartSync";

export default function CartSyncProvider() {
  useCartSync();
  return null;
}