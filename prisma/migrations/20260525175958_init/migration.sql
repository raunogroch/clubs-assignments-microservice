-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_clubs" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "assignment_clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_owners" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "assignment_owners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assignments_status_idx" ON "assignments"("status");

-- CreateIndex
CREATE INDEX "assignments_available_idx" ON "assignments"("available");

-- CreateIndex
CREATE INDEX "assignment_clubs_clubId_idx" ON "assignment_clubs"("clubId");

-- CreateIndex
CREATE INDEX "assignment_clubs_available_idx" ON "assignment_clubs"("available");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_clubs_assignmentId_clubId_key" ON "assignment_clubs"("assignmentId", "clubId");

-- CreateIndex
CREATE INDEX "assignment_owners_userId_idx" ON "assignment_owners"("userId");

-- CreateIndex
CREATE INDEX "assignment_owners_available_idx" ON "assignment_owners"("available");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_owners_assignmentId_userId_key" ON "assignment_owners"("assignmentId", "userId");

-- AddForeignKey
ALTER TABLE "assignment_clubs" ADD CONSTRAINT "assignment_clubs_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_owners" ADD CONSTRAINT "assignment_owners_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
