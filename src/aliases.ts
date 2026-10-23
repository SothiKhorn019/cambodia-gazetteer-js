/**
 * Other common Latin spellings of province names, by province code: Wikipedia's,
 * older "Kompong" forms, and the UN romanization used in many datasets.
 *
 * Search compares Latin names without case, accents, spaces or punctuation, so a
 * spelling that differs from NCDD's `en_name` only in those ways needs no entry here
 * ("Siem Reap" already matches "Siemreap", "Mondulkiri" matches "Mondul Kiri").
 */
export const PROVINCE_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "02": ["Batdambang"],
  "03": ["Kompong Cham"],
  "04": ["Kompong Chhnang"],
  "05": ["Kompong Speu", "Kampong Spoe"],
  "06": ["Kompong Thom", "Kampong Thum"],
  "09": ["Kaoh Kong"],
  "10": ["Kracheh"],
  "11": ["Mondol Kiri"],
  "12": ["Phnum Penh"],
  "15": ["Pouthisat"],
  "16": ["Ratanakiri", "Rattanakiri", "Rotanokiri"],
  "17": ["Siem Reab"],
  "18": ["Sihanoukville", "Kampong Som", "Kompong Som"],
  "19": ["Stoeng Treng", "Steung Treng"],
  "21": ["Takev"],
  "22": ["Otdar Meanchey", "Oddor Meanchey"],
  "25": ["Tbong Khmum"],
};
