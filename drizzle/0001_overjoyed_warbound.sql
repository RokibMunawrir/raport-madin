ALTER TABLE "teachers" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "subject" varchar(100);--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "status" varchar(50) DEFAULT 'Aktif';--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "joined_date" date;