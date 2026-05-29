import { StyleSheet } from 'react-native';

import { colors } from '@/constants/colors';
import { fs, s, vs } from '@/lib/scale';

/** Typography and spacing for main tab list screens — aligned with Calendar. */
export const tabPageTypography = {
  title: fs(22.8),
  subtitle: fs(11.4),
  subtitleMarginTop: s(4),
  headerPaddingBottom: s(8),
  headerPaddingHorizontal: s(14),
  headerTopOffset: s(18),
  emptyTitle: fs(15.2),
  emptyBody: fs(10.45),
  emptyBodyLineHeight: fs(16.15),
  sectionLabel: fs(7.6),
  subPageTitle: fs(17.1),
  subPageSubtitle: fs(7.6),
  subPageBack: fs(9.5),
} as const;

/** Guided routine builder — scaled to match tab / calendar pages. */
export const guidedFlowTypography = {
  title: fs(17.1),
  titleLineHeight: fs(21.4),
  back: fs(9.5),
  stepCount: fs(10.45),
  helper: fs(11.4),
  helperLineHeight: fs(17.1),
  fieldLabel: fs(7.6),
  body: fs(14.4),
  link: fs(11.4),
  stepNumber: fs(9.5),
  reviewName: fs(14.4),
  reviewMeta: fs(10.45),
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
    paddingBottom: s(24),
  },
});
