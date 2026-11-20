import { Weight } from '@/models/weight';
import { LocalDate } from '@js-joda/core';

export interface BodyweightEntry {
  id: string;
  date: LocalDate;
  weight: Weight;
}
