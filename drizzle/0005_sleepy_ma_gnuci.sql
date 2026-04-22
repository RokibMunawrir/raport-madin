CREATE TABLE "memorize_targets" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"levels" text,
	"points" integer DEFAULT 0,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"category" varchar(100),
	"level" text,
	"description" text,
	"status" varchar(50) DEFAULT 'Aktif',
	"icon" varchar(50) DEFAULT 'BookOpen',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "teaching_assignments" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"teacher_id" varchar(21) NOT NULL,
	"subject_id" varchar(21) NOT NULL,
	"classroom_id" varchar(21) NOT NULL,
	"academic_year_id" varchar(21),
	"day" varchar(20),
	"period" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classrooms" ADD COLUMN "room" varchar(100);--> statement-breakpoint
ALTER TABLE "dormitories" ADD COLUMN "gender" varchar(20) DEFAULT 'Putra';--> statement-breakpoint
ALTER TABLE "dormitories" ADD COLUMN "block" varchar(50);--> statement-breakpoint
ALTER TABLE "dormitories" ADD COLUMN "head" varchar(255);--> statement-breakpoint
ALTER TABLE "dormitories" ADD COLUMN "capacity" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;