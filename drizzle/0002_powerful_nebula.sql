ALTER TABLE "teachers" RENAME COLUMN "subject" TO "province";--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "gender" varchar(20) DEFAULT 'Putra';--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "province" varchar(255);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "regency" varchar(255);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "district" varchar(255);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "village" varchar(255);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "parent_name" varchar(255);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "regency" varchar(255);--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "district" varchar(255);--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "village" varchar(255);--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "birth_place" varchar(100);--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "birth_date" date;