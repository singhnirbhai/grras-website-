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

export const useBatches = () => {
  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/batch");
        if (!res.ok) return [];
        const data = await res.json();
        return data && data.isSuccess ? (data.data || []) : [];
      } catch (error) {
        console.error("Error fetching batches:", error);
        return [];
      }
    },
  });
};

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/student");
        if (!res.ok) return [];
        const data = await res.json();
        return data && data.isSuccess ? (data.allData || data.data || []) : [];
      } catch (error) {
        console.error("Error fetching students:", error);
        return [];
      }
    },
  });
};

export const useQuizzes = () => {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/quiz?includeExpired=true");
        if (!res.ok) return [];
        const data = await res.json();
        return data && data.isSuccess ? (data.data || []) : [];
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        return [];
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


