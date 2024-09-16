// context/DataContext.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { createContext, useContext } from "react";

type DataContextType = {
  data: any;
  isLoading: boolean;
  error: any;
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
  const { data, isLoading, error } = useQuery({
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

  return (
    <DataContext.Provider value={{ data, isLoading, error }}>
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
