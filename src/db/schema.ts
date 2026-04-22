import { pgTable, text, varchar, integer, timestamp, date, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// ==========================================
// ENUMS
// ==========================================
export const semesterEnum = pgEnum("semester", ["Ganjil", "Genap"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["Hadir", "Izin", "Sakit", "Alpha"]);
export const achievementCategoryEnum = pgEnum("achievement_category", ["Akademik", "Non-Akademik", "Hafalan"]);

// ==========================================
// 1. MASTER DATA
// ==========================================

export const teachers = pgTable("teachers", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  nip: varchar("nip", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  province: varchar("province", { length: 255 }),
  regency: varchar("regency", { length: 255 }),
  district: varchar("district", { length: 255 }),
  village: varchar("village", { length: 255 }),
  address: text("address"),
  birthPlace: varchar("birth_place", { length: 100 }),
  birthDate: date("birth_date"),
  status: varchar("status", { length: 50 }).default('Aktif'), // Aktif, Cuti, Non-Aktif
  joinedDate: date("joined_date"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const academicYears = pgTable("academic_years", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 100 }).notNull(), // e.g. "2024/2025"
  semester: semesterEnum("semester").notNull(),
  isActive: integer("is_active").default(0).notNull(), // 1 for active, 0 for inactive
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dormitories = pgTable("dormitories", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 20 }).default('Putra'), // Putra, Putri
  block: varchar("block", { length: 50 }), // 1-15, Induk Putra, etc.
  roomCode: varchar("room_code", { length: 50 }), // Kode Kamar
  head: varchar("head", { length: 255 }), // Kepala Asrama
  capacity: integer("capacity").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const regions = pgTable("regions", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classrooms = pgTable("classrooms", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 255 }).notNull(),
  level: varchar("level", { length: 50 }), // e.g., MDT ULA, MDT WUSTHA, MDT ULYA
  gender: varchar("gender", { length: 20 }).default('Putra'), // Putra, Putri
  capacity: integer("capacity").default(0),
  room: varchar("room", { length: 100 }), // e.g., "Gedung A LT-1"
  teacherId: varchar("teacher_id", { length: 21 }).references(() => teachers.id), // Wali Kelas
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 2. CORE DATA
// ==========================================

export const students = pgTable("students", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  nis: varchar("nis", { length: 50 }).notNull().unique(),
  nisn: varchar("nisn", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 20 }),
  birthPlace: varchar("birth_place", { length: 100 }),
  birthDate: date("birth_date"),
  address: text("address"),
  province: varchar("province", { length: 255 }),
  regency: varchar("regency", { length: 255 }),
  district: varchar("district", { length: 255 }),
  village: varchar("village", { length: 255 }),
  parentName: varchar("parent_name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  dormitoryId: varchar("dormitory_id", { length: 21 }).references(() => dormitories.id),
  roomCode: varchar("room_code", { length: 50 }), // e.g., "A.01"
  regionId: varchar("region_id", { length: 21 }).references(() => regions.id), // legacy
  status: varchar("status", { length: 50 }).default('Aktif'), // Aktif, Lulus, Keluar
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Menghubungkan Siswa dengan Kelas per Tahun Ajaran (History)
export const studentClassrooms = pgTable("student_classrooms", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  studentId: varchar("student_id", { length: 21 }).references(() => students.id).notNull(),
  classroomId: varchar("classroom_id", { length: 21 }).references(() => classrooms.id).notNull(),
  academicYearId: varchar("academic_year_id", { length: 21 }).references(() => academicYears.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mata Pelajaran (Subjects)
export const subjects = pgTable("subjects", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  category: varchar("category", { length: 100 }), // Fiqh, Hadits, etc.
  level: text("level"), // Madrasah Ula, Wustha, etc.
  description: text("description"),
  status: varchar("status", { length: 50 }).default('Aktif'),
  icon: varchar("icon", { length: 50 }).default("BookOpen"), // Lucide icon name
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Penugasan Pengajaran (Teaching Assignments)
export const teachingAssignments = pgTable("teaching_assignments", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  teacherId: varchar("teacher_id", { length: 21 }).references(() => teachers.id).notNull(),
  subjectId: varchar("subject_id", { length: 21 }).references(() => subjects.id).notNull(),
  classroomId: varchar("classroom_id", { length: 21 }).references(() => classrooms.id).notNull(),
  academicYearId: varchar("academic_year_id", { length: 21 }).references(() => academicYears.id),
  day: varchar("day", { length: 20 }), // Senin, Selasa, etc.
  period: varchar("period", { length: 50 }), // e.g., "07:30 - 09:00"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Target Hafalan (Memorize Targets)
export const memorizeTargets = pgTable("memorize_targets", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // Al-Quran, Surat Pendek, etc.
  levels: text("levels"), // Madrasah Ula, Wustha, etc. (comma separated)
  points: integer("points").default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 3. TRANSACTIONAL DATA
// ==========================================

export const attendances = pgTable("attendances", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  studentId: varchar("student_id", { length: 21 }).references(() => students.id).notNull(),
  academicYearId: varchar("academic_year_id", { length: 21 }).references(() => academicYears.id).notNull(),
  date: date("date").notNull(),
  session: integer("session").notNull().default(1), // 1, 2, 3
  status: attendanceStatusEnum("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    attendanceUniqueIdx: uniqueIndex("attendance_unique_idx").on(table.studentId, table.date, table.session),
  }
});

export const achievements = pgTable("achievements", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  studentId: varchar("student_id", { length: 21 }).references(() => students.id).notNull(),
  academicYearId: varchar("academic_year_id", { length: 21 }).references(() => academicYears.id).notNull(),
  category: varchar("category", { length: 255 }).notNull(), // Comma separated: Akademik, Hafalan, etc.
  title: varchar("title", { length: 255 }).notNull(),
  level: varchar("level", { length: 100 }), // Internasional, Nasional, etc.
  rank: varchar("rank", { length: 100 }), // Juara 1, Finalis, etc.
  description: text("description"),
  date: date("date").notNull(),
  score: integer("score").default(0), // Points / Nilai
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scores = pgTable("scores", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  studentId: varchar("student_id", { length: 21 }).references(() => students.id).notNull(),
  subjectId: varchar("subject_id", { length: 21 }).references(() => subjects.id).notNull(),
  academicYearId: varchar("academic_year_id", { length: 21 }).references(() => academicYears.id).notNull(),
  harian: integer("harian").default(0),
  semester: integer("semester").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studentNotes = pgTable("student_notes", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  studentId: varchar("student_id", { length: 21 }).references(() => students.id).notNull(),
  academicYearId: varchar("academic_year_id", { length: 21 }).references(() => academicYears.id).notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==========================================
// 4. SYSTEM & LOGS
// ==========================================

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull().default("info"), // info, success, warning, error
  userId: varchar("user_id", { length: 21 }), // Reference to user/teacher if needed
  module: varchar("module", { length: 100 }), // e.g., "Sistem", "Akademik", "Admin"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  component: varchar("component", { length: 100 }).notNull(), // e.g., "Database Server"
  description: text("description"), // e.g., "Normal • Latency 12ms"
  status: varchar("status", { length: 50 }).notNull(), // e.g., "Online", "Stabil", "Peringatan"
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// ==========================================
// RELATIONS
// ==========================================

export const teachersRelations = relations(teachers, ({ many }) => ({
  classrooms: many(classrooms),
}));

export const academicYearsRelations = relations(academicYears, ({ many }) => ({
  studentClassrooms: many(studentClassrooms),
  attendances: many(attendances),
  achievements: many(achievements),
}));

export const dormitoriesRelations = relations(dormitories, ({ many }) => ({
  students: many(students),
}));

export const regionsRelations = relations(regions, ({ many }) => ({
  students: many(students),
}));

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [classrooms.teacherId],
    references: [teachers.id],
  }),
  studentClassrooms: many(studentClassrooms),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  dormitory: one(dormitories, {
    fields: [students.dormitoryId],
    references: [dormitories.id],
  }),
  region: one(regions, {
    fields: [students.regionId],
    references: [regions.id],
  }),
  studentClassrooms: many(studentClassrooms),
  attendances: many(attendances),
  achievements: many(achievements),
  scores: many(scores),
  studentNotes: many(studentNotes),
}));

export const studentClassroomsRelations = relations(studentClassrooms, ({ one }) => ({
  student: one(students, {
    fields: [studentClassrooms.studentId],
    references: [students.id],
  }),
  classroom: one(classrooms, {
    fields: [studentClassrooms.classroomId],
    references: [classrooms.id],
  }),
  academicYear: one(academicYears, {
    fields: [studentClassrooms.academicYearId],
    references: [academicYears.id],
  }),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  student: one(students, {
    fields: [attendances.studentId],
    references: [students.id],
  }),
  academicYear: one(academicYears, {
    fields: [attendances.academicYearId],
    references: [academicYears.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  student: one(students, {
    fields: [achievements.studentId],
    references: [students.id],
  }),
  academicYear: one(academicYears, {
    fields: [achievements.academicYearId],
    references: [academicYears.id],
  }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  student: one(students, {
    fields: [scores.studentId],
    references: [students.id],
  }),
  subject: one(subjects, {
    fields: [scores.subjectId],
    references: [subjects.id],
  }),
  academicYear: one(academicYears, {
    fields: [scores.academicYearId],
    references: [academicYears.id],
  }),
}));

export const studentNotesRelations = relations(studentNotes, ({ one }) => ({
  student: one(students, {
    fields: [studentNotes.studentId],
    references: [students.id],
  }),
  academicYear: one(academicYears, {
    fields: [studentNotes.academicYearId],
    references: [academicYears.id],
  }),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  teachingAssignments: many(teachingAssignments),
}));

export const teachingAssignmentsRelations = relations(teachingAssignments, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teachingAssignments.teacherId],
    references: [teachers.id],
  }),
  subject: one(subjects, {
    fields: [teachingAssignments.subjectId],
    references: [subjects.id],
  }),
  classroom: one(classrooms, {
    fields: [teachingAssignments.classroomId],
    references: [classrooms.id],
  }),
  academicYear: one(academicYears, {
    fields: [teachingAssignments.academicYearId],
    references: [academicYears.id],
  }),
}));

export const teacherAttendances = pgTable("teacher_attendances", {
  id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
  teacherId: varchar("teacher_id", { length: 21 }).references(() => teachers.id).notNull(),
  subjectId: varchar("subject_id", { length: 21 }).references(() => subjects.id).notNull(),
  classroomId: varchar("classroom_id", { length: 21 }).references(() => classrooms.id).notNull(),
  academicYearId: varchar("academic_year_id", { length: 21 }).references(() => academicYears.id).notNull(),
  date: date("date").notNull(),
  session: integer("session").notNull().default(1), // 1, 2, 3
  status: attendanceStatusEnum("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    teacherAttendanceUniqueIdx: uniqueIndex("teacher_attendance_unique_idx").on(table.teacherId, table.subjectId, table.classroomId, table.date, table.session),
  }
});

export const teacherAttendancesRelations = relations(teacherAttendances, ({ one }) => ({
  teacher: one(teachers, {
    fields: [teacherAttendances.teacherId],
    references: [teachers.id],
  }),
  subject: one(subjects, {
    fields: [teacherAttendances.subjectId],
    references: [subjects.id],
  }),
  classroom: one(classrooms, {
    fields: [teacherAttendances.classroomId],
    references: [classrooms.id],
  }),
  academicYear: one(academicYears, {
    fields: [teacherAttendances.academicYearId],
    references: [academicYears.id],
  }),
}));
