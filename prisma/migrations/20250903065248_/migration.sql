/*
  Warnings:

  - Added the required column `type` to the `StorageRef` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."StorageRef" ADD COLUMN     "type" TEXT NOT NULL;
