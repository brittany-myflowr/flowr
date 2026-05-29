import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { plannerCornerRadius } from '@/constants/plannerCardStyles';
import { fonts } from '@/constants/typography';
import { s, vs, fs } from '@/lib/scale';

export type ToastVariant = 'success' | 'destructive';

type ToastState = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 2000;

function ToastBanner({ toast }: { toast: ToastState }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(s(-12))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const isDestructive = toast.variant === 'destructive';

  return (
    <Animated.View
      style={[
        styles.toast,
        isDestructive ? styles.toastDestructive : styles.toastSuccess,
        {
          top: insets.top + s(8),
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={[styles.message, isDestructive && styles.messageDestructive]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({ id: Date.now(), message, variant });

    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastBanner key={toast.id} toast={toast} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: s(16),
    right: s(16),
    zIndex: 9999,
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: plannerCornerRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
    alignItems: 'center',
  },
  toastSuccess: {
    backgroundColor: colors.navy,
  },
  toastDestructive: {
    backgroundColor: colors.danger,
  },
  message: {
    fontFamily: fonts.dmSans,
    fontSize: fs(11),
    letterSpacing: s(0.5),
    color: colors.white,
    textAlign: 'center',
  },
  messageDestructive: {
    color: colors.white,
  },
});
