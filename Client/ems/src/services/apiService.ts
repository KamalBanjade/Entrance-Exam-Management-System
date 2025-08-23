import axios, { type AxiosResponse } from "axios";
import type {
  User,
  Exam,
  Question,
  Answer,
  StudentData,
  NewExam,
  ApiResponse,
} from "../types";

// === Response Interfaces ===
interface DashboardStats {
  scheduled: number;
  running: number;
  completed: number;
  cancelled: number;
  recentCompletions: number;
}

interface RunningExam {
  _id: string;
  title: string;
  program: string;
  date: string;
  time: string;
  duration: number;
  examType: string;
  studentId?: {
    name: string;
    username: string;
  };
}

interface UpcomingExam {
  _id: string;
  title: string;
  program: string;
  date: string;
  time: string;
  examType: string;
  studentId?: {
    name: string;
    username: string;
  };
}

interface DashboardData {
  stats: DashboardStats;
  runningExams: RunningExam[];
  upcomingExams: UpcomingExam[];
}

interface NewQuestion {
  examId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category?: string;
}

interface CongratulationResponse {
  success: boolean;
  message: string;
  result: Answer;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`API Error: ${error.config?.url}`, error.message);
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

export const apiService = {
  adminLogin: async (
    username: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    token?: string;
    user?: User;
  }> => {
    try {
      const response = await api.post("/auth/admin-login", {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error in admin login:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  checkStudentCredentials: async (
    username: string,
    password: string
  ): Promise<{
    success: boolean;
    message: string;
    user?: User;
  }> => {
    try {
      const response = await api.post("/auth/check-student-credentials", {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error checking student credentials:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  studentLogin: async (
    username: string,
    password: string,
    dob: string
  ): Promise<{
    success: boolean;
    message: string;
    token?: string;
    user?: User;
  }> => {
    try {
      const response = await api.post("/auth/student-login", {
        username,
        password,
        dob,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error in student login:", error);
      throw error.response?.data || { message: error.message };
    }
  },
  forgotPassword: async (
    email: string,
    username: string,
    dob: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await api.post("/auth/forgot-password", {
        email,
        username,
        dob,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error in forgot password:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error in reset password:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  getExams: async (): Promise<Exam[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Exam[]>> = await api.get(
        "/student/exams"
      );
      return response.data.exams || [];
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      throw error;
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response: AxiosResponse<User> = await api.get("/student/profile");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  startExam: async (
    examId: string
  ): Promise<{
    success: boolean;
    message: string;
    exam: {
      _id: string;
      title: string;
      duration: number;
      program: string;
      startedAt: Date;
      questions: string[];
    };
  }> => {
    try {
      const response = await api.post(`/student/start-exam/${examId}`);

      // Transform the response to match ExamData
      const examData = {
        _id: response.data.exam._id,
        title: response.data.exam.title,
        duration: response.data.exam.duration,
        program: response.data.exam.program,
        startedAt: new Date(response.data.exam.startedAt),
        questions: response.data.exam.questions || [],
      };

      return {
        success: response.data.success,
        message: response.data.message,
        exam: examData,
      };
    } catch (error: any) {
      console.error("Error starting exam:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  getExamQuestions: async (
    examId: string
  ): Promise<{
    success: boolean;
    message: string;
    exam: Exam;
    questions: Question[];
  }> => {
    try {
      const response = await api.get(`/student/exam/${examId}/questions`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching exam questions:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  submitExam: async (payload: {
    examId: string;
    answers: { qId: string; selected: string }[];
  }): Promise<{
    success: boolean;
    message: string;
    result: {
      score: number;
      totalQuestions: number;
      percentage: number;
      status: "pass" | "fail";
    };
  }> => {
    try {
      const response = await api.post("/student/submit-exam", payload);
      return response.data;
    } catch (error: any) {
      console.error("Error submitting exam:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  getResults: async (): Promise<Answer[]> => {
    try {
      const response: AxiosResponse<{ success: boolean; results: Answer[] }> =
        await api.get("/student/results");
      return response.data.results || [];
    } catch (error: any) {
      console.error("Error fetching results:", error);
      return [];
    }
  },


  getDashboardStats: async (): Promise<DashboardData> => {
    try {
      const response = await api.get("/admin/exams");
      const exams =
        response.data.exams || response.data.data || response.data || [];

      const stats: DashboardStats = {
        scheduled: exams.filter((exam: any) => exam.status === "scheduled")
          .length,
        running: exams.filter((exam: any) => exam.status === "running").length,
        completed: exams.filter((exam: any) => exam.status === "completed")
          .length,
        cancelled: exams.filter((exam: any) => exam.status === "cancelled")
          .length,
        recentCompletions: exams.filter((exam: any) => {
          if (exam.status !== "completed" || !exam.createdAt) return false;
          const completedDate = new Date(exam.createdAt);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return completedDate >= yesterday;
        }).length,
      };

      const runningExams: RunningExam[] = exams
        .filter((exam: any) => exam.status === "running")
        .slice(0, 10)
        .map((exam: any) => ({
          _id: exam._id,
          title: exam.title,
          program: exam.program,
          date: exam.date,
          time: exam.time,
          duration: Number(exam.duration) || 60,
          examType: exam.examType || "general",
          studentId: exam.studentId
            ? {
                name: exam.studentId.name || "Unknown",
                username: exam.studentId.username || "unknown",
              }
            : undefined,
        }));

      const upcomingExams: UpcomingExam[] = exams
        .filter((exam: any) => {
          if (exam.status !== "scheduled") return false;
          const examDateTime = new Date(`${exam.date}T${exam.time}`);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return examDateTime <= tomorrow;
        })
        .slice(0, 5)
        .map((exam: any) => ({
          _id: exam._id,
          title: exam.title,
          program: exam.program,
          date: exam.date,
          time: exam.time,
          examType: exam.examType || "general",
          studentId: exam.studentId
            ? {
                name: exam.studentId.name || "Unknown",
                username: exam.studentId.username || "unknown",
              }
            : undefined,
        }));

      return { stats, runningExams, upcomingExams };
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      return {
        stats: {
          scheduled: 0,
          running: 0,
          completed: 0,
          cancelled: 0,
          recentCompletions: 0,
        },
        runningExams: [],
        upcomingExams: [],
      };
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get("/admin/users");
      return response.data.users || response.data.data || response.data || [];
    } catch (error: any) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  createStudent: async (studentData: StudentData): Promise<User> => {
    try {
      const response = await api.post("/admin/students", studentData);
      return response.data.student || response.data;
    } catch (error: any) {
      console.error("Error creating student:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  updateStudent: async (
    id: string,
    studentData: Partial<StudentData>
  ): Promise<User> => {
    try {
      const response = await api.put(`/admin/students/${id}`, studentData);
      return response.data.student || response.data;
    } catch (error: any) {
      console.error("Error updating student:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        payload: studentData,
      });
      throw error.response?.data || { message: error.message };
    }
  },

  deleteStudent: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/students/${id}`);
    } catch (error: any) {
      console.error("Error deleting student:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  getallExams: async (params?: {
    status?: string;
    program?: string;
    examType?: string;
    page?: number;
    limit?: number;
  }): Promise<Exam[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Exam[]>> = await api.get(
        "/admin/exams",
        { params }
      );
      const { data } = response;
      return data.data || data.exams || (Array.isArray(data) ? data : []) || [];
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      return [];
    }
  },

  createExam: async (examData: NewExam): Promise<Exam> => {
    try {
      const response = await api.post("/admin/exams", examData);
      return response.data.exam || response.data;
    } catch (error: any) {
      console.error("Error creating exam:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  updateExam: async (id: string, examData: Partial<NewExam>): Promise<Exam> => {
    try {
      const response = await api.put(`/admin/exams/${id}`, examData);
      return response.data.exam || response.data;
    } catch (error: any) {
      console.error("Error updating exam:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  deleteExam: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/exams/${id}`);
    } catch (error: any) {
      console.error("Error deleting exam:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  notifyStudents: async (examId: string, program: string): Promise<void> => {
    try {
      await api.post("/admin/notify-students", { examId, program });
    } catch (error: any) {
      console.error("Error notifying students:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  getRunningExams: async (): Promise<RunningExam[]> => {
    try {
      const response = await api.get("/admin/exams?status=running");
      return response.data.exams || response.data.data || response.data || [];
    } catch (error: any) {
      console.error("Error fetching running exams:", error);
      return [];
    }
  },

  getScheduledExams: async (): Promise<Exam[]> => {
    try {
      const response = await api.get("/admin/exams?status=scheduled");
      return response.data.exams || response.data.data || response.data || [];
    } catch (error: any) {
      console.error("Error fetching scheduled exams:", error);
      return [];
    }
  },

  createQuestion: async (questionData: NewQuestion): Promise<Question> => {
    try {
      const response = await api.post("/admin/questions", questionData);
      return response.data.question || response.data;
    } catch (error: any) {
      console.error("Error creating question:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  updateQuestion: async (
    questionId: string,
    questionData: Partial<NewQuestion>
  ): Promise<Question> => {
    try {
      const response = await api.put(
        `/admin/questions/${questionId}`,
        questionData
      );
      return response.data.question || response.data;
    } catch (error: any) {
      console.error("Error updating question:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    try {
      await api.delete(`/admin/questions/${questionId}`);
    } catch (error: any) {
      console.error("Error deleting question:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  getAllExamQuestions: async (examId: string): Promise<Question[]> => {
    try {
      const response = await api.get(`/admin/exams/${examId}/questions`);
      return (
        response.data.questions ||
        response.data.data ||
        (Array.isArray(response.data) ? response.data : []) ||
        []
      );
    } catch (error: any) {
      console.error("Error fetching exam questions:", error);
      return [];
    }
  },

  addQuestionsToExam: async (
    examId: string,
    questions: NewQuestion[]
  ): Promise<Exam> => {
    try {
      const response = await api.post(
        `/admin/exams/${examId}/questions`,
        questions
      );
      return response.data.exam || response.data;
    } catch (error: any) {
      console.error("Error adding questions to exam:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  getAllResults: async (): Promise<Answer[]> => {
    try {
      const response = await api.get("/admin/results");
      return response.data.results || response.data.data || response.data || [];
    } catch (error: any) {
      console.error("Error fetching all results:", error);
      return [];
    }
  },

  getResultsByProgram: async (program: string): Promise<Answer[]> => {
    try {
      const params = program && program !== "all" ? { program } : {};
      const response = await api.get("/admin/results", { params });
      const results =
        response.data.results || response.data.data || response.data || [];
      return Array.isArray(results) ? results : [];
    } catch (error: any) {
      console.error("Error fetching results by program:", error);
      return [];
    }
  },

  getQuestionsByProgram: async (program: string): Promise<Question[]> => {
    try {
      const response = await api.get("/admin/questions", {
        params: { program },
      });
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching questions by program:", error);
      return [];
    }
  },


  getQuestionsByIds: async (questionIds: string[]): Promise<any[]> => {
    try {
      const response = await api.post("/admin/questions/by-ids", {
        questionIds,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching questions by IDs:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  createQuestionByProgram: async (questionData: {
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    program: string;
  }): Promise<Question> => {
    try {
      const response = await api.post("/admin/questions", questionData);
      return response.data.question || response.data;
    } catch (error: any) {
      console.error("Error creating question:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  downloadResultPDF: async (resultId: string): Promise<void> => {
    try {
      const response = await api.get(`/admin/results/${resultId}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `result-${resultId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading result PDF:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  sendCongratulationEmail: async (
    resultId: string
  ): Promise<CongratulationResponse> => {
    try {
      const response = await api.post(
        `/admin/results/${resultId}/congratulation`
      );
      return response.data as CongratulationResponse;
    } catch (error: any) {
      console.error("Error sending congratulation email:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error: any) {
      console.error("Error checking health:", error);
      throw error.response?.data || { message: error.message };
    }
  },

  getServerStats: async (): Promise<any> => {
    try {
      const response = await api.get("/admin/server-stats");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching server stats:", error);
      throw error.response?.data || { message: error.message };
    }
  },
};
