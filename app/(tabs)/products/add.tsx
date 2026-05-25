import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { VerdictPicker } from '@/components/products/VerdictPicker';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { categories, type Category } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { useProducts } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import type { Verdict } from '@/types';

const FORM_CATEGORIES: Category[] = [
  'Skincare',
  'Body Care',
  'Hair Care',
  'Nail Care',
  'Supplements',
];

export default function AddProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addProduct } = useProducts();
  const { showToast } = useToast();
  const { returnTo, routineId, stepId } = useLocalSearchParams<{
    returnTo?: string;
    routineId?: string;
    stepId?: string;
  }>();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>('Love It');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name.trim() || !brand.trim()) return;

    const product = addProduct({
      name: name.trim(),
      brand: brand.trim(),
      category: FORM_CATEGORIES[categoryIndex],
      verdict,
      notes: notes.trim() || undefined,
    });

    if (returnTo === 'tag-product' && routineId && stepId) {
      showToast('Product saved');
      router.replace({
        pathname: '/(tabs)/routines/tag-product',
        params: { routineId, stepId, selectedProductId: product.id },
      });
      return;
    }

    showToast('Product saved');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubPageHeader title="Add a Product" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormField
          label="Product Name"
          placeholder="Product name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <FormField
          label="Brand"
          placeholder="Brand name"
          value={brand}
          onChangeText={setBrand}
          autoCapitalize="words"
        />
        <FormField
          label="Category"
          chips={FORM_CATEGORIES}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
