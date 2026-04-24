/*
  Warnings:

  - You are about to drop the column `welcomeSentAt` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `appliedCouponCode` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentAbandonedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentRecoveryStep` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `reviewRequestedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `Coupon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CouponUse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CouponUse" DROP CONSTRAINT "CouponUse_couponId_fkey";

-- DropForeignKey
ALTER TABLE "CouponUse" DROP CONSTRAINT "CouponUse_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CouponUse" DROP CONSTRAINT "CouponUse_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_productId_fkey";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "welcomeSentAt",
ADD COLUMN     "last_purchase_at" TIMESTAMP(3),
ADD COLUMN     "order_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "repurchase_step" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "welcome_sent_at" TIMESTAMP(3),
ADD COLUMN     "winback_sent_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "appliedCouponCode",
DROP COLUMN "discountAmount",
DROP COLUMN "paymentAbandonedAt",
DROP COLUMN "paymentRecoveryStep",
DROP COLUMN "reviewRequestedAt",
DROP COLUMN "reviewedAt",
ADD COLUMN     "applied_coupon_code" TEXT,
ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "payment_abandoned_at" TIMESTAMP(3),
ADD COLUMN     "payment_recovery_step" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "review_requested_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "shipping_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Coupon";

-- DropTable
DROP TABLE "CouponUse";

-- DropTable
DROP TABLE "Review";

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "product_id" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "photo_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "min_amount" DECIMAL(10,2),
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "customer_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "campaign" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_uses" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_uses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_customer_id_idx" ON "reviews"("customer_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_published_idx" ON "reviews"("product_id", "published");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_customer_id_active_idx" ON "coupons"("customer_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_uses_order_id_key" ON "coupon_uses"("order_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
