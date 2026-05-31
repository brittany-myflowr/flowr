import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddProductForm } from '@/components/products/AddProductForm';
import { useProducts, useRoutines } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';

export default function RoutinesAddProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addProduct } = useProducts();
  const { setPendingTagProductSelection } = useRoutines();
  const { showToast } = useToast();

  return (
    <AddProductForm
      insetTop={insets.top}
      onBack={() => router.back()}
      onSubmit={(input) => addProduct(input)}
      onSaved={(product) => {
        showToast('Product saved');
        setPendingTagProductSelection(product.id);
        router.back();
      }}
    />
  );
}
