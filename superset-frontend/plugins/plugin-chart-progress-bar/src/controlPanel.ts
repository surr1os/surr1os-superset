import {
  ControlPanelConfig,
  sharedControls,
} from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: 'Метрики прогресса',
      expanded: true,
      controlSetRows: [
        // ── Метрика ФАКТ ──────────────────────────────────────────────────
        [
          {
            name: 'metric',
            config: {
              ...sharedControls.metric,
              label: '📊 Факт (числитель)',
              description: 'Фактическое значение: fact, выработка, отгрузка...',
              default: null,
            },
          },
        ],
        // ── Метрика ПЛАН — используем metrics[1] через metrics массив ─────
        // Superset корректно обрабатывает второй элемент metrics[]
        [
          {
            name: 'metric_2',
            config: {
              ...sharedControls.metric,
              label: '🎯 План (знаменатель)',
              description: 'Плановое значение: plan, норма, target...',
              default: null,
              // Важно: resetOnHide чтобы значение сохранялось
              resetOnHide: false,
            },
          },
        ],
      ],
    },
    {
      label: 'Настройки отображения',
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'show_percentage',
            config: {
              type: 'CheckboxControl',
              label: 'Показывать % выполнения',
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'show_values',
            config: {
              type: 'CheckboxControl',
              label: 'Показывать факт / план над полоской',
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'unit_suffix',
            config: {
              type: 'TextControl',
              label: 'Единица измерения',
              description: 'т, шт, м, %',
              default: '',
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'good_threshold',
            config: {
              type: 'SliderControl',
              label: 'Порог "выполнено" (%)',
              description: 'При достижении этого % бар станет зелёным',
              default: 80,
              min: 0,
              max: 100,
              step: 5,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'fact_label',
            config: {
              type: 'TextControl',
              label: 'Подпись факта',
              default: 'Факт',
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'plan_label',
            config: {
              type: 'TextControl',
              label: 'Подпись плана',
              default: 'План',
              renderTrigger: true,
            },
          },
        ],
      ],
    },
  ],
};

export default config;