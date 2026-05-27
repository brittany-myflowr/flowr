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
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';

export type ReorderableRenderItemInfo<T> = {
  item: T;
  index: number;
  drag: () => void;
  isActive: boolean;
};

type ReorderableListProps<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  onDragEnd: (data: T[]) => void;
  renderItem: (info: ReorderableRenderItemInfo<T>) => ReactNode;
  contentContainerStyle?: ViewStyle;
  ListFooterComponent?: ReactNode;
  style?: ViewStyle;
};

type ItemMetrics = {
  y: number;
  height: number;
};

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

  const finishDrag = useCallback(() => {
    if (activeKeyRef.current != null) {
      onDragEnd(itemsRef.current);
    }

    setActiveKey(null);
    setActiveIndex(-1);
    activeKeyRef.current = null;
    activeIndexRef.current = -1;
    dragOffsetRef.current = 0;
    translateY.setValue(0);
  }, [onDragEnd, translateY]);

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
      return true;
    },
    [keyExtractor, translateY],
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => activeKeyRef.current != null,
      onMoveShouldSetPanResponderCapture: () => activeKeyRef.current != null,
      onPanResponderMove: (_, gesture) => {
        if (activeKeyRef.current == null) return;

        translateY.setValue(dragOffsetRef.current + gesture.dy);

        if (!trySwapWithNeighbor('down', gesture.dy)) {
          trySwapWithNeighbor('up', gesture.dy);
        }
      },
      onPanResponderRelease: finishDrag,
      onPanResponderTerminate: finishDrag,
    }),
  ).current;

  const startDrag = useCallback(
    (key: string, index: number) => {
      setActiveKey(key);
      setActiveIndex(index);
      activeKeyRef.current = key;
      activeIndexRef.current = index;
      dragOffsetRef.current = 0;
      translateY.setValue(0);
    },
    [translateY],
  );

  const handleLayout = useCallback((key: string, event: LayoutChangeEvent) => {
    if (activeKeyRef.current === key) return;

    const { y, height } = event.nativeEvent.layout;
    metricsRef.current[key] = { y, height };
  }, []);

  const handleActiveLayout = useCallback((key: string, event: LayoutChangeEvent) => {
    if (activeKeyRef.current !== key) return;

    const { y, height } = event.nativeEvent.layout;
    if (!metricsRef.current[key]) {
      metricsRef.current[key] = { y, height };
    }
  }, []);

  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      scrollEnabled={activeKey == null}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...panResponder.panHandlers}
    >
      {items.map((item, index) => {
        const key = keyExtractor(item);
        const isActive = activeKey === key;
        const content = renderItem({
          item,
          index,
          drag: () => startDrag(key, index),
          isActive,
        });

        if (isActive) {
          return (
            <Animated.View
              key={key}
              onLayout={(event) => handleActiveLayout(key, event)}
              style={{
                transform: [{ translateY }],
                zIndex: 2,
                elevation: 4,
              }}
            >
              {content}
            </Animated.View>
          );
        }

        return (
          <View key={key} onLayout={(event) => handleLayout(key, event)}>
            {content}
          </View>
        );
      })}
      {ListFooterComponent}
    </ScrollView>
  );
};
