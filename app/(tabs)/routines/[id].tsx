import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteConfirmSheet } from '@/components/feedback/DeleteConfirmSheet';
import { InlineEmptyCard } from '@/components/feedback/InlineEmptyCard';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { RoutineDetailHeader } from '@/components/routines/RoutineDetailHeader';
import { RoutineRenameSheet } from '@/components/routines/RoutineRenameSheet';
import { RoutineStepRow } from '@/components/routines/RoutineStepRow';
import { FullWidthButton } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { createRoutineShareLink, shareRoutineLink } from '@/lib/shareRoutine';
import { useAppStore, useProducts, useRoutine, useRoutines } from '@/providers/RoutinesProvider';
import { useToast } from '@/providers/ToastProvider';
import { s, vs, fs } from '@/lib/scale';

export default function RoutineDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, promptRename } = useLocalSearchParams<{ id: string; promptRename?: string }>();
  const routine = useRoutine(id);
  const { updateRoutine, removeRoutine, duplicateRoutine } = useRoutines();
  const { products } = useProducts();
  const { user } = useAppStore();
  const { showToast } = useToast();

  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (promptRename === '1') {
      setShowRename(true);
    }
  }, [promptRename, id]);

  if (!routine) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Routine" onBack={() => router.back()} />
        <InlineEmptyCard
          title="Routine not found"
          body="It may have been removed or this link is out of date."
        />
        <View style={styles.footerSpacer} />
        <FullWidthButton
          label="← Back to Routines"
          onPress={() => router.replace('/(tabs)/routines')}
        />
      </View>
    );
  }

  const clearRenamePrompt = () => {
    setShowRename(false);
    router.setParams({ promptRename: undefined });
  };

  const openEditRoutine = () => {
    router.push({
      pathname: '/(tabs)/routines/edit',
      params: { routineId: routine.id },
    });
  };

  const handleShare = async () => {
    if (!user?.id || sharing) return;
    setSharing(true);
    try {
      const result = await createRoutineShareLink({
        routine,
        products,
        userId: user.id,
      });
      if ('error' in result) {
        showToast(result.error, 'destructive');
        return;
      }
      await shareRoutineLink(result.url, routine.name);
    } catch {
      showToast('Could not share routine', 'destructive');
    } finally {
      setSharing(false);
    }
  };

  const handleDuplicate = () => {
    const duplicated = duplicateRoutine(routine.id);
    if (!duplicated) return;

    showToast('Routine duplicated');
    router.replace({
      pathname: '/(tabs)/routines/[id]',
      params: { id: duplicated.id, promptRename: '1' },
    });
  };

  const handleDelete = () => {
    removeRoutine(routine.id);
    setShowDelete(false);
    showToast('Routine removed', 'destructive');
    router.replace('/(tabs)/routines');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <RoutineDetailHeader
        routine={routine}
        onBack={() => router.back()}
        onEdit={openEditRoutine}
        onShare={() => {
          void handleShare();
        }}
        sharing={sharing}
      />

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Steps</Text>
        {routine.steps.length === 0 ? (
          <InlineEmptyCard
            compact
            title="No steps yet"
            body="Tap Edit to add steps to this routine."
          />
        ) : (
          routine.steps.map((step, index) => (
            <RoutineStepRow key={step.id} step={step} index={index} />
          ))
        )}

        <View style={styles.footer}>
          <FullWidthButton label="Duplicate Routine" onPress={handleDuplicate} />
          <View style={styles.footerSpacer} />
          <FullWidthButton
            label="Remove Routine"
            variant="danger"
            onPress={() => setShowDelete(true)}
          />
        </View>
      </ScrollView>

      <RoutineRenameSheet
        visible={showRename}
        initialName={routine.name}
        onSave={(name) => {
          updateRoutine(routine.id, { name });
          clearRenamePrompt();
        }}
        onCancel={clearRenamePrompt}
      />

      <DeleteConfirmSheet
        visible={showDelete}
        title="Remove routine?"
        message={`${routine.name} and all of its steps will be permanently deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    justifyContent: 'center',
    paddingHorizontal: s(14),
  },
  listContent: {
    paddingHorizontal: s(12),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
  sectionLabel: {
    marginBottom: s(8),
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(1.5),
    textTransform: 'uppercase',
    color: colors.muted,
  },
  footer: {
    marginTop: s(16),
  },
  footerSpacer: {
    height: vs(8),
  },
});
