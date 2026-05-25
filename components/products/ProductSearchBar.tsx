import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { CloseIcon } from '@/components/icons/ActionIcons';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

type ProductSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

function SearchIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={colors.muted} strokeWidth={1.8} />
      <Line
        x1={16.5}
        y1={16.5}
        x2={21}
        y2={21}
        stroke={colors.muted}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProductSearchBar({
  value,
  onChangeText,
  placeholder = 'Search products',
}: ProductSearchBarProps) {
  return (
    <View style={styles.container}>
      <SearchIcon />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <CloseIcon size={12} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    fontFamily: fonts.dmSans,
    fontSize: 12,
    color: colors.navy,
    padding: 0,
  },
});
