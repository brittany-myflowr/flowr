import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { categories } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { useProducts } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import type { Verdict } from '@/types';
import { s } from '@/lib/scale';

export default function AddProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addProduct } = useProducts();
  const { showToast } = useToast();
  const { returnTo, routineId, stepId, guided, stepIndex, stepName, selectedProductId } =
    useLocalSearchParams<{
      returnTo?: string;
      routineId?: string;
      stepId?: string;
      guided?: string;
      stepIndex?: string;
      stepName?: string;
      selectedProductId?: string;
    }>();

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

    const product = addProduct({
      name: name.trim(),
      brand: brand.trim(),
      category: categories[categoryIndex],
      verdict,
      notes: notes.trim() || undefined,
    });

    const returnToTagProduct = returnTo === 'tag-product';

    if (returnToTagProduct) {
      showToast('Product saved');

      // Pop this screen off the products stack before switching tabs.
      // router.replace() to a routines screen leaves /products/add active on this tab.
      if (router.canDismiss()) {
        router.dismiss();
      }

      if (guided === '1') {
        router.push({
          pathname: '/(tabs)/routines/tag-product',
          params: {
            guided: '1',
            stepIndex,
            stepName,
            selectedProductId: product.id,
          },
        });
        return;
      }

      if (routineId && stepId) {
        router.push({
          pathname: '/(tabs)/routines/tag-product',
          params: { routineId, stepId, selectedProductId: product.id },
        });
        return;
      }
    }

    showToast('Product saved');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubPageHeader
        title="Add a Product"
        onBack={() => {
          if (returnTo === 'tag-product' && router.canDismiss()) {
            router.dismiss();
            return;
          }
          router.back();
        }}
      />
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
    paddingHorizontal: s(14),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
});
