/*
  Warnings:

  - You are about to drop the `app_config` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "app_config";

-- CreateTable
CREATE TABLE "fixed_costs" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "costs" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixed_costs_pkey" PRIMARY KEY ("id")
);
