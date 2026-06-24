import React from 'react';
import styled, { keyframes } from 'styled-components';
import { EquipmentCardProps } from './types';

// ─── Анимации ─────────────────────────────────────────────────────────────

const fillAnimation = keyframes`
  from { width: 0%; }
  to   { width: var(--fill-width); }
`;

// ─── Палитра ──────────────────────────────────────────────────────────────

const P = {
  cardBg:     '#1a1d2e',
  headerBg:   '#1f2235',
  border:     '#2a2d45',
  divider:    '#252840',
  progressBg: '#2a2d45',
  fillGood:   '#22c55e',
  fillWarn:   '#f97316',
  fillDanger: '#ef4444',
  textPrimary:   '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted:     '#5a6080',
};

// ─── Styled ───────────────────────────────────────────────────────────────

const Card = styled.div`
  background: ${P.cardBg};
  border: 1px solid ${P.border};
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
  box-sizing: border-box;
`;

const CardHeader = styled.div`
  background: ${P.headerBg};
  padding: 10px 14px 9px;
  border-bottom: 1px solid ${P.border};
  flex-shrink: 0;
`;

const EquipmentName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${P.textPrimary};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EquipmentSubtitle = styled.div`
  font-size: 10px;
  color: ${P.textMuted};
  font-weight: 500;
  margin-top: 1px;
  letter-spacing: 0.2px;
`;

const CardBody = styled.div`
  padding: 10px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  justify-content: center;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
`;

const InfoLabel = styled.span`
  font-size: 11px;
  color: ${P.textMuted};
  font-weight: 400;
`;

const InfoValue = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${P.textSecondary};
  letter-spacing: 0.2px;
`;

const RowDivider = styled.div`
  height: 1px;
  background: ${P.divider};
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0 2px;
`;

const ProgressLabel = styled.span`
  font-size: 11px;
  color: ${P.textMuted};
  font-weight: 400;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 72px;
`;

const ProgressTrack = styled.div`
  flex: 1;
  height: 8px;
  background: ${P.progressBg};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${({ $pct }) => Math.min(Math.max($pct, 0), 100)}%;
  background: ${({ $color }) => $color};
  border-radius: 4px;
  animation: ${fillAnimation} 0.9s cubic-bezier(0.4, 0, 0.2, 1) both;
  --fill-width: ${({ $pct }) => Math.min(Math.max($pct, 0), 100)}%;
`;

const ProgressPct = styled.span<{ $isGood: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $isGood }) => ($isGood ? P.fillGood : P.fillWarn)};
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 36px;
  text-align: right;
`;

// ─── Утилиты ──────────────────────────────────────────────────────────────

function fmt(n: number, unit: string): string {
  const s = n.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  return unit ? `${s} ${unit}` : s;
}

function fmtPct(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}

function fillColor(pct: number, good: number): string {
  if (pct >= good) return P.fillGood;
  if (pct >= good * 0.6) return P.fillWarn;
  return P.fillDanger;
}

// ─── Компонент ────────────────────────────────────────────────────────────

const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipmentName,
  equipmentSubtitle,
  factValue,
  planValue,
  factLabel      = 'Факт / план смены',
  barLabel       = 'Выполнение',
  unitSuffix     = 'т',
  goodThreshold  = 80,
  showPercentage = true,
  showValues     = true,
}) => {
  const percentage =
    planValue > 0 ? (factValue / planValue) * 100 : 0;
  const isGood    = percentage >= goodThreshold;
  const barColor  = fillColor(percentage, goodThreshold);

  return (
    <Card>
      {/* ── Шапка ── */}
      <CardHeader>
        <EquipmentName>{equipmentName || '—'}</EquipmentName>
        {equipmentSubtitle && (
          <EquipmentSubtitle>{equipmentSubtitle}</EquipmentSubtitle>
        )}
      </CardHeader>

      {/* ── Тело ── */}
      <CardBody>

        {/* Факт / план */}
        {showValues && (
          <>
            <InfoRow>
              <InfoLabel>{factLabel}</InfoLabel>
              <InfoValue>
                {fmt(factValue, '')}
                <span style={{ color: P.textMuted }}> / </span>
                {fmt(planValue, unitSuffix)}
              </InfoValue>
            </InfoRow>
            <RowDivider />
          </>
        )}

        {/* Полоска выполнения */}
        <ProgressRow>
          <ProgressLabel>{barLabel}</ProgressLabel>

          <ProgressTrack>
            <ProgressFill $pct={percentage} $color={barColor} />
          </ProgressTrack>

          {showPercentage && (
            <ProgressPct $isGood={isGood}>
              {fmtPct(percentage)}%
            </ProgressPct>
          )}
        </ProgressRow>

      </CardBody>
    </Card>
  );
};

export default EquipmentCard;