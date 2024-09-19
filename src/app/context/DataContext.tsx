import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { createContext, useContext } from "react";

import { getStats } from "@/app/api/getStats";

type DataContextType = {
  cryptoPrices: any;
  cryptoLoading: boolean;
  cryptoError: any;
  statsData: any;
  statsLoading: boolean;
  statsError: any;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({
  children,
  refreshInterval = 300000,
  assets = [],
}: {
  children: React.ReactNode;
  refreshInterval?: number;
  assets?: string[];
}) => {
  const {
    data: cryptoPrices,
    isLoading: cryptoLoading,
    error: cryptoError,
  } = useQuery({
    queryKey: ["cryptoPrices", assets],
    queryFn: async () => {
      const ids = assets.join(",");
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids,
            vs_currencies: "usd",
          },
        },
      );
      return response.data;
    },
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: false,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["API_STATS"],
    queryFn: async () => getStats(),
    refetchInterval: 60000,
  });

  return (
    <DataContext.Provider
      value={{
        cryptoPrices,
        cryptoLoading,
        cryptoError,
        statsData,
        statsLoading,
        statsError,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
