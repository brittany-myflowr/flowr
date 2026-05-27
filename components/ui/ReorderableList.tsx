import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  PanResponder,
  ScrollView,
  View,
  type GestureResponderHandlers,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';

import {
  hapticDragEnd,
  hapticDragStart,
  hapticDragSwap,
} from '@/lib/haptics';

export type ReorderableRenderItemInfo<T> = {
  item: T;
  index: number;
  isActive: boolean;
  dragHandlers: GestureResponderHandlers;
};

type ReorderableListProps<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  onDragEnd: (data: T[]) => void;
  onItemPress?: (item: T, index: number) => void;
  /** Apply drag handlers on the full row wrapper (Today) vs inside renderItem (routine detail). */
  dragHandlersTarget?: 'row' | 'item';
  renderItem: (info: ReorderableRenderItemInfo<T>) => ReactNode;
  contentContainerStyle?: ViewStyle;
  ListFooterComponent?: ReactNode;
  style?: ViewStyle;
};

type ItemMetrics = {
  y: number;
  height: number;
};

const LONG_PRESS_MS = 150;
const TAP_MAX_MS = 250;

function reorderItems<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function swapMetrics(
  metricsByKey: Record<string, ItemMetrics>,
  firstKey: string,
  secondKey: string,
) {
  const first = metricsByKey[firstKey];
  const second = metricsByKey[secondKey];
  if (!first || !second) return;

  metricsByKey[firstKey] = { y: second.y, height: first.height };
  metricsByKey[secondKey] = { y: first.y, height: second.height };
}

export function ReorderableList<T>({
  data,
  keyExtractor,
  onDragEnd,
  onItemPress,
  dragHandlersTarget = 'item',
  renderItem,
  contentContainerStyle,
  ListFooterComponent,
  style,
}: ReorderableListProps<T>) {
  const [items, setItems] = useState(data);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const metricsRef = useRef<Record<string, ItemMetrics>>({});
  const translateY = useRef(new Animated.Value(0)).current;
  const dragOffsetRef = useRef(0);
  const itemsRef = useRef(items);
  const activeIndexRef = useRef(activeIndex);
  const activeKeyRef = useRef(activeKey);
  const onItemPressRef = useRef(onItemPress);
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const rowRefs = useRef<Record<string, View | null>>({});
  const touchLockCountRef = useRef(0);

  useEffect(() => {
    if (activeKeyRef.current == null) {
      setItems(data);
    }
  }, [data]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    activeKeyRef.current = activeKey;
  }, [activeKey]);

  useEffect(() => {
    onItemPressRef.current = onItemPress;
  }, [onItemPress]);

  const setScrollEnabled = useCallback((enabled: boolean) => {
    scrollRef.current?.setNativeProps({ scrollEnabled: enabled });
  }, []);

  const lockScroll = useCallback(() => {
    touchLockCountRef.current += 1;
    if (touchLockCountRef.current === 1) {
      setScrollEnabled(false);
    }
  }, [setScrollEnabled]);

  const unlockScroll = useCallback(() => {
    touchLockCountRef.current = Math.max(0, touchLockCountRef.current - 1);
    if (touchLockCountRef.current === 0 && activeKeyRef.current == null) {
      setScrollEnabled(true);
    }
  }, [setScrollEnabled]);

  const refreshMetrics = useCallback(() => {
    const container = contentRef.current;
    if (!container) return;

    for (const item of itemsRef.current) {
      const key = keyExtractor(item);
      const row = rowRefs.current[key];
      if (!row) continue;

      row.measureLayout(
        container,
        (_x, y, _width, height) => {
          metricsRef.current[key] = { y, height };
        },
        () => {},
      );
    }
  }, [keyExtractor]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      refreshMetrics();
    });

    return () => cancelAnimationFrame(frame);
  }, [items, refreshMetrics]);

  const finishDrag = useCallback(() => {
    if (activeKeyRef.current == null) return;

    hapticDragEnd();
    onDragEnd(itemsRef.current);

    setActiveKey(null);
    setActiveIndex(-1);
    activeKeyRef.current = null;
    activeIndexRef.current = -1;
    dragOffsetRef.current = 0;
    translateY.setValue(0);

    if (touchLockCountRef.current === 0) {
      setScrollEnabled(true);
    }
  }, [onDragEnd, setScrollEnabled, translateY]);

  const trySwapWithNeighbor = useCallback(
    (direction: 'up' | 'down', gestureDy: number) => {
      const fromIndex = activeIndexRef.current;
      const activeItemKey = activeKeyRef.current;
      if (fromIndex < 0 || activeItemKey == null) return false;

      const toIndex = direction === 'down' ? fromIndex + 1 : fromIndex - 1;
      const currentItems = itemsRef.current;
      if (toIndex < 0 || toIndex >= currentItems.length) return false;

      const neighborKey = keyExtractor(currentItems[toIndex]);
      const activeMetrics = metricsRef.current[activeItemKey];
      const neighborMetrics = metricsRef.current[neighborKey];
      if (!activeMetrics || !neighborMetrics) return false;

      const dragCenterY =
        activeMetrics.y + dragOffsetRef.current + gestureDy + activeMetrics.height / 2;
      const neighborMidpoint = neighborMetrics.y + neighborMetrics.height / 2;

      const shouldSwap =
        direction === 'down'
          ? dragCenterY > neighborMidpoint
          : dragCenterY < neighborMidpoint;

      if (!shouldSwap) return false;

      dragOffsetRef.current +=
        direction === 'down' ? -neighborMetrics.height : neighborMetrics.height;

      swapMetrics(metricsRef.current, activeItemKey, neighborKey);

      const nextItems = reorderItems(currentItems, fromIndex, toIndex);
      itemsRef.current = nextItems;
      setItems(nextItems);
      setActiveIndex(toIndex);
      activeIndexRef.current = toIndex;
      translateY.setValue(dragOffsetRef.current + gestureDy);
      hapticDragSwap();
      return true;
    },
    [keyExtractor, translateY],
  );

  const startDrag = useCallback(
    (key: string, index: number) => {
      if (activeKeyRef.current != null) return;

      refreshMetrics();
      hapticDragStart();
      activeKeyRef.current = key;
      activeIndexRef.current = index;
      dragOffsetRef.current = 0;
      translateY.setValue(0);
      setActiveKey(key);
      setActiveIndex(index);
      setScrollEnabled(false);
    },
    [refreshMetrics, setScrollEnabled, translateY],
  );

  const handleRowLayout = useCallback((key: string, event: LayoutChangeEvent) => {
    if (activeKeyRef.current === key) return;

    const { y, height } = event.nativeEvent.layout;
    metricsRef.current[key] = { y, height };
  }, []);

  const handleRowTouchStart = useCallback(() => {
    lockScroll();
  }, [lockScroll]);

  const handleRowTouchEnd = useCallback(() => {
    unlockScroll();
  }, [unlockScroll]);

  const rowRespondersRef = useRef<
    Map<
      string,
      {
        panHandlers: GestureResponderHandlers;
      }
    >
  >(new Map());

  const getRowPanHandlers = useCallback(
    (key: string) => {
      const existing = rowRespondersRef.current.get(key);
      if (existing) return existing.panHandlers;

      let longPressTimer: ReturnType<typeof setTimeout> | null = null;
      let longPressActivated = false;
      let longPressPending = false;
      let pressStartedAt = 0;

      const clearLongPressTimer = () => {
        if (longPressTimer != null) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      };

      const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () =>
          activeKeyRef.current == null || activeKeyRef.current === key,
        onStartShouldSetPanResponderCapture: () =>
          activeKeyRef.current == null || activeKeyRef.current === key,
        onMoveShouldSetPanResponder: () =>
          longPressPending || longPressActivated || activeKeyRef.current === key,
        onMoveShouldSetPanResponderCapture: () =>
          longPressPending || longPressActivated || activeKeyRef.current === key,
        onPanResponderTerminationRequest: () => {
          if (longPressPending || activeKeyRef.current === key) {
            return false;
          }
          return true;
        },
        onPanResponderGrant: () => {
          if (activeKeyRef.current != null && activeKeyRef.current !== key) return;

          pressStartedAt = Date.now();
          longPressActivated = false;
          longPressPending = true;
          clearLongPressTimer();

          longPressTimer = setTimeout(() => {
            longPressTimer = null;
            longPressPending = false;
            longPressActivated = true;

            const index = itemsRef.current.findIndex((item) => keyExtractor(item) === key);
            if (index >= 0) {
              startDrag(key, index);
            }
          }, LONG_PRESS_MS);
        },
        onPanResponderMove: (_, gesture) => {
          if (activeKeyRef.current !== key) return;

          translateY.setValue(dragOffsetRef.current + gesture.dy);

          if (!trySwapWithNeighbor('down', gesture.dy)) {
            trySwapWithNeighbor('up', gesture.dy);
          }
        },
        onPanResponderRelease: () => {
          clearLongPressTimer();
          longPressPending = false;

          if (longPressActivated) {
            finishDrag();
          } else if (
            onItemPressRef.current &&
            Date.now() - pressStartedAt <= TAP_MAX_MS
          ) {
            const index = itemsRef.current.findIndex((item) => keyExtractor(item) === key);
            const item = itemsRef.current[index];
            if (index >= 0 && item) {
              onItemPressRef.current(item, index);
            }
          }

          longPressActivated = false;
        },
        onPanResponderTerminate: () => {
          clearLongPressTimer();
          longPressPending = false;
          longPressActivated = false;
        },
      });

      rowRespondersRef.current.set(key, {
        panHandlers: panResponder.panHandlers,
      });

      return panResponder.panHandlers;
    },
    [finishDrag, keyExtractor, startDrag, trySwapWithNeighbor, translateY],
  );

  const rowTouchHandlers = {
    onTouchStart: handleRowTouchStart,
    onTouchEnd: handleRowTouchEnd,
    onTouchCancel: handleRowTouchEnd,
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={style}
      scrollEnabled={activeKey == null}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View ref={contentRef} style={contentContainerStyle}>
        {items.map((item, index) => {
          const key = keyExtractor(item);
          const isActive = activeKey === key;
          const dragHandlers = getRowPanHandlers(key);
          const attachHandlersToRow = dragHandlersTarget === 'row';
          const content = renderItem({
            item,
            index,
            isActive,
            dragHandlers: attachHandlersToRow ? {} : dragHandlers,
          });

          return (
            <View
              key={key}
              ref={(node) => {
                rowRefs.current[key] = node;
              }}
              {...rowTouchHandlers}
              {...(attachHandlersToRow ? dragHandlers : undefined)}
              onLayout={(event) => handleRowLayout(key, event)}
              style={isActive ? styles.activeRow : undefined}
            >
              <Animated.View
                style={isActive ? { transform: [{ translateY }] } : undefined}
              >
                {content}
              </Animated.View>
            </View>
          );
        })}
        {ListFooterComponent}
      </View>
    </ScrollView>
  );
}

const styles = {
  activeRow: {
    zIndex: 2,
    elevation: 4,
  },
} as const;
