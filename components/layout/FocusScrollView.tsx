import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';

function scrollToTop(scrollView: ScrollView | null) {
  scrollView?.scrollTo({ y: 0, animated: false });
}

export const FocusScrollView = forwardRef<ScrollView, ScrollViewProps>(function FocusScrollView(
  props,
  forwardedRef,
) {
  const scrollRef = useRef<ScrollView>(null);

  useImperativeHandle(forwardedRef, () => scrollRef.current as ScrollView);

  useScrollToTop(scrollRef);

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollToTop(scrollRef.current);
      });
    }, []),
  );

  return <ScrollView ref={scrollRef} {...props} />;
});
