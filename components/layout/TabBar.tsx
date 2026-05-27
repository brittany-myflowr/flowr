import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CalendarIcon,
  DaisyTabIcon,
  FaceIcon,
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
  profile: { label: 'Profile', Icon: FaceIcon },
} as const;

type TabRouteName = keyof typeof TAB_CONFIG;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, s(16)) }]}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name as TabRouteName];
        if (!config) return null;

        const isFocused = state.index === index;
        const { Icon, label } = config;
        const color = isFocused ? colors.navy : colors.muted;

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
              <Icon size={s(22)} color={color} />
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
    flexDirection: 'row',
    backgroundColor: 'rgba(250,250,248,0.97)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: s(10),
    minHeight: vs(56),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: s(4),
    paddingVertical: s(2),
  },
  iconWrap: {
    height: vs(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInactive: {
    opacity: 0.4,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: fs(10),
    letterSpacing: s(0.5),
    textTransform: 'uppercase',
  },
  labelActive: {
    color: colors.navy,
    fontFamily: fonts.dmSansSemiBold,
    fontWeight: '600',
  },
  labelInactive: {
    color: colors.muted,
  },
});
