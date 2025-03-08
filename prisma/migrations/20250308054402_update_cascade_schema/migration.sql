-- DropForeignKey
ALTER TABLE "SharedFile" DROP CONSTRAINT "SharedFile_fileId_fkey";

-- DropForeignKey
ALTER TABLE "SharedFile" DROP CONSTRAINT "SharedFile_userId_fkey";

-- AddForeignKey
ALTER TABLE "SharedFile" ADD CONSTRAINT "SharedFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedFile" ADD CONSTRAINT "SharedFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
