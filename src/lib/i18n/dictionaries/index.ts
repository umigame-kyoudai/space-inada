import type { Locale } from "../locales";
import type { Dictionary } from "./types";
import { en } from "./en";
import { ko } from "./ko";
import { zh } from "./zh";

const dictionaries: Record<Locale, Dictionary> = { en, ko, zh };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary } from "./types";
