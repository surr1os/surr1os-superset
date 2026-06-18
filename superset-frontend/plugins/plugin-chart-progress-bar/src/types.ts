export interface ProgressBarFormData {
  metric: string;          // fact или любое другое поле
  planMetric: string;      // план
  colorScheme: string;
  showLabels: boolean;
  labelAbove: boolean;
}

export interface ProgressBarDataRecord {
  plan: number;
  fact: number;
  [key: string]: number | string;
}

export interface ProgressBarProps {
  data: ProgressBarDataRecord[];
  metric: string;
  planMetric: string;
  width: number;
  height: number;
  colorScheme: string;
  showLabels: boolean;
  extraLabels?: Array<{ key: string; label: string }>;
}