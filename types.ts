
export interface ImageHistoryItem {
  id: string;
  original: string;
  processed: string;
  timestamp: number;
  prompt: string;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9" | "2:3" | "3:2";
export type ImageSize = "1K" | "2K" | "4K";
