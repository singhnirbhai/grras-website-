import { useQuery } from "@tanstack/react-query";

export const useFaculties = () => {
  return useQuery({
    queryKey: ["faculties"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/faculty");
        if (!res.ok) return [];
        const data = await res.json();
        return data && data.isSuccess ? (data.allData || data.data || []) : [];
      } catch (error) {
        console.error("Error fetching faculties:", error);
        return [];
      }
    },
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/course");
        if (!res.ok) return [];
        const data = await res.json();
        return data && data.isSuccess ? (data.data || []) : [];
      } catch (error) {
        console.error("Error fetching courses:", error);
        return [];
      }
    },
  });
};

export const useBatches = (params?: { page?: number; limit?: number; search?: string; faculty?: string; sortField?: string; sortDirection?: string }) => {
  return useQuery({
    queryKey: ["batches", params],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              queryParams.append(key, String(val));
            }
          });
        }
        const res = await fetch(`/api/batch?${queryParams.toString()}`);
        if (!res.ok) {
          const arr: any = [];
          arr.totalCount = 0;
          arr.totalPages = 1;
          arr.currentPage = 1;
          return arr;
        }
        const data = await res.json();
        const arr = data && data.isSuccess ? (data.data || []) : [];
        arr.totalCount = data?.totalCount || arr.length;
        arr.totalPages = data?.totalPages || 1;
        arr.currentPage = data?.currentPage || 1;
        return arr;
      } catch (error) {
        console.error("Error fetching batches:", error);
        const arr: any = [];
        arr.totalCount = 0;
        arr.totalPages = 1;
        arr.currentPage = 1;
        return arr;
      }
    },
  });
};

export const useStudents = (params?: { page?: number; limit?: number; search?: string; faculty?: string; batch?: string; sortField?: string; sortDirection?: string }) => {
  return useQuery({
    queryKey: ["students", params],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              queryParams.append(key, String(val));
            }
          });
        }
        const res = await fetch(`/api/student?${queryParams.toString()}`);
        if (!res.ok) {
          const arr: any = [];
          arr.totalCount = 0;
          arr.totalPages = 1;
          arr.currentPage = 1;
          return arr;
        }
        const data = await res.json();
        const arr = data && data.isSuccess ? (data.allData || data.data || []) : [];
        arr.totalCount = data?.totalCount || arr.length;
        arr.totalPages = data?.totalPages || 1;
        arr.currentPage = data?.currentPage || 1;
        return arr;
      } catch (error) {
        console.error("Error fetching students:", error);
        const arr: any = [];
        arr.totalCount = 0;
        arr.totalPages = 1;
        arr.currentPage = 1;
        return arr;
      }
    },
  });
};

export const useQuizzes = (params?: { page?: number; limit?: number; search?: string; faculty?: string; batch?: string }) => {
  return useQuery({
    queryKey: ["quizzes", params],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("includeExpired", "true");
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              queryParams.append(key, String(val));
            }
          });
        }
        const res = await fetch(`/api/quiz?${queryParams.toString()}`);
        if (!res.ok) {
          const arr: any = [];
          arr.totalCount = 0;
          arr.totalPages = 1;
          arr.currentPage = 1;
          return arr;
        }
        const data = await res.json();
        const arr = data && data.isSuccess ? (data.data || []) : [];
        arr.totalCount = data?.totalCount || arr.length;
        arr.totalPages = data?.totalPages || 1;
        arr.currentPage = data?.currentPage || 1;
        return arr;
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        const arr: any = [];
        arr.totalCount = 0;
        arr.totalPages = 1;
        arr.currentPage = 1;
        return arr;
      }
    },
  });
};

export const useResults = () => {
  return useQuery({
    queryKey: ["results"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/quiz/results");
        if (!res.ok) return [];
        const data = await res.json();
        return data && data.isSuccess ? (data.data || []) : [];
      } catch (error) {
        console.error("Error fetching results:", error);
        return [];
      }
    },
  });
};

export const useLeaderboard = (fileName: string, batch?: string) => {
  return useQuery({
    queryKey: ["leaderboard", fileName, batch],
    queryFn: async () => {
      if (!fileName) return [];
      try {
        let url = `/api/quiz/leaderboard?fileName=${encodeURIComponent(fileName)}`;
        if (batch) {
          url += `&batch=${encodeURIComponent(batch)}`;
        }
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return data && data.isSuccess ? ((data.data && data.data.leaderboard) || []) : [];
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
      }
    },
    enabled: !!fileName,
  });
};


