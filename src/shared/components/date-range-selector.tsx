"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "lucide-react";

export type DateRangePreset = "7d" | "30d" | "3m" | "6m" | "all" | "custom";

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeSelectorProps {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
}

export function getDateRangeFromPreset(
  preset: DateRangePreset,
  customStartDate?: string,
  customEndDate?: string
): DateRange | undefined {
  const now = new Date();
  const endDate = now.toISOString();

  switch (preset) {
    case "7d": {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      return { startDate: startDate.toISOString(), endDate };
    }
    case "30d": {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      return { startDate: startDate.toISOString(), endDate };
    }
    case "3m": {
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      return { startDate: startDate.toISOString(), endDate };
    }
    case "6m": {
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      return { startDate: startDate.toISOString(), endDate };
    }
    case "custom": {
      if (customStartDate && customEndDate) {
        return {
          startDate: new Date(customStartDate).toISOString(),
          endDate: new Date(customEndDate).toISOString(),
        };
      }
      return undefined;
    }
    case "all":
    default:
      return undefined;
  }
}

const presetLabels: Record<DateRangePreset, string> = {
  "7d": "최근 7일",
  "30d": "최근 30일",
  "3m": "최근 3개월",
  "6m": "최근 6개월",
  all: "전체 기간",
  custom: "사용자 정의",
};

const presetDescriptions: Record<DateRangePreset, string> = {
  "7d": "최근 7일 데이터를 표시합니다",
  "30d": "최근 30일 데이터를 표시합니다",
  "3m": "최근 3개월 데이터를 표시합니다",
  "6m": "최근 6개월 데이터를 표시합니다",
  all: "전체 데이터를 표시합니다",
  custom: "",
};

export function DateRangeSelector({
  preset,
  onPresetChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}: DateRangeSelectorProps) {
  const presets: DateRangePreset[] = ["7d", "30d", "3m", "6m", "all", "custom"];

  return (
    <Card className="border-none shadow-sm bg-white/50 dark:bg-white/5 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            날짜 범위 선택
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Button
                key={p}
                variant={preset === p ? "default" : "outline"}
                size="sm"
                onClick={() => onPresetChange(p)}
              >
                {presetLabels[p]}
              </Button>
            ))}
          </div>

          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  시작일
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => onCustomStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  종료일
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => onCustomEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {preset === "custom" && customStartDate && customEndDate
              ? `${customStartDate} ~ ${customEndDate} 데이터를 표시합니다`
              : presetDescriptions[preset]}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
