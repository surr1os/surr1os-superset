import {
  ControlPanelConfig,
  sharedControls,
} from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: '🏭 Оборудование',
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'equipment_name',
            config: {
              type: 'TextControl',
              label: 'Название оборудования',
              description: 'Введите название вручную, например: "Стан ХПТ 75"',
              default: '',
              // renderTrigger: false — изменение пройдёт через transformProps
              renderTrigger: false,
            },
          },
        ],
        [
          {
            name: 'equipment_subtitle',
            config: {
              type: 'TextControl',
              label: 'Подзаголовок',
              description: 'Краткий тип или код, например: "ХПТ"',
              default: '',
              renderTrigger: false,
            },
          },
        ],
      ],
    },

    {
      label: '📊 Метрики выполнения',
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'metric',
            config: {
              ...sharedControls.metric,
              label: '✅ Факт (числитель)',
              description:
                'Фактически выполненный объём: выработка, отгрузка и т.п.',
              default: null,
            },
          },
        ],
        [
          {
            name: 'metric_2',
            config: {
              ...sharedControls.metric,
              label: '🎯 План (знаменатель)',
              description:
                'Плановый объём: норма, target, план смены и т.п.',
              default: null,
              resetOnHide: false,
            },
          },
        ],
      ],
    },

    {
      label: '⚙️ Настройки отображения',
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'show_values',
            config: {
              type: 'CheckboxControl',
              label: 'Показывать факт / план',
              default: true,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'show_percentage',
            config: {
              type: 'CheckboxControl',
              label: 'Показывать % на полоске',
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
              default: 'т',
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'good_threshold',
            config: {
              type: 'SliderControl',
              label: 'Порог выполнения (%)',
              default: 80,
              min: 0,
              max: 150,
              step: 5,
              renderTrigger: true,
            },
          },
        ],
      ],
    },

    {
      label: '🏷️ Текстовые метки',
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'fact_label',
            config: {
              type: 'TextControl',
              label: 'Подпись строки факт/план',
              default: 'Факт / план смены',
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'bar_label',
            config: {
              type: 'TextControl',
              label: 'Подпись полоски выполнения',
              default: 'Выполнение',
              renderTrigger: true,
            },
          },
        ],
      ],
    },
  ],
};

export default config;