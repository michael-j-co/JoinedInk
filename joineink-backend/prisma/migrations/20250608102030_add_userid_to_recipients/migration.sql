-- Add userId column to recipients table
ALTER TABLE "recipients" ADD COLUMN "userId" TEXT;

-- Add foreign key constraint for userId
ALTER TABLE "recipients" ADD CONSTRAINT "recipients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; 