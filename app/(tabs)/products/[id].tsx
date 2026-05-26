import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteConfirmSheet } from '@/components/feedback/DeleteConfirmSheet';
import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { VerdictPicker } from '@/components/products/VerdictPicker';
import { FullWidthButton } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { categories } from '@/constants/categories';
import { colors } from '@/constants/colors';
import { resolveProductCategory } from '@/lib/filterProducts';
import { useProduct, useProducts } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';
import type { Verdict } from '@/types';
import { s } from '@/lib/scale';

export default function EditProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);
  const { updateProduct, removeProduct } = useProducts();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>('Love It');
  const [notes, setNotes] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setBrand(product.brand);
    setCategoryIndex(Math.max(0, categories.indexOf(resolveProductCategory(product))));
    setVerdict(product.verdict);
    setNotes(product.notes ?? '');
  }, [product]);

  const canSave = useMemo(() => name.trim().length > 0 && brand.trim().length > 0, [name, brand]);

  if (!product) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <SubPageHeader title="Edit Product" onBack={() => router.back()} />
        <FullWidthButton label="← Back to Products" onPress={() => router.back()} />
      </View>
    );
  }

  const handleSave = () => {
    if (!canSave) return;

    updateProduct(product.id, {
      name: name.trim(),
      brand: brand.trim(),
      category: categories[categoryIndex],
      verdict,
      notes: notes.trim() || undefined,
    });
    showToast('Product saved');
    router.back();
  };

  const handleDelete = () => {
    removeProduct(product.id);
    setShowDelete(false);
    showToast('Product removed', 'destructive');
    router.replace('/(tabs)/products');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SubPageHeader title="Edit Product" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormField
          label="Product Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <FormField
          label="Brand"
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
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          autoCapitalize="sentences"
        />

        <FullWidthButton label="Save Changes" onPress={handleSave} disabled={!canSave} />
        <View style={styles.deleteButton}>
          <FullWidthButton
            label="Remove Product"
            variant="danger"
            onPress={() => setShowDelete(true)}
          />
        </View>
      </ScrollView>

      <DeleteConfirmSheet
        visible={showDelete}
        title="Remove product?"
        message={`${product.name} will be removed from your shelf and untagged from any steps.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    paddingHorizontal: s(14),
  },
  content: {
    paddingHorizontal: s(14),
    paddingTop: s(12),
    paddingBottom: s(24),
  },
  deleteButton: {
    marginTop: s(8),
  },
});
