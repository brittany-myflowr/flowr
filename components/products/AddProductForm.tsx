import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { FocusScrollView } from '@/components/layout/FocusScrollView';
import { VerdictPicker } from '@/components/products/VerdictPicker';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { categories } from '@/constants/categories';
import { colors } from '@/constants/colors';
import type { Product, Verdict } from '@/types';
import { s } from '@/lib/scale';

type AddProductFormProps = {
  insetTop: number;
  onBack: () => void;
  onSubmit: (input: {
    name: string;
    brand: string;
    category: (typeof categories)[number];
    verdict: Verdict;
    notes?: string;
  }) => Product | null;
  onSaved: (product: Product) => void;
};

export function AddProductForm({ insetTop, onBack, onSubmit, onSaved }: AddProductFormProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>('Love It');
  const [notes, setNotes] = useState('');

  useFocusEffect(
    useCallback(() => {
      setName('');
      setBrand('');
      setCategoryIndex(0);
      setVerdict('Love It');
      setNotes('');
    }, []),
  );

  const handleSave = () => {
    if (!name.trim() || !brand.trim()) return;

    const product = onSubmit({
      name: name.trim(),
      brand: brand.trim(),
      category: categories[categoryIndex],
      verdict,
      notes: notes.trim() || undefined,
    });

    if (!product) return;
    onSaved(product);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insetTop }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubPageHeader title="Add a Product" onBack={onBack} />
      <FocusScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormField
          label="Brand"
          placeholder="Brand name"
          value={brand}
          onChangeText={setBrand}
          autoCapitalize="words"
        />
        <FormField
          label="Product Name"
          placeholder="Product name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <FormField
          label="Category"
          chips={categories}
          selectedChipIndex={categoryIndex}
          onChipPress={setCategoryIndex}
        />

        <VerdictPicker value={verdict} onChange={setVerdict} />

        <FormField
          label="Notes (optional)"
          placeholder="Thoughts, tips, would you repurchase?"
          value={notes}
          onChangeText={setNotes}
          autoCapitalize="sentences"
        />

        <FullWidthButton
          label="Save to My Products"
          onPress={handleSave}
          disabled={!name.trim() || !brand.trim()}
        />
      </FocusScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: s(14),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
});
