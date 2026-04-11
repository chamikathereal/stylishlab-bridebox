import { useState, useMemo, useCallback } from "react";
import { getLocalDateString } from "@/lib/utils";
import { PeriodReportResponse, PayrollResponse } from "@/api/generated/model";

export type PeriodType = "daily" | "weekly" | "monthly" | "yearly" | "total";

interface UsePeriodFilterOptions {
  initialPeriod?: PeriodType;
  initialDate?: string;
}

export function usePeriodFilter(options: UsePeriodFilterOptions = {}) {
  const todayStr = useMemo(() => getLocalDateString(), []);
  
  const [kpiPeriod, setKpiPeriod] = useState<PeriodType>(options.initialPeriod || "monthly");
  const [selectedDate, setSelectedDate] = useState(options.initialDate || todayStr);

  const selectedMonth = useMemo(() => selectedDate.substring(0, 7), [selectedDate]);
  const selectedYear = useMemo(() => parseInt(selectedDate.substring(0, 4)), [selectedDate]);

  const reset = useCallback(() => {
    setKpiPeriod("monthly");
    setSelectedDate(todayStr);
  }, [todayStr]);

  const isDateInSelectedWeek = (dateStr: string, targetDate: string) => {
    const date = new Date(dateStr);
    const target = new Date(targetDate);
    const first = target.getDate() - target.getDay();
    const last = first + 6;
    
    const firstDay = new Date(new Date(target).setDate(first));
    const lastDay = new Date(new Date(target).setDate(last));
    
    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    return date >= firstDay && date <= lastDay;
  };

  const isDateInSelectedPeriod = useCallback(
    (recordDateStr: string | undefined | null) => {
      if (kpiPeriod === "total") return true;
      if (!recordDateStr) return false;

      const recordDate = recordDateStr.split("T")[0];

      switch (kpiPeriod) {
        case "daily":
          return recordDate === selectedDate;
        case "monthly":
          return recordDate.startsWith(selectedMonth);
        case "yearly":
          return recordDate.startsWith(selectedYear.toString());
        case "weekly":
          return isDateInSelectedWeek(recordDate, selectedDate);
        default:
          return true;
      }
    },
    [kpiPeriod, selectedDate, selectedMonth, selectedYear],
  );

  const dateRange = useMemo(() => {
    if (kpiPeriod === "total") return { from: "1970-01-01", to: "2099-12-31" };

    const target = new Date(selectedDate);
    let from: string, to: string;

    switch (kpiPeriod) {
      case "daily":
        from = selectedDate;
        to = selectedDate;
        break;
      case "weekly": {
        // Find Sunday of the week
        const day = target.getDay();
        const diff = target.getDate() - day;
        const sunday = new Date(new Date(target).setDate(diff));
        const saturday = new Date(new Date(sunday).setDate(sunday.getDate() + 6));
        from = getLocalDateString(sunday);
        to = getLocalDateString(saturday);
        break;
      }
      case "monthly": {
        from = `${selectedMonth}-01`;
        const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0);
        to = getLocalDateString(lastDay);
        break;
      }
      case "yearly": {
        from = `${selectedYear}-01-01`;
        to = `${selectedYear}-12-31`;
        break;
      }
      default:
        from = selectedDate;
        to = selectedDate;
    }
    return { from, to };
  }, [kpiPeriod, selectedDate, selectedMonth, selectedYear]);

  const getKpiData = useCallback(
    <T extends { totalSalariesPaid?: number; realizedProfit?: number } = PeriodReportResponse>(
      responses: {
        dailyRes?: { data?: T };
        weeklyRes?: { data?: T };
        monthlyRes?: { data?: T };
        yearlyRes?: { data?: T };
        totalRes?: { data?: T };
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _salaryHistory: PayrollResponse[] = [],
    ) => {
      let resData: T | undefined;
      switch (kpiPeriod) {
        case "daily":
          resData = responses.dailyRes?.data;
          break;
        case "weekly":
          resData = responses.weeklyRes?.data;
          break;
        case "monthly":
          resData = responses.monthlyRes?.data;
          break;
        case "yearly":
          resData = responses.yearlyRes?.data;
          break;
        case "total":
          resData = responses.totalRes?.data;
          break;
      }

      if (resData) {
        // We now trust the backend to provide totalSalariesPaid and realizedProfit
        // including both payroll settlements and approved advances.
        return {
          ...resData,
          // Ensure they are at least 0 if missing for some reason
          totalSalariesPaid: resData.totalSalariesPaid ?? 0,
          realizedProfit: resData.realizedProfit ?? 0,
        } as T & { realizedProfit: number; totalSalariesPaid: number };
      }

      return undefined;
    },
    [kpiPeriod],
  );

  const setSelectedMonth = useCallback((monthStr: string) => {
    // monthStr is YYYY-MM, we set it to the first of that month
    setSelectedDate(`${monthStr}-01`);
  }, []);

  const setSelectedYear = useCallback((year: number) => {
    // set to January 1st of that year
    setSelectedDate(`${year}-01-01`);
  }, []);

  return {
    kpiPeriod,
    setKpiPeriod,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    isDateInSelectedPeriod,
    dateRange,
    getKpiData,
    reset,
  };
}
