"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PackageSelection {
  name: string;
  username: string;
  image: string | null;
  symbol: string;
  timeframe: string;
  payPrice: number;
  paid: string; // "YES" or "NO"
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
}

interface UsePackageSelectionsReturn {
  data: PackageSelection[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  total: number;
  hasMore: boolean;
  loadMore: () => void;
}

// Simple in-memory cache
const cache = new Map<
  string,
  { data: PackageSelection[]; timestamp: number; total: number }
>();
const CACHE_DURATION = 30000; // 30 seconds

export function usePackageSelections(): UsePackageSelectionsReturn {
  const [data, setData] = useState<PackageSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const cacheKey = `package-selections-${pageNum}`;
      const cached = cache.get(cacheKey);

      // Check cache first
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (append) {
          setData((prev) => [...prev, ...cached.data]);
        } else {
          setData(cached.data);
        }
        setTotal(cached.total);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/package-selections?page=${pageNum}&limit=50`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          const newData = result.data || [];

          // Update cache
          cache.set(cacheKey, {
            data: newData,
            timestamp: Date.now(),
            total: result.total || 0,
          });

          if (append) {
            setData((prev) => [...prev, ...newData]);
          } else {
            setData(newData);
          }
          setTotal(result.total || 0);
        } else {
          throw new Error(result.message || "Failed to fetch data");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Request was cancelled
        }
        console.error("Error fetching package selections:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refetch = useCallback(() => {
    cache.clear(); // Clear cache on manual refetch
    setPage(1);
    fetchData(1, false);
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!loading && data.length < total) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, true);
    }
  }, [loading, data.length, total, page, fetchData]);

  useEffect(() => {
    fetchData(1, false);

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    total,
    hasMore: data.length < total,
    loadMore,
  };
}
