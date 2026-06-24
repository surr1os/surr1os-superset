import { ChartPlugin, ChartMetadata } from '@superset-ui/core';
import controlPanel from './controlPanel';
import ProgressBarChart from './ProgressBarChart';

const THUMBNAIL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// ─── Извлечь все возможные ключи из объекта метрики ──────────────────────
function getMetricKeys(metric: unknown): string[] {
  const keys: string[] = [];
  if (!metric) return keys;

  if (typeof metric === 'string') {
    keys.push(metric);
    return keys;
  }

  if (typeof metric === 'object' && metric !== null) {
    const m = metric as Record<string, unknown>;

    if (typeof m.label === 'string' && m.label) keys.push(m.label);
    if (typeof m.metric_name === 'string' && m.metric_name) keys.push(m.metric_name);
    if (typeof m.sqlExpression === 'string' && m.sqlExpression) keys.push(m.sqlExpression);

    if (typeof m.column === 'object' && m.column !== null) {
      const col = m.column as Record<string, unknown>;
      const colName = col.column_name as string;
      const agg = (m.aggregate as string) || 'SUM';
      if (colName) {
        keys.push(`${agg}(${colName})`);
        keys.push(`${agg.toLowerCase()}(${colName})`);
        keys.push(colName);
      }
    }
  }

  return keys;
}

// ─── Найти значение в строках по списку ключей ────────────────────────────
function findValue(
  rows: Record<string, unknown>[],
  keys: string[],
): number {
  for (const row of rows) {
    for (const key of keys) {
      if (key in row) {
        const val = Number(row[key]);
        if (!isNaN(val)) return val;
      }
    }
  }
  return 0;
}

// ─── Найти ВСЕ метрики из formData ───────────────────────────────────────
// Superset может передавать вторую метрику под разными именами:
// metric_2, metrics[1], secondary_metric и т.д.
// Ищем все возможные варианты
function extractAllMetrics(formData: Record<string, unknown>): unknown[] {
  const result: unknown[] = [];

  // Стандартные одиночные метрики
  const singleKeys = [
    'metric', 'metric_2', 'secondary_metric',
    'x', 'y', 'size', 'entity',
  ];
  for (const key of singleKeys) {
    if (formData[key] !== undefined && formData[key] !== null) {
      result.push({ _key: key, _value: formData[key] });
    }
  }

  // Массив метрик
  if (Array.isArray(formData.metrics)) {
    formData.metrics.forEach((m, i) => {
      result.push({ _key: `metrics[${i}]`, _value: m });
    });
  }

  return result;
}

interface ProgressBarFormData {
  metric?: unknown;
  metric_2?: unknown;
  metrics?: unknown[];
  secondary_metric?: unknown;
  show_percentage?: boolean;
  show_values?: boolean;
  unit_suffix?: string;
  good_threshold?: number;
  fact_label?: string;
  plan_label?: string;
  slice_name?: string;
  [key: string]: unknown;
}

export default class ProgressBarPlugin extends ChartPlugin {
  constructor() {
    super({
      metadata: new ChartMetadata({
        name: 'Progress Bar',
        description: 'Полоска прогресса с метриками и значениями над ней',
        thumbnail: THUMBNAIL,
        category: 'KPI',
        tags: ['Progress', 'KPI', 'Production', 'Plan'],
      }),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformProps: (chartProps: any) => {
        const formData = (chartProps.formData || {}) as ProgressBarFormData;
        const queriesData: Array<{ data?: Record<string, unknown>[] }> =
          chartProps.queriesData || [];
        const rows: Record<string, unknown>[] = queriesData[0]?.data || [];

        // ── Ключи первой метрики (факт) ───────────────────────────────────
        const factKeys = getMetricKeys(formData.metric);

        // ── Ключи второй метрики (план) ───────────────────────────────────
        // metric_2 может быть undefined — ищем во всех возможных местах
        const planRawMetric =
          formData.metric_2 ??
          formData.secondary_metric ??
          (Array.isArray(formData.metrics) ? formData.metrics[1] : undefined);

        const planKeys = getMetricKeys(planRawMetric);

        // ── Если planKeys пустой — берём ВСЕ ключи из rows[0]
        // которые НЕ совпадают с factKeys (автоопределение)
        let planValue = 0;
        let planKeyUsed = '';

        if (planKeys.length > 0) {
          // Обычный путь — нашли метрику плана
          planValue = findValue(rows, planKeys);
          planKeyUsed = planKeys.find(k => rows[0] && k in rows[0]) || '';
        } else if (rows.length > 0) {
          // Fallback: берём второй ключ из rows[0] который не является factKey
          const allRowKeys = Object.keys(rows[0]);
          const factKeyUsed = factKeys.find(k => k in rows[0]) || '';
          const remainingKeys = allRowKeys.filter(k => k !== factKeyUsed);

          if (remainingKeys.length > 0) {
            planKeyUsed = remainingKeys[0];
            planValue = rows.reduce(
              (acc, row) => acc + (Number(row[planKeyUsed]) || 0),
              0,
            );
          }
        }

        // ── Значение факта ─────────────────────────────────────────────────
        const factValue = findValue(rows, factKeys);
        return {
          factValue,
          planValue,
          factLabel: formData.fact_label || 'Факт',
          planLabel: formData.plan_label || 'План',
          showPercentage: formData.show_percentage ?? true,
          showValues: formData.show_values ?? true,
          unitSuffix: formData.unit_suffix || '',
          goodThreshold: formData.good_threshold ?? 80,
          title: formData.slice_name || 'Выполнение плана',
          width: chartProps.width,
          height: chartProps.height,
        };
      },

      controlPanel,
      Chart: ProgressBarChart,
    });
  }
}