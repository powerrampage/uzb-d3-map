import { LabelCfg } from "./types";

/**
 * Label positioning configuration for each region
 */
export const labelConfig: Partial<Record<string, LabelCfg>> = {
  "26": { side: "top", tiltDeg: 0, h: 0, v: 120 },
  "27": { side: "bottom", angleDeg: 30, h: 20, v: 200, dotDx: 0 },
  "14": { dotDx: -5, dotDy: 5, side: "top", tiltDeg: 0, h: 0, v: 90 },
  "30": { dotDx: -5, dotDy: -5, side: "bottom", tiltDeg: 0, h: 0, v: 100 },
  "3": { dotDx: -5, dotDy: -5, side: "bottom", tiltDeg: 0, h: 0, v: 50 },
  "35": {
    dotDx: -50,
    dotDy: 0,
    side: "bottom",
    tiltDeg: 0,
    angleDeg: 120,
    turnDeg: -100,
    h: 100,
    v: 50,
  },
  "33": {
    dotDx: -30,
    dotDy: -10,
    side: "bottom",
    tiltDeg: 0,
    angleDeg: 120,
    turnDeg: -10,
    h: 50,
    v: 50,
  },
  "6": {
    dotDx: -30,
    dotDy: -10,
    side: "bottom",
    tiltDeg: 0,
    angleDeg: 120,
    turnDeg: -10,
    h: 50,
    v: 50,
  },
  "12": { side: "top", tiltDeg: 0, h: 0, v: 150, dotDx: 30, dotDy: -50 },
  "18": {
    side: "top",
    h: 20,
    v: 200,
    dotDx: 10,
    dotDy: 0,
    tiltDeg: 0,
    angleDeg: 220,
    turnDeg: -10,
  },
  "8": { side: "top", angleDeg: -60, h: 0, v: 100, dotDx: 0, dotDy: 0 },
  "10": {
    dotDx: -30,
    dotDy: -10,
    side: "bottom",
    tiltDeg: 0,
    angleDeg: 120,
    turnDeg: -10,
    h: 50,
    v: 50,
  },
  "22": { side: "bottom", tiltDeg: 0, h: 0, v: 80 },
  "24": { dotDx: 5, dotDy: 0, side: "bottom", tiltDeg: 0, h: 15, v: 40 },
};

/**
 * Legacy region metadata (deprecated - use locale translations instead)
 * @deprecated Use getRegionName from locales.ts instead
 */
export const regionMeta: Record<string, { name: string; value: number }> = {
  "35": { name: "Qoraqalpog'iston", value: 3401.3 },
  "33": { name: "Xorazm", value: 5499.9 },
  "6": { name: "Buxoro", value: 6778.4 },
  "12": { name: "Navoiy", value: 6040.5 },
  "18": { name: "Samarqand", value: 5582.6 },
  "8": { name: "Jizzax", value: 4576.0 },
  "24": { name: "Sirdaryo", value: 4499.5 },
  "30": { name: "Farg'ona", value: 4752.8 },
  "3": { name: "Andijon", value: 5316.3 },
  "14": { name: "Namangan", value: 5665.2 },
  "22": { name: "Surxondaryo", value: 6031.4 },
  "10": { name: "Qashqadaryo", value: 6394.8 },
  "27": { name: "Toshkent v.", value: 6142.2 },
  "26": { name: "Toshkent sh.", value: 10211.0 },
};
