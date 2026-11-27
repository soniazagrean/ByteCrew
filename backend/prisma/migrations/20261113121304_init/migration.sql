-- CreateEnum
CREATE TYPE "DocumentFileType" AS ENUM ('pdf', 'docx');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('visible', 'removed');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "specialization" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fileKey" TEXT NOT NULL,
    "fileType" "DocumentFileType" NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "status" "DocumentStatus" NOT NULL DEFAULT 'visible',
    "uploaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_course_year_specialization_semester_idx" ON "Document"("course", "year", "specialization", "semester");

