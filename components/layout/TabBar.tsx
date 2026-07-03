import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CalendarIcon,
  DaisyTabIcon,
  StarIcon,
  SunIcon,
} from '@/components/icons/TabIcons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

const TAB_CONFIG = {
  index: { label: 'Today', Icon: SunIcon },
  routines: { label: 'Routines', Icon: DaisyTabIcon },
  products: { label: 'Products', Icon: StarIcon },
  calendar: { label: 'Calendar', Icon: CalendarIcon },
} as const;

type TabRouteName = keyof typeof TAB_CONFIG;

const HIDDEN_TAB_ROUTES = new Set(['profile']);

/** Tabs with nested stack navigators — tab press should return to the list root. */
const NESTED_STACK_TABS = new Set(['routines', 'products']);

const TAB_ROOTS: Partial<Record<TabRouteName, Href>> = {
  routines: '/(tabs)/routines',
  products: '/(tabs)/products',
};

/** Scroll content padding so lists clear the floating tab bar. */
export const TAB_BAR_SCROLL_INSET = vs(76);

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, s(8)) },
      ]}
    >
      {state.routes.map((route, index) => {
        if (HIDDEN_TAB_ROUTES.has(route.name)) return null;

        const config = TAB_CONFIG[route.name as TabRouteName];
        if (!config) return null;

        const isFocused = state.index === index;
        const { Icon, label } = config;
        const color = isFocused ? colors.blue : colors.muted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (event.defaultPrevented) return;

          const nestedIndex = route.state?.index ?? 0;
          const isAtStackRoot = nestedIndex === 0;

          if (NESTED_STACK_TABS.has(route.name)) {
            if (isFocused && isAtStackRoot) return;

            const href = TAB_ROOTS[route.name as TabRouteName];
            if (href) {
              router.navigate(href);
            }
            return;
          }

          if (!isFocused) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptors[route.key].options.title ?? label}
          >
            <View style={[styles.iconWrap, !isFocused && styles.iconInactive]}>
              <Icon size={s(20)} color={color} />
            </View>
            <Text style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(26,26,46,0.1)',
    paddingTop: s(7),
    minHeight: vs(46),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: s(2),
    paddingVertical: s(1),
  },
  iconWrap: {
    height: vs(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInactive: {
    opacity: 0.55,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(9),
  },
  labelActive: {
    color: colors.blue,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  labelInactive: {
    color: colors.muted,
  },
});
