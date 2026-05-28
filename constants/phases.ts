export type PhaseKey = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export type Phase = {
  key: PhaseKey;
  label: string;
  color: string;
  description: string;
};

export const phases: Record<PhaseKey, Phase> = {
  menstrual: {
    key: 'menstrual',
    label: 'Menstrual',
    color: '#fca5a5',
    description: 'Rest & restore',
  },
  follicular: {
    key: 'follicular',
    label: 'Follicular',
    color: '#94a882',
    description: 'Energy rising',
  },
  ovulatory: {
    key: 'ovulatory',
    label: 'Ovulatory',
    color: '#fde68a',
    description: 'Peak power',
  },
  luteal: {
    key: 'luteal',
    label: 'Luteal',
    color: '#c4b5fd',
    description: 'Wind down & nourish',
  },
};

export const phaseKeys = Object.keys(phases) as PhaseKey[];
