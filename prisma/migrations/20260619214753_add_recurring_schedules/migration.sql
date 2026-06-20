-- CreateTable
CREATE TABLE "recurring_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration_hours" REAL NOT NULL DEFAULT 1.5,
    "value" REAL NOT NULL,
    "modality" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "recurring_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recurring_schedules_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recurring_schedules_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lessons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "package_id" TEXT,
    "date" DATETIME NOT NULL,
    "start_time" DATETIME NOT NULL,
    "duration_hours" REAL NOT NULL,
    "value" REAL NOT NULL,
    "modality" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGENDADA',
    "recurrence" TEXT,
    "recurrence_group_id" TEXT,
    "recurring_schedule_id" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lessons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lessons_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lessons_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lessons_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lessons_recurring_schedule_id_fkey" FOREIGN KEY ("recurring_schedule_id") REFERENCES "recurring_schedules" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_lessons" ("created_at", "date", "duration_hours", "id", "modality", "notes", "package_id", "recurrence", "recurrence_group_id", "start_time", "status", "student_id", "subject_id", "updated_at", "user_id", "value") SELECT "created_at", "date", "duration_hours", "id", "modality", "notes", "package_id", "recurrence", "recurrence_group_id", "start_time", "status", "student_id", "subject_id", "updated_at", "user_id", "value" FROM "lessons";
DROP TABLE "lessons";
ALTER TABLE "new_lessons" RENAME TO "lessons";
CREATE INDEX "lessons_date_idx" ON "lessons"("date");
CREATE INDEX "lessons_status_idx" ON "lessons"("status");
CREATE INDEX "lessons_recurrence_group_id_idx" ON "lessons"("recurrence_group_id");
CREATE INDEX "lessons_recurring_schedule_id_idx" ON "lessons"("recurring_schedule_id");
CREATE TABLE "new_students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_name" TEXT,
    "parent_phone" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "school" TEXT,
    "age" INTEGER,
    "grade_level" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "fixed_schedule_active" BOOLEAN NOT NULL DEFAULT false,
    "fixed_schedule_day" TEXT,
    "fixed_schedule_time" TEXT,
    "fixed_schedule_price" REAL,
    "fixed_schedule_temp_disabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_students" ("active", "age", "created_at", "email", "grade_level", "id", "name", "notes", "parent_name", "parent_phone", "school", "updated_at", "user_id") SELECT "active", "age", "created_at", "email", "grade_level", "id", "name", "notes", "parent_name", "parent_phone", "school", "updated_at", "user_id" FROM "students";
DROP TABLE "students";
ALTER TABLE "new_students" RENAME TO "students";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
