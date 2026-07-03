import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import type { FloralBlob, TodayFloralBackground } from '@/constants/todayFloralBackground';

type TodayFloralBackdropProps = {
  background: TodayFloralBackground;
};

/** Soft, out-of-focus floral color fields on a cream planner base. */
export function TodayFloralBackdrop({ background }: TodayFloralBackdropProps) {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          {background.blooms.map((blob, index) => (
            <RadialGradient
              key={`floral-gradient-${index}`}
              id={`floralBlob${index}`}
              cx={blob.cx}
              cy={blob.cy}
              fx={blob.cx}
              fy={blob.cy}
              rx={blob.rx}
              ry={blob.ry}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={blob.color} stopOpacity={blob.peakOpacity} />
              <Stop offset="0.32" stopColor={blob.color} stopOpacity={blob.peakOpacity * 0.62} />
              <Stop offset="0.68" stopColor={blob.color} stopOpacity={blob.peakOpacity * 0.22} />
              <Stop offset="1" stopColor={blob.color} stopOpacity="0" />
            </RadialGradient>
          ))}
        </Defs>

        {background.blooms.map((blob, index) => (
          <FloralBlobEllipse key={`floral-blob-${index}`} blob={blob} fill={`url(#floralBlob${index})`} />
        ))}
      </Svg>
    </View>
  );
}

function FloralBlobEllipse({ blob, fill }: { blob: FloralBlob; fill: string }) {
  return <Ellipse cx={blob.cx} cy={blob.cy} rx={blob.rx} ry={blob.ry} fill={fill} />;
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
