import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import type { MeshColorPool, TodayMeshGradient } from '@/constants/todayMeshGradients';

type TodayMeshGradientProps = {
  mesh: TodayMeshGradient;
};

/** Multi-pool mesh gradient — soft glowing color fields, no harsh overlays. */
export function TodayMeshGradientBackdrop({ mesh }: TodayMeshGradientProps) {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          {mesh.pools.map((pool, index) => (
            <RadialGradient
              key={`pool-gradient-${index}`}
              id={`meshPool${index}`}
              cx={pool.cx}
              cy={pool.cy}
              fx={pool.cx}
              fy={pool.cy}
              rx={pool.rx}
              ry={pool.ry}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={pool.color} stopOpacity={pool.peakOpacity} />
              <Stop offset="0.38" stopColor={pool.color} stopOpacity={pool.peakOpacity * 0.55} />
              <Stop offset="0.72" stopColor={pool.color} stopOpacity={pool.peakOpacity * 0.18} />
              <Stop offset="1" stopColor={pool.color} stopOpacity="0" />
            </RadialGradient>
          ))}
        </Defs>

        {mesh.pools.map((pool, index) => (
          <MeshPoolEllipse key={`pool-ellipse-${index}`} pool={pool} fill={`url(#meshPool${index})`} />
        ))}
      </Svg>
    </View>
  );
}

function MeshPoolEllipse({ pool, fill }: { pool: MeshColorPool; fill: string }) {
  return <Ellipse cx={pool.cx} cy={pool.cy} rx={pool.rx} ry={pool.ry} fill={fill} />;
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
