import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
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

const HIDDEN_TAB_ROUTES = new Set(['profile']);

/** Scroll content padding so lists clear the floating tab bar. */
export const TAB_BAR_SCROLL_INSET = vs(76);

type TabRouteName = keyof typeof TAB_CONFIG;

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

          if (isFocused) {
            if (!event.defaultPrevented) {
              const nestedState = route.state;
              if (nestedState && (nestedState.index ?? 0) > 0) {
                navigation.dispatch({
                  ...CommonActions.navigate({
                    name: route.name,
                    merge: true,
                    params: {
                      screen: nestedState.routes[0]?.name,
                    },
                  }),
                });
              }
            }
            return;
          }

          if (!event.defaultPrevented) {
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
