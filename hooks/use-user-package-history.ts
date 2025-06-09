import { useCallback, useEffect, useState } from "react";

interface PackageSelection {
  name: string;
  username: string;
  image: string | null;
  symbol: string;
  timeframe: string;
  payPrice: number;
  paid: string;
  startDate: string;
  endDate: string;
  createdAt: string | null;
}

interface ApiResponse {
  success: boolean;
  data: PackageSelection[];
  total: number;
  page: number;
  limit: number;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

export function useUserPackageHistory(
  userId?: string,
  options: PaginationOptions = {}
) {
  const { page = 1, limit = 10 } = options;
  const [packageSelections, setPackageSelections] = useState<
    PackageSelection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPackageSelections = useCallback(
    async (pageNum = currentPage) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          userId: userId,
          page: pageNum.toString(),
          limit: limit.toString(),
        });

        const response = await fetch(`/api/package-selections?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch package selections");
        }

        const data: ApiResponse = await response.json();

        if (data.success) {
          setPackageSelections(data.data);
          setTotalCount(data.total);
          setCurrentPage(data.page);
          setTotalPages(Math.ceil(data.total / data.limit));
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching package selections:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [userId, limit, currentPage]
  );

  useEffect(() => {
    fetchPackageSelections();
  }, [fetchPackageSelections]);

  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
        fetchPackageSelections(pageNum);
      }
    },
    [totalPages, fetchPackageSelections]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  return {
    packageSelections,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    limit,
    refetch: fetchPackageSelections,
    goToPage,
    nextPage,
    prevPage,
  };
}
