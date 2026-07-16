import { customAlphabet } from "nanoid";

/** URL-safe alphabet without lookalikes: 0/O, 1/I/l. */
const NOTE_ID_ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const NOTE_ID_LENGTH = 11;

const generateShortId = customAlphabet(NOTE_ID_ALPHABET, NOTE_ID_LENGTH);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SHORT_ID_RE = new RegExp(
  `^[${NOTE_ID_ALPHABET}]{${NOTE_ID_LENGTH}}$`,
);

/** True for legacy UUID ids and new short nanoid ids. */
export function isValidNoteId(id: string): boolean {
  return UUID_RE.test(id) || SHORT_ID_RE.test(id);
}

export function createNoteId(): string {
  return generateShortId();
}
