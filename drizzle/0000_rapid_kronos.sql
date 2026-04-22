CREATE TYPE "public"."achievement_category" AS ENUM('Akademik', 'Non-Akademik', 'Hafalan');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('Hadir', 'Izin', 'Sakit', 'Alpha');--> statement-breakpoint
CREATE TYPE "public"."semester" AS ENUM('Ganjil', 'Genap');--> statement-breakpoint
CREATE TABLE "academic_years" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"semester" "semester" NOT NULL,
	"is_active" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"student_id" varchar(21) NOT NULL,
	"academic_year_id" varchar(21) NOT NULL,
	"category" "achievement_category" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) DEFAULT 'info' NOT NULL,
	"user_id" varchar(21),
	"module" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"student_id" varchar(21) NOT NULL,
	"academic_year_id" varchar(21) NOT NULL,
	"date" date NOT NULL,
	"status" "attendance_status" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"level" varchar(50),
	"capacity" integer DEFAULT 0,
	"teacher_id" varchar(21),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dormitories" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_classrooms" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"student_id" varchar(21) NOT NULL,
	"classroom_id" varchar(21) NOT NULL,
	"academic_year_id" varchar(21) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"nis" varchar(50) NOT NULL,
	"nisn" varchar(50),
	"name" varchar(255) NOT NULL,
	"gender" varchar(20),
	"birth_place" varchar(100),
	"birth_date" date,
	"address" text,
	"dormitory_id" varchar(21),
	"region_id" varchar(21),
	"status" varchar(50) DEFAULT 'Aktif',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_nis_unique" UNIQUE("nis")
);
--> statement-breakpoint
CREATE TABLE "system_metrics" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"component" varchar(100) NOT NULL,
	"description" text,
	"status" varchar(50) NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"nip" varchar(50),
	"name" varchar(255) NOT NULL,
	"gender" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_classrooms" ADD CONSTRAINT "student_classrooms_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_classrooms" ADD CONSTRAINT "student_classrooms_classroom_id_classrooms_id_fk" FOREIGN KEY ("classroom_id") REFERENCES "public"."classrooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_classrooms" ADD CONSTRAINT "student_classrooms_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_dormitory_id_dormitories_id_fk" FOREIGN KEY ("dormitory_id") REFERENCES "public"."dormitories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;