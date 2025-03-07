/*
  Warnings:

  - You are about to drop the column `location` on the `File` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[filename]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shareId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originalName` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "location",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "shareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "File_filename_key" ON "File"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "File_shareId_key" ON "File"("shareId");
