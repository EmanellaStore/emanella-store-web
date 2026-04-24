// src/lib/coupons.ts
import  db from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

export type CouponValidationResult =
  | { valid: true; coupon: any; discount: number }
  | { valid: false; error: string };

export async function validateCoupon(
  code: string,
  subtotal: number,
  customerId?: string | null,
): Promise<CouponValidationResult> {
  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) return { valid: false, error: 'Cupón no existe' };
  if (!coupon.active) return { valid: false, error: 'Cupón inactivo' };
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return { valid: false, error: 'Cupón expirado' };
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    return { valid: false, error: 'Cupón agotado' };
  if (coupon.customerId && coupon.customerId !== customerId)
    return { valid: false, error: 'Cupón no válido para este cliente' };
  if (coupon.minAmount && subtotal < Number(coupon.minAmount))
    return {
      valid: false,
      error: `Monto mínimo: $${Number(coupon.minAmount).toLocaleString('es-CO')}`,
    };

  let discount = 0;
  if (coupon.type === 'PERCENT') discount = subtotal * (Number(coupon.value) / 100);
  else if (coupon.type === 'FIXED') discount = Number(coupon.value);
  else if (coupon.type === 'FREE_SHIPPING') discount = 0; // se aplica al shipping

  discount = Math.min(discount, subtotal);
  return { valid: true, coupon, discount: Math.round(discount) };
}