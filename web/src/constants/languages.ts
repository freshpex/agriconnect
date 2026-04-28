export interface TranslationLanguage {
  code: string;
  name: string;
  region:
    | "Default"
    | "North"
    | "West"
    | "East"
    | "Central"
    | "Southern"
    | "Islands";
}

export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  { code: "en", name: "English", region: "Default" },
  { code: "ach", name: "Acholi", region: "East" },
  { code: "af", name: "Afrikaans", region: "Southern" },
  { code: "alz", name: "Alur", region: "Central" },
  { code: "am", name: "Amharic", region: "East" },
  { code: "ar", name: "Arabic", region: "North" },
  { code: "bm", name: "Bambara", region: "West" },
  { code: "bem", name: "Bemba", region: "Southern" },
  { code: "ny", name: "Chichewa / Nyanja", region: "Southern" },
  { code: "din", name: "Dinka", region: "East" },
  { code: "dov", name: "Dombe", region: "Southern" },
  { code: "ee", name: "Ewe", region: "West" },
  { code: "ff", name: "Fulfulde", region: "West" },
  { code: "gaa", name: "Ga", region: "West" },
  { code: "lg", name: "Ganda / Luganda", region: "East" },
  { code: "ha", name: "Hausa", region: "West" },
  { code: "ig", name: "Igbo", region: "West" },
  { code: "cgg", name: "Kiga", region: "East" },
  { code: "rw", name: "Kinyarwanda", region: "East" },
  { code: "ktu", name: "Kituba", region: "Central" },
  { code: "kri", name: "Krio", region: "West" },
  { code: "ln", name: "Lingala", region: "Central" },
  { code: "luo", name: "Luo", region: "East" },
  { code: "mg", name: "Malagasy", region: "Islands" },
  { code: "nr", name: "Ndebele (South)", region: "Southern" },
  { code: "nso", name: "Northern Sotho / Sepedi", region: "Southern" },
  { code: "nus", name: "Nuer", region: "East" },
  { code: "om", name: "Oromo", region: "East" },
  { code: "rn", name: "Rundi / Kirundi", region: "East" },
  { code: "sg", name: "Sango", region: "Central" },
  { code: "st", name: "Sesotho", region: "Southern" },
  { code: "crs", name: "Seychellois Creole", region: "Islands" },
  { code: "sn", name: "Shona", region: "Southern" },
  { code: "so", name: "Somali", region: "East" },
  { code: "sw", name: "Swahili", region: "East" },
  { code: "ss", name: "Swati", region: "Southern" },
  { code: "ti", name: "Tigrinya", region: "East" },
  { code: "ts", name: "Tsonga", region: "Southern" },
  { code: "tn", name: "Tswana", region: "Southern" },
  { code: "ak", name: "Twi / Akan", region: "West" },
  { code: "xh", name: "Xhosa", region: "Southern" },
  { code: "yo", name: "Yoruba", region: "West" },
  { code: "zu", name: "Zulu", region: "Southern" },
];

export const GOOGLE_INCLUDED_LANGUAGES = TRANSLATION_LANGUAGES.filter(
  (language) => language.code !== "en"
)
  .map((language) => language.code)
  .join(",");
