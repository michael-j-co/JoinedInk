/*
  Warnings:

  - You are about to drop the column `contributorUserId` on the `contributions` table. All the data in the column will be lost.
  - The `signature` column on the `contributions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `drawings` column on the `contributions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "contributions" DROP CONSTRAINT "contributions_contributorUserId_fkey";

-- AlterTable
ALTER TABLE "contributions" DROP COLUMN "contributorUserId",
ADD COLUMN     "formatting" JSONB,
ADD COLUMN     "media" JSONB,
DROP COLUMN "signature",
ADD COLUMN     "signature" JSONB,
DROP COLUMN "drawings",
ADD COLUMN     "drawings" JSONB;
