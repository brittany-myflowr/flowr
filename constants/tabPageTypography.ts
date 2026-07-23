import { StyleSheet } from 'react-native';

import { colors } from '@/constants/colors';
import { TAB_BAR_SCROLL_INSET } from '@/components/layout/TabBar';
import { fs, s, vs } from '@/lib/scale';

/** Typography and spacing for main tab list screens — aligned with Calendar. */
export const tabPageTypography = {
  title: fs(22.8),
  subtitle: fs(12),
  subtitleMarginTop: s(4),
  headerPaddingBottom: s(8),
  headerPaddingHorizontal: s(14),
  headerTopOffset: s(18),
  emptyTitle: fs(15.2),
  emptyBody: fs(12),
  emptyBodyLineHeight: fs(18),
  sectionLabel: fs(10),
  subPageTitle: fs(17.1),
  subPageSubtitle: fs(10),
  subPageBack: fs(12),
  actionLabel: fs(10),
} as const;

/** Guided routine builder — scaled to match tab / calendar pages. */
export const guidedFlowTypography = {
  title: fs(17.1),
  titleLineHeight: fs(21.4),
  back: fs(12),
  stepCount: fs(12),
  helper: fs(13),
  helperLineHeight: fs(19),
  fieldLabel: fs(10),
  body: fs(14.4),
  link: fs(12),
  stepNumber: fs(11),
  reviewName: fs(14.4),
  reviewMeta: fs(12),
  reviewStepName: fs(13.3),
} as const;

export const guidedFlowSizes = {
  headerPaddingTop: s(18),
  headerPaddingHorizontal: s(14),
  headerPaddingBottom: s(10),
  progressBarHeight: vs(4),
  progressBarWidth: s(14),
  progressBarCurrentWidth: s(22),
  stepBadge: s(22),
  stepRowRadius: 0,
  stepRowPaddingH: s(12),
  stepRowPaddingV: vs(10),
  reviewIcon: s(19),
  reviewIconWrap: s(36),
  reviewStepBadge: s(20),
} as const;

export const tabPageStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: s(10),
    paddingBottom: TAB_BAR_SCROLL_INSET,
  },
});
