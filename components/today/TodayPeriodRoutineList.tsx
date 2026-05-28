import { ReorderableList } from '@/components/ui/ReorderableList';
import type { TodayRoutineGroup } from '@/lib/todayGroups';
import type { TimeOfDay } from '@/types';

import { TodayRoutineSection } from './TodayRoutineSection';

type TodayPeriodRoutineListProps = {
  timeOfDay: TimeOfDay;
  groups: TodayRoutineGroup[];
  expandedByRoutineId: Record<string, boolean>;
  onToggleExpanded: (routineId: string) => void;
  onReorder: (timeOfDay: TimeOfDay, groups: TodayRoutineGroup[]) => void;
  onScrollLockChange: (locked: boolean) => void;
  renderStepRow: (
    item: TodayRoutineGroup['steps'][number],
    index: number,
    listLength: number,
  ) => React.ReactNode;
};

export function TodayPeriodRoutineList({
  timeOfDay,
  groups,
  expandedByRoutineId,
  onToggleExpanded,
  onReorder,
  onScrollLockChange,
  renderStepRow,
}: TodayPeriodRoutineListProps) {
  if (groups.length < 2) {
    return groups.map((group) => (
      <TodayRoutineSection
        key={group.routine.id}
        group={group}
        expanded={expandedByRoutineId[group.routine.id] === true}
        onToggleExpanded={() => onToggleExpanded(group.routine.id)}
        renderStepRow={renderStepRow}
      />
    ));
  }

  return (
    <ReorderableList
      embedded
      data={groups}
      keyExtractor={(group) => group.routine.id}
      onDragEnd={(nextGroups) => onReorder(timeOfDay, nextGroups)}
      onScrollLockChange={onScrollLockChange}
      onItemPress={(group) => onToggleExpanded(group.routine.id)}
      dragHandlersTarget="row"
      renderItem={({ item, isActive }) => (
        <TodayRoutineSection
          group={item}
          expanded={expandedByRoutineId[item.routine.id] === true}
          pressableHeader={false}
          isDragging={isActive}
          onToggleExpanded={() => onToggleExpanded(item.routine.id)}
          renderStepRow={renderStepRow}
        />
      )}
    />
  );
}
