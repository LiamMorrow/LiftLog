import '@/modules/native-crypto';
import { v4, stringify, parse } from 'uuid';

export const uuid = v4;

export const uuidStringify = stringify;

export const uuidParse = parse;
