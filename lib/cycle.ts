import { phases, phaseKeys, type PhaseKey } from '@/constants/phases';
import { formatDateKey } from '@/lib/dateKey';
import type { CycleSettings } from '@/types';

export type CyclePhaseInfo = {
  phase: PhaseKey;
  dayInCycle: number;
  cycleLength: number;
  label: string;
  description: string;
  color: string;
};

/** Reference new moon used for lunar sync (always 28-day cycle from nearest new moon). */
const LUNAR_REFERENCE = new Date(2024, 0, 11);

function daysBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function phaseForDay(dayInCycle: number, cycleLength: number, periodLength: number): PhaseKey {
  const menstrualEnd = Math.min(periodLength, cycleLength);
  const ovulationCenter = Math.round(cycleLength * 0.5);
  const ovulationStart = Math.max(menstrualEnd + 1, ovulationCenter - 1);
  const ovulationEnd = Math.min(cycleLength, ovulationCenter + 1);

  if (dayInCycle <= menstrualEnd) return 'menstrual';
  if (dayInCycle < ovulationStart) return 'follicular';
  if (dayInCycle <= ovulationEnd) return 'ovulatory';
  return 'luteal';
}

export function getDayInCycle(settings: CycleSettings, date = new Date()): number | null {
  const cycleLength = settings.cycleLength || 28;

  if (settings.method === 'lunar') {
    const daysSinceReference = daysBetween(LUNAR_REFERENCE, date);
    const mod = ((daysSinceReference % 28) + 28) % 28;
    return mod + 1;
  }

  const start = parseIsoDate(settings.lastPeriodStart);
  if (!start) return null;

  const elapsed = daysBetween(start, date);
  if (elapsed < 0) return null;

  return (elapsed % cycleLength) + 1;
}

export function getCurrentPhaseInfo(
  settings: CycleSettings,
  date = new Date(),
): CyclePhaseInfo | null {
  if (!settings.enabled) return null;

  const cycleLength = settings.cycleLength || 28;
  const dayInCycle = getDayInCycle(settings, date);
  if (!dayInCycle) return null;

  const phase = phaseForDay(dayInCycle, cycleLength, settings.periodLength || 5);
  const meta = phases[phase];

  return {
    phase,
    dayInCycle,
    cycleLength,
    label: meta.label,
    description: meta.description,
    color: meta.color,
  };
}

export function formatDisplayDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (!date) return 'Select date';
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function shiftIsoDate(isoDate: string, deltaDays: number): string {
  const date = parseIsoDate(isoDate) ?? new Date();
  date.setDate(date.getDate() + deltaDays);
  return formatDateKey(date);
}

export function stepMatchesCurrentPhase(
  phasesForStep: PhaseKey[] | undefined,
  settings: CycleSettings,
  date = new Date(),
): boolean {
  if (!phasesForStep?.length) return true;
  if (!settings.enabled) return true;

  const info = getCurrentPhaseInfo(settings, date);
  if (!info) return true;

  return phasesForStep.includes(info.phase);
}

export { phaseKeys };
