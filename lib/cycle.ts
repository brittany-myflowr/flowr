import { phases, phaseKeys, type PhaseKey } from '@/constants/phases';
import { formatDateKey } from '@/lib/dateKey';
import type { CycleSettings } from '@/types';

export type CyclePhaseInfo = {
  phase: PhaseKey;
  dayInCycle: number;
  cycleLength: number;
  daysRemaining: number;
  label: string;
  description: string;
  color: string;
};

/** Mean synodic month — average days from new moon to new moon. */
const SYNODIC_MONTH = 29.530588;

/** Verified new moon anchor used to locate recent new moons. */
const LUNAR_REFERENCE_NEW_MOON = new Date(2026, 4, 16);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(start: Date, end: Date) {
  const ms = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number) {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function getMostRecentNewMoon(date: Date): Date {
  const daysSinceReference = daysBetween(LUNAR_REFERENCE_NEW_MOON, date);

  if (daysSinceReference >= 0) {
    const cyclesSinceReference = Math.floor(daysSinceReference / SYNODIC_MONTH);
    let newMoon = addDays(
      LUNAR_REFERENCE_NEW_MOON,
      Math.round(cyclesSinceReference * SYNODIC_MONTH),
    );

    if (daysBetween(newMoon, date) < 0) {
      newMoon = addDays(newMoon, -Math.round(SYNODIC_MONTH));
    }

    return newMoon;
  }

  let newMoon = LUNAR_REFERENCE_NEW_MOON;
  while (daysBetween(newMoon, date) < 0) {
    newMoon = addDays(newMoon, -Math.round(SYNODIC_MONTH));
  }

  return newMoon;
}

function getNextNewMoon(newMoon: Date): Date {
  return addDays(newMoon, Math.round(SYNODIC_MONTH));
}

function lunarCycleLengthForDate(date: Date): number {
  const mostRecentNewMoon = getMostRecentNewMoon(date);
  return daysBetween(mostRecentNewMoon, getNextNewMoon(mostRecentNewMoon));
}

function getLunarDayInCycle(date: Date): number {
  const mostRecentNewMoon = getMostRecentNewMoon(date);
  return daysBetween(mostRecentNewMoon, date) + 1;
}

function menstrualPhaseForDay(dayInCycle: number, cycleLength: number, periodLength: number): PhaseKey {
  const menstrualEnd = Math.min(periodLength, cycleLength);
  const ovulationCenter = Math.round(cycleLength * 0.5);
  const ovulationStart = Math.max(menstrualEnd + 1, ovulationCenter - 1);
  const ovulationEnd = Math.min(cycleLength, ovulationCenter + 1);

  if (dayInCycle <= menstrualEnd) return 'menstrual';
  if (dayInCycle < ovulationStart) return 'follicular';
  if (dayInCycle <= ovulationEnd) return 'ovulatory';
  return 'luteal';
}

function lunarPhaseForDay(dayInCycle: number): PhaseKey {
  if (dayInCycle <= 5) return 'menstrual';
  if (dayInCycle <= 14) return 'follicular';
  if (dayInCycle <= 19) return 'ovulatory';
  return 'luteal';
}

export function getDayInCycle(settings: CycleSettings, date = new Date()): number | null {
  if (settings.method === 'lunar') {
    return getLunarDayInCycle(date);
  }

  const cycleLength = settings.cycleLength || 28;
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

  const dayInCycle = getDayInCycle(settings, date);
  if (!dayInCycle) return null;

  if (settings.method === 'lunar') {
    const mostRecentNewMoon = getMostRecentNewMoon(date);
    const nextNewMoon = getNextNewMoon(mostRecentNewMoon);
    const cycleLength = lunarCycleLengthForDate(date);
    const phase = lunarPhaseForDay(dayInCycle);
    const meta = phases[phase];
    const daysRemaining = Math.max(0, daysBetween(date, nextNewMoon));

    return {
      phase,
      dayInCycle,
      cycleLength,
      daysRemaining,
      label: meta.label,
      description: meta.description,
      color: meta.color,
    };
  }

  const cycleLength = settings.cycleLength || 28;
  const phase = menstrualPhaseForDay(dayInCycle, cycleLength, settings.periodLength || 5);
  const meta = phases[phase];
  const daysRemaining = cycleLength - dayInCycle;

  return {
    phase,
    dayInCycle,
    cycleLength,
    daysRemaining,
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
