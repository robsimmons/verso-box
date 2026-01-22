// types.ts - types for the transcript service

export type Course = string;
export type StudentID = number;
export type StudentName = string;
export type Student = { studentID: StudentID; studentName: StudentName };
export type CourseGrade = { course: Course; grade: number };
export type Transcript = { student: Student; grades: CourseGrade[] };
