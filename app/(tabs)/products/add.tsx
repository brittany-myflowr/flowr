import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddProductForm } from '@/components/products/AddProductForm';
import { useProducts } from '@/providers/AppStore';
import { useToast } from '@/providers/ToastProvider';

export default function AddProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addProduct } = useProducts();
  const { showToast } = useToast();

  return (
    <AddProductForm
      insetTop={insets.top}
      onBack={() => router.back()}
      onSubmit={(input) => addProduct(input)}
      onSaved={() => {
        showToast('Product saved');
        router.back();
      }}
    />
  );
}
