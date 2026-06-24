export interface EquipmentCardProps {
  // Оборудование (вводится вручную)
  equipmentName: string;
  equipmentSubtitle: string;

  // Метрики прогресса
  factValue: number;
  planValue: number;

  // Настройки отображения
  factLabel: string;
  barLabel: string;
  unitSuffix: string;
  goodThreshold: number;
  showPercentage: boolean;
  showValues: boolean;

  // Размеры
  width: number;
  height: number;
}

export interface EquipmentCardFormData {
  // Текстовые поля оборудования
  equipment_name?: string;
  equipment_subtitle?: string;

  // Метрики
  metric?: unknown;
  metric_2?: unknown;
  metrics?: unknown[];

  // Настройки
  fact_label?: string;
  bar_label?: string;
  unit_suffix?: string;
  good_threshold?: number;
  show_percentage?: boolean;
  show_values?: boolean;

  slice_name?: string;
  [key: string]: unknown;
}