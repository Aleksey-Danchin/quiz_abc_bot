/*
  Warnings:

  - Added the required column `descrition` to the `quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `quiz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quiz" ADD COLUMN     "descrition" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
