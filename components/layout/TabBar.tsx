import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
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
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 14) }]}>
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

          if (!isFocused && !event.defaultPrevented) {
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
              <Icon size={18} color={color} />
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
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  iconWrap: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInactive: {
    opacity: 0.4,
  },
  label: {
    fontFamily: fonts.dmSans,
    fontSize: 7,
    letterSpacing: 1,
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
