import { Daisy } from './Daisy';

type PhaseFlowerProps = {
  color: string;
  size?: number;
};

/** Same glyph as Daisy — used for cycle phase indicators */
export function PhaseFlower({ color, size = 20 }: PhaseFlowerProps) {
  return <Daisy color={color} size={size} />;
}
