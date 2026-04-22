CREATE TABLE "scores" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"student_id" varchar(21) NOT NULL,
	"subject_id" varchar(21) NOT NULL,
	"academic_year_id" varchar(21) NOT NULL,
	"harian" integer DEFAULT 0,
	"semester" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_notes" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"student_id" varchar(21) NOT NULL,
	"academic_year_id" varchar(21) NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "category" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "level" varchar(100);--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "rank" varchar(100);--> statement-breakpoint
ALTER TABLE "attendances" ADD COLUMN "session" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "dormitories" ADD COLUMN "room_code" varchar(50);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "room_code" varchar(50);--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;