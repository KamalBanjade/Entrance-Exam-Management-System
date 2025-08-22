

export type Exam = {
  _id: string;
  title: string;
  studentId?: string | User; // Allow string or User object
  assignedTo?: string;
  program: string;
  date: string;
  time: string;
  duration: string | number; // Keep as string | number to match API response
  questions: string[];
  status: 'pending' | 'scheduled' | 'running' | 'completed' | 'cancelled'; // Add 'running'
  displayStatus: 'upcoming' | 'available' | 'completed' | 'expired';
  examType?: 'student-specific' | 'general';
  createdAt?: string;
  updatedAt?: string;
  canStart?: boolean;
  questionsCount?: number;
  startedAt?: Date; // Add startedAt field
};

export interface NewExam {
  title: string;
  program: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  studentId?: string | null;
  assignedTo?: string | null;
  examType?: 'general' | 'student-specific';
}

export type Question = {
  _id: string;
  examId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  program:string;
};

// types.ts
export interface NewQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  category?: string;
  program: string;           // ← Add this line
}
export interface UpdateQuestionData {
  question?: string;
  options?: string[];
  correctAnswer?: string;
  category?: string;
}

export interface Answer {
  _id: string;
  studentId: { _id: string; name: string; email: string; program: string };
  examId: { _id: string; title: string; date: string; time: string };
  answers: { qId: string; selected: string }[];
  score: number;
  totalQuestions: number;
  percentage: number;
  result: 'pass' | 'fail' | null; // Add result field
  status: 'not-started' | 'in-progress' | 'submitted'; // Update status
  startedAt?: string; // Optional, as it may not always be set
  submittedAt?: string; // Already present, keep as string
  rank?: number;
    sending?: boolean;
  congratulationSent?: boolean;
  validationDetails?: {
    questionId: string;
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
  generatedQuestions?: string[]; // ObjectId refs as strings in TypeScript
}

export interface StudentData {
  name: string;
  username: string;
  password?: string;
  dob: string;
  email: string;
  phone: string;
  program: string;
  examTitle?: string;
  examDate?: string;
  examTime?: string;
  examDuration: number;
  role: 'student';
}
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;           // ← Make optional
  exams?: T;          // ← Make optional
  total?: number;
  page?: number;
  profile?:string;
}

export interface User {
  _id: string;
  role: "admin" | "student";
  name: string;
  username: string;
  dob?: string;
  email: string;
  phone: string;
  program: "BCSIT" | "BCA" | "BBA" | null; // Note: You have "BSCIT" here, but backend uses "BCSIT". Ensure consistency.
  createdAt: string;
  exam?: {
    examTitle: string;
    examDate: string;
    examTime: string;
    examDuration: number;
  };
}

// Assuming newStudent has a similar type
export interface NewStudent {
  name: string;
  username: string;
  password: string;
  dob: string;
  email: string;
  phone: string;
  program: "BSCIT" | "BCA" | "BBA" | "";
  examTitle: string;
  examDate: string;
  examTime: string;
  examDuration: number;
  role: "student";
}