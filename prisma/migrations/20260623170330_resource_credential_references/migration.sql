-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "credentialLabel" TEXT,
ADD COLUMN     "credentialProvider" TEXT,
ADD COLUMN     "credentialReference" TEXT,
ADD COLUMN     "credentialUsernameHint" TEXT;
