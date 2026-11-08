export interface MuscleMapRegion {
  muscle: string | null;
  tone: 'muscle' | 'body';
  d: string;
  mirror: boolean;
}

function muscle(name: string, d: string): MuscleMapRegion {
  return { muscle: name, tone: 'muscle', d, mirror: true };
}

function unmappedMuscle(d: string): MuscleMapRegion {
  return { muscle: null, tone: 'muscle', d, mirror: true };
}

function body(d: string, mirror = true): MuscleMapRegion {
  return { muscle: null, tone: 'body', d, mirror };
}

export const muscleMapFigureWidth = 100;
export const muscleMapFigureHeight = 200;

const head = body('M 50 3 C 56 3 59 8 59 14 C 59 21 55 25 50 25 C 45 25 41 21 41 14 C 41 8 44 3 50 3 Z', false);
const hand = body('M 78 115 C 81 114 84 115 85 117 C 86 121 85 126 82 128 C 79 128 77 125 77 121 Z');
const foot = body('M 61 186 L 67 186 C 69 189 70 193 68 195 C 65 196 61 196 60 194 C 59 191 60 188 61 186 Z');

export const muscleMapFace = [
  'M 46.5 11.5 C 47.4 11.5 48 12.2 48 13 C 48 13.8 47.4 14.5 46.5 14.5 C 45.6 14.5 45 13.8 45 13 C 45 12.2 45.6 11.5 46.5 11.5 Z',
  'M 53.5 11.5 C 54.4 11.5 55 12.2 55 13 C 55 13.8 54.4 14.5 53.5 14.5 C 52.6 14.5 52 13.8 52 13 C 52 12.2 52.6 11.5 53.5 11.5 Z',
  'M 47.5 18.5 C 49 20 51 20 52.5 18.5 C 51.5 21.2 48.5 21.2 47.5 18.5 Z',
];

export const muscleMapFront: MuscleMapRegion[] = [
  head,
  muscle('neck', 'M 46 24 C 48 26 52 26 54 24 L 55 32 C 52 34 48 34 45 32 Z'),
  muscle('traps', 'M 56 27 C 58 30 62 32 67 33 C 63 34 59 34 56 33 Z'),
  muscle('shoulders', 'M 67 35 C 75 34 80 39 80 47 L 79 56 C 75 52 71 49 69 47 C 68 43 67 39 67 35 Z'),
  muscle('chest', 'M 51 36 L 65 35 C 67 40 68 45 68 50 C 63 56 56 58 51 57 Z'),
  muscle('biceps', 'M 70 51 C 74 54 77 56 79 59 L 79 74 C 77 77 74 78 72 76 C 70 68 69 60 70 51 Z'),
  muscle('forearms', 'M 72 79 C 75 80 78 79 80 77 C 83 88 85 100 84 112 L 78 113 C 75 104 72 92 72 79 Z'),
  hand,
  muscle('abdominals', 'M 51 60 C 55 60 58 59 61 58 L 61 69 C 58 70 54 70 51 70 Z'),
  muscle('abdominals', 'M 51 72 C 54 72 58 72 61 71 L 61 80 C 58 81 54 81 51 81 Z'),
  muscle('abdominals', 'M 51 83 C 54 83 58 83 61 82 L 61 91 C 58 92 54 92 51 92 Z'),
  muscle('abdominals', 'M 51 94 C 54 94 58 94 61 93 L 61 95 C 58 99 54 101 51 103 Z'),
  muscle('abdominals', 'M 63 58 C 66 62 68 70 68 80 C 67 87 66 92 63 96 Z'),
  muscle('abductors', 'M 66 97 C 68 96 70 97 71 100 L 70 106 C 68 104 66 101 66 97 Z'),
  muscle(
    'quadriceps',
    'M 58 105 C 61 102 64 100 67 99 C 69 104 70 108 70 110 C 72 120 71 130 70 140 C 66 144 61 144 59 140 C 57 128 56 116 58 105 Z',
  ),
  muscle('adductors', 'M 51 107 C 53 105 55 105 56 107 C 55 118 55 128 57 137 C 54 131 52 120 51 107 Z'),
  body('M 60 144 C 63 146 66 146 69 144 C 69 148 68 151 66 152 C 64 153 62 152 61 151 C 60 149 60 147 60 144 Z'),
  muscle(
    'calves',
    'M 59 155 C 60 154 61 154 61.5 155 C 61.5 162 61.5 169 62.5 177 C 60.5 173 59 167 58 161 C 58 158 58 156 59 155 Z',
  ),
  muscle('calves', 'M 69.2 155 C 70 155.5 70.5 156 70.5 157.5 C 71 163 70 169 68.5 175 C 68 168 68 161 69.2 155 Z'),
  unmappedMuscle(
    'M 63 155 C 65 154 66.5 154 67.8 155 C 67.5 164 66.5 174 65.5 185 L 63.5 185 C 63.5 175 63 165 63 155 Z',
  ),
  foot,
];

export const muscleMapBack: MuscleMapRegion[] = [
  head,
  muscle('neck', 'M 46 24 C 48 26 52 26 54 24 L 54 28 C 52 29 48 29 46 28 Z'),
  muscle('traps', 'M 51 29 C 53 30 55 30 56 29 C 60 32 65 34 68 35 C 63 38 57 42 51 45 Z'),
  muscle('shoulders', 'M 70 37 C 76 36 80 41 80 48 L 79 55 C 76 51 73 47 71 44 Z'),
  muscle(
    'middle_back',
    'M 51 47 C 57 44 63 40 68 37 C 69 40 69 43 68 46 C 66 50 64 54 62 58 C 60 61 58 63 56 64 L 51 64 Z',
  ),
  muscle('lats', 'M 70 47 C 71 57 70 68 67 79 C 64 85 61 89 59 91 L 58 75 C 60 67 62 61 65 57 C 67 54 69 51 70 47 Z'),
  muscle('triceps', 'M 72 47 C 75 51 78 55 80 58 L 80 72 C 78 76 75 77 73 76 C 71 68 70 56 72 47 Z'),
  muscle('forearms', 'M 73 79 C 76 80 78 79 80 77 C 83 88 85 100 84 112 L 78 113 C 75 104 73 92 73 79 Z'),
  hand,
  muscle('lower_back', 'M 51 66 L 56 66 C 56 76 56 86 57 95 L 51 97 Z'),
  muscle('abductors', 'M 59 93 C 64 91 69 93 70 98 C 70 101 69 102 68 101 C 65 99 62 98 58 98 Z'),
  muscle('glutes', 'M 51 100 C 56 99 62 99 67 102 C 70 107 70 114 68 119 C 63 122 56 122 51 120 Z'),
  muscle(
    'hamstrings',
    'M 56 124 C 61 125 66 124 69 121 C 71 130 70 140 67 146 C 64 148 60 148 58 145 C 56 138 55 130 56 124 Z',
  ),
  muscle('adductors', 'M 51 123 C 52 123 53 124 54 125 C 54 131 54 137 55 141 C 53 135 51 129 51 123 Z'),
  muscle(
    'calves',
    'M 59 152 C 63 149 68 150 71 154 C 72 160 71 166 68 172 C 67 176 66 180 65 183 L 63 183 C 62 179 60 175 59 170 C 57 164 57 157 59 152 Z',
  ),
  foot,
];
