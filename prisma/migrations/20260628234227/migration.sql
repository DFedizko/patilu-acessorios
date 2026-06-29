-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'SHIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PackingStatus" AS ENUM ('NOT_PACKED', 'PACKED');

-- CreateEnum
CREATE TYPE "AdSpendSource" AS ENUM ('TIKTOK', 'MANUAL');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costCents" INTEGER NOT NULL,
    "barcode" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "tiktokOrderId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "recipientName" TEXT,
    "saleCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL DEFAULT 0,
    "orderedAt" TIMESTAMP(3) NOT NULL,
    "shipmentStatus" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "packingStatus" "PackingStatus" NOT NULL DEFAULT 'NOT_PACKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packings" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "packedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_items" (
    "id" TEXT NOT NULL,
    "packingId" TEXT NOT NULL,
    "tierId" TEXT,
    "tierName" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "unitCostCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "packing_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loose_items" (
    "id" TEXT NOT NULL,
    "packingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costCents" INTEGER NOT NULL,

    CONSTRAINT "loose_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_spend_days" (
    "day" DATE NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "source" "AdSpendSource" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_spend_days_pkey" PRIMARY KEY ("day")
);

-- CreateTable
CREATE TABLE "app_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "fixedCostPerOrderCents" INTEGER NOT NULL DEFAULT 300,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tiers_barcode_key" ON "tiers"("barcode");

-- CreateIndex
CREATE INDEX "tiers_categoryId_idx" ON "tiers"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_tiktokOrderId_key" ON "orders"("tiktokOrderId");

-- CreateIndex
CREATE INDEX "orders_orderedAt_idx" ON "orders"("orderedAt");

-- CreateIndex
CREATE INDEX "orders_shipmentStatus_packingStatus_idx" ON "orders"("shipmentStatus", "packingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "packings_orderId_key" ON "packings"("orderId");

-- CreateIndex
CREATE INDEX "packing_items_packingId_idx" ON "packing_items"("packingId");

-- CreateIndex
CREATE INDEX "loose_items_packingId_idx" ON "loose_items"("packingId");

-- AddForeignKey
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packings" ADD CONSTRAINT "packings_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_packingId_fkey" FOREIGN KEY ("packingId") REFERENCES "packings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loose_items" ADD CONSTRAINT "loose_items_packingId_fkey" FOREIGN KEY ("packingId") REFERENCES "packings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
