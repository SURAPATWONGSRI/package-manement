"use client";

import { useEffect, useState } from "react";

interface PackageSelection {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  name: string;
  email: string;
  packages: any[];
  payPrice: number;
  startDate: string;
  endDate: string;
  paid: boolean;
  stripeCustomerId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface UsePackageSelectionsReturn {
  data: PackageSelection[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePackageSelections(): UsePackageSelectionsReturn {
  const [data, setData] = useState<PackageSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/package-selections");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching package selections:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
