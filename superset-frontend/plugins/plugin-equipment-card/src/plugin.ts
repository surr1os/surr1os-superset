import { ChartPlugin, ChartMetadata } from '@superset-ui/core';
import controlPanel from './controlPanel';
import EquipmentCard from './EquipmentCard';
import { EquipmentCardFormData } from './types';

const THUMBNAIL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// ─── Хелперы ──────────────────────────────────────────────────────────────

function getMetricKeys(metric: unknown): string[] {
  const keys: string[] = [];
  if (metric === null || metric === undefined) return keys;

  if (typeof metric === 'string') {
    keys.push(metric);
    return keys;
  }

  if (typeof metric === 'object' && metric !== null) {
    const m = metric as Record<string, unknown>;

    if (typeof m.label === 'string' && m.label) {
      keys.push(m.label);
    }
    if (typeof m.metric_name === 'string' && m.metric_name) {
      keys.push(m.metric_name);
    }
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
    if (typeof m.sqlExpression === 'string' && m.sqlExpression) {
      keys.push(m.sqlExpression);
    }
  }

  return keys;
}

function findNumericValue(
  rows: Record<string, unknown>[],
  keys: string[],
): number {
  if (!rows.length || !keys.length) return 0;

  const matchedKey = keys.find(k =>
    rows.some(
      row => k in row && row[k] !== null && row[k] !== undefined,
    ),
  );
  if (!matchedKey) return 0;

  return rows.reduce((acc, row) => {
    const val = Number(row[matchedKey]);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}

// ─── Superset camelCase ↔ snake_case ──────────────────────────────────────
// Superset автоматически конвертирует snake_case ключи formData
// в camelCase при передаче в transformProps.
// equipment_name → equipmentName
// equipment_subtitle → equipmentSubtitle
// Поэтому читаем ОБА варианта.

function readString(
  formData: Record<string, unknown>,
  snakeKey: string,
): string {
  // camelCase версия ключа
  const camelKey = snakeKey.replace(/_([a-z])/g, (_, c) =>
    c.toUpperCase(),
  );

  const val =
    formData[snakeKey] ??
    formData[camelKey] ??
    '';

  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  return String(val);
}

// ─── Плагин ───────────────────────────────────────────────────────────────

export default class EquipmentCardPlugin extends ChartPlugin {
  constructor() {
    super({
      metadata: new ChartMetadata({
        name: 'Equipment Status Card',
        description: 'Карточка оборудования с полоской выполнения плана',
        thumbnail: THUMBNAIL,
        category: 'KPI',
        tags: ['Equipment', 'KPI', 'Progress', 'Production'],
      }),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformProps: (chartProps: any) => {
        // Superset может передавать formData как в snake_case так и camelCase
        // Читаем весь объект чтобы видеть все ключи
        const rawFormData: Record<string, unknown> =
          chartProps.formData || {};

        const formData = rawFormData as EquipmentCardFormData;

        const queriesData: Array<{ data?: Record<string, unknown>[] }> =
          chartProps.queriesData || [];
        const rows: Record<string, unknown>[] =
          queriesData[0]?.data || [];

        // ── Название и подзаголовок ────────────────────────────────────
        // Читаем оба варианта ключа: snake_case и camelCase
        const equipmentName    = readString(rawFormData, 'equipment_name');
        const equipmentSubtitle = readString(rawFormData, 'equipment_subtitle');

        // ── Метрики ────────────────────────────────────────────────────
        const factKeys = getMetricKeys(formData.metric);

        const planRaw =
          formData.metric_2 ??
          (Array.isArray(formData.metrics)
            ? formData.metrics[1]
            : undefined);
        const planKeys = getMetricKeys(planRaw);

        const factValue = findNumericValue(rows, factKeys);

        let planValue = 0;
        if (planKeys.length > 0) {
          planValue = findNumericValue(rows, planKeys);
        } else if (rows.length > 0) {
          const factKeyUsed =
            factKeys.find(k => rows[0] && k in rows[0]) || '';
          const fallbackKey = Object.keys(rows[0]).find(
            k => k !== factKeyUsed && !isNaN(Number(rows[0][k])),
          );
          if (fallbackKey) {
            planValue = rows.reduce(
              (acc, row) => acc + (Number(row[fallbackKey]) || 0),
              0,
            );
          }
        }

        // ── Настройки отображения ──────────────────────────────────────
        const factLabel     = readString(rawFormData, 'fact_label')  || 'Факт / план смены';
        const barLabel      = readString(rawFormData, 'bar_label')   || 'Выполнение';
        const unitSuffix    = readString(rawFormData, 'unit_suffix') || 'т';

        const goodThreshold  = Number(rawFormData.good_threshold  ?? rawFormData.goodThreshold  ?? 80);
        const showPercentage = Boolean(rawFormData.show_percentage ?? rawFormData.showPercentage ?? true);
        const showValues     = Boolean(rawFormData.show_values     ?? rawFormData.showValues     ?? true);

        // ── Итоговые props ─────────────────────────────────────────────
        return {
          equipmentName,
          equipmentSubtitle,
          factValue,
          planValue,
          factLabel,
          barLabel,
          unitSuffix,
          goodThreshold,
          showPercentage,
          showValues,
          width:  chartProps.width,
          height: chartProps.height,
        };
      },

      controlPanel,
      Chart: EquipmentCard,
    });
  }
}