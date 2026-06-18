import React from 'react';
import styled from 'styled-components';

// ─── Палитра ──────────────────────────────────────────────────────────────
const PALETTE = {
  cardBg: '#252838',
  border: '#353850',
  progressBg: '#353850',
  progressFillGood: 'linear-gradient(90deg, #f97316 0%, #fbbf24 60%, #22c55e 100%)',
  progressFillWarn: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  accent1: '#f97316',   // факт — оранжевый
  accent2: '#60a5fa',   // план — синий
  accent5: '#fbbf24',   // остаток — янтарный
};

// ─── Типы ─────────────────────────────────────────────────────────────────

interface ProgressBarChartProps {
  factValue: number;
  planValue: number;
  factLabel?: string;
  planLabel?: string;
  showPercentage?: boolean;
  showValues?: boolean;
  unitSuffix?: string;
  goodThreshold?: number;
  title?: string;
  width: number;
  height: number;
}

// ─── Styled ───────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  background: ${PALETTE.cardBg};
  border: 1px solid ${PALETTE.border};
  border-radius: 12px;
  padding: 20px 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  box-sizing: border-box;
  font-family: 'Inter', 'Roboto', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Title = styled.div`
  color: ${PALETTE.textSecondary};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
`;

const PercentageText = styled.div<{ isGood: boolean }>`
  font-size: 36px;
  font-weight: 800;
  color: ${({ isGood }) => (isGood ? '#22c55e' : '#f97316')};
  line-height: 1;
`;

const LabelsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  align-items: flex-end;
`;

const LabelItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const LabelKey = styled.span`
  font-size: 10px;
  color: ${PALETTE.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const LabelValue = styled.span<{ color?: string }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ color }) => color || PALETTE.textPrimary};
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 24px;
  background: ${PALETTE.progressBg};
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ pct: number; isGood: boolean }>`
  height: 100%;
  width: ${({ pct }) => Math.min(Math.max(pct, 0), 100)}%;
  background: ${({ isGood }) =>
    isGood ? PALETTE.progressFillGood : PALETTE.progressFillWarn};
  border-radius: 12px;
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  /* Блик сверху */
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 10px;
    right: 10px;
    height: 5px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 3px;
  }
`;

const ProgressInlineLabel = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  pointer-events: none;
  white-space: nowrap;
`;

const NoDataMessage = styled.div`
  color: ${PALETTE.textSecondary};
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
`;

// ─── Форматирование ───────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
}

// ─── Компонент ────────────────────────────────────────────────────────────

const ProgressBarChart: React.FC<ProgressBarChartProps> = ({
  factValue = 0,
  planValue = 0,
  factLabel = 'Факт',
  planLabel = 'План',
  showPercentage = true,
  showValues = true,
  unitSuffix = '',
  goodThreshold = 80,
  title = 'Выполнение плана',
}) => {
  const percentage = planValue > 0 ? (factValue / planValue) * 100 : 0;
  const isGood = percentage >= goodThreshold;
  const remaining = Math.max(planValue - factValue, 0);

  const unit = unitSuffix ? ` ${unitSuffix}` : '';

  // Нет данных
  if (planValue === 0 && factValue === 0) {
    return (
      <Wrapper>
        <Header>
          <Title>{title}</Title>
        </Header>
        <NoDataMessage>
          Нет данных. Выберите метрики «Факт» и «План» на панели настроек.
        </NoDataMessage>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* Заголовок + процент */}
      <Header>
        <Title>{title}</Title>
        {showPercentage && (
          <PercentageText isGood={isGood}>
            {fmt(percentage)}%
          </PercentageText>
        )}
      </Header>

      {/* Значения над полоской */}
      {showValues && (
        <LabelsRow>
          <LabelItem>
            <LabelKey>{factLabel}</LabelKey>
            <LabelValue color={PALETTE.accent1}>
              {fmt(factValue)}{unit}
            </LabelValue>
          </LabelItem>

          <LabelItem>
            <LabelKey>{planLabel}</LabelKey>
            <LabelValue color={PALETTE.accent2}>
              {fmt(planValue)}{unit}
            </LabelValue>
          </LabelItem>

          {remaining > 0 && (
            <LabelItem>
              <LabelKey>Остаток</LabelKey>
              <LabelValue color={PALETTE.textSecondary}>
                {fmt(remaining)}{unit}
              </LabelValue>
            </LabelItem>
          )}
        </LabelsRow>
      )}

      {/* Прогресс-бар */}
      <ProgressTrack>
        <ProgressFill pct={percentage} isGood={isGood} />
        {showPercentage && (
          <ProgressInlineLabel>{fmt(percentage)}%</ProgressInlineLabel>
        )}
      </ProgressTrack>
    </Wrapper>
  );
};

export default ProgressBarChart;