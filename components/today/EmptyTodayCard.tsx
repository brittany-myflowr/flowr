import { FirstRoutineCard } from '@/components/onboarding/FirstRoutineCard';

type EmptyTodayCardProps = {
  onGetStarted?: () => void;
};

/** @deprecated Use FirstRoutineCard directly */
export function EmptyTodayCard(props: EmptyTodayCardProps) {
  return <FirstRoutineCard {...props} />;
}
