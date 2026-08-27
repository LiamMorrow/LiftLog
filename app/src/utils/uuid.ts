import { v4, v5, stringify } from 'uuid';

export const uuid = v4;

/** Name-based UUID (v5) for stable IDs derived from content. */
export const uuidFromName = v5;

export const uuidStringify = stringify;
