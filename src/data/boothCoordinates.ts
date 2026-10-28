export interface BoothCoord {
  x: number; // パーセンテージ (0 - 100)
  y: number; // パーセンテージ (0 - 100)
  locationJa: string;
  locationEn: string;
}

/**
 * 2026年日本文化芸術祭 (JCAF) 公式会場マップ（954x1024px）基準のブース座標定義
 */
export const BOOTH_COORDINATES: Record<string, BoothCoord> = {
  // --- マーケット (Market: M01 - M13, M00) ---
  'M01': { x: 45.4, y: 9.3, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'M02': { x: 47.8, y: 6.6, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'M03': { x: 51.3, y: 6.6, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'M04': { x: 54.9, y: 6.6, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'M05': { x: 58.2, y: 6.6, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'M06': { x: 60.3, y: 9.3, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'M07': { x: 12.4, y: 36.1, locationJa: 'Collingwood Town Hall', locationEn: 'Collingwood Town Hall' },
  'M08': { x: 15.0, y: 39.8, locationJa: 'Collingwood Town Hall', locationEn: 'Collingwood Town Hall' },
  'M09': { x: 18.3, y: 36.1, locationJa: 'Collingwood Town Hall', locationEn: 'Collingwood Town Hall' },
  'M00': { x: 18.3, y: 36.1, locationJa: 'Collingwood Town Hall', locationEn: 'Collingwood Town Hall' },
  'M10': { x: 34.5, y: 62.2, locationJa: 'Djerring Centre (DC)', locationEn: 'Djerring Centre (DC)' },
  'M11': { x: 22.8, y: 81.8, locationJa: 'Courtyard (中庭)', locationEn: 'Courtyard' },
  'M12': { x: 29.8, y: 81.8, locationJa: 'Courtyard (中庭)', locationEn: 'Courtyard' },
  'M13': { x: 39.5, y: 79.5, locationJa: 'Courtyard (中庭)', locationEn: 'Courtyard' },

  // --- 有料ワークショップ (Paid Workshop: PW01 - PW13) ---
  'PW01': { x: 45.4, y: 12.8, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW02': { x: 51.3, y: 12.8, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW03': { x: 54.6, y: 12.8, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW04': { x: 60.3, y: 12.8, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW05': { x: 45.4, y: 16.0, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW06': { x: 51.3, y: 16.0, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW07': { x: 54.6, y: 16.0, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW08': { x: 60.3, y: 16.0, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW09': { x: 45.4, y: 19.3, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW10': { x: 51.3, y: 19.3, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW11': { x: 54.6, y: 19.3, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW12': { x: 60.3, y: 19.3, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'PW13': { x: 60.3, y: 25.8, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },

  // --- 無料ワークショップ (Free Workshop: FW01 - FW11) ---
  'FW01': { x: 45.4, y: 24.5, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW02': { x: 51.3, y: 24.5, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW03': { x: 54.6, y: 24.5, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW04': { x: 60.3, y: 22.6, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW05': { x: 45.4, y: 27.5, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW06': { x: 51.3, y: 27.5, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW07': { x: 54.6, y: 27.5, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW08': { x: 45.4, y: 30.8, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW09': { x: 51.3, y: 30.8, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW10': { x: 54.6, y: 30.8, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },
  'FW11': { x: 60.3, y: 31.2, locationJa: 'Collingwood Town Hall (Main Hall)', locationEn: 'Collingwood Town Hall (Main Hall)' },

  // --- フード (Food: F01 - F17) ---
  'F01': { x: 38.6, y: 27.8, locationJa: 'Collingwood Town Hall 通路', locationEn: 'Collingwood Town Hall Passage' },
  'F02': { x: 37.6, y: 66.8, locationJa: 'Djerring Centre (DC)', locationEn: 'Djerring Centre (DC)' },
  'F03': { x: 29.6, y: 62.2, locationJa: 'Djerring Centre (DC)', locationEn: 'Djerring Centre (DC)' },
  'F04': { x: 25.6, y: 62.2, locationJa: 'Djerring Centre (DC)', locationEn: 'Djerring Centre (DC)' },
  'F05': { x: 21.3, y: 62.2, locationJa: 'Djerring Centre (DC)', locationEn: 'Djerring Centre (DC)' },
  'F06': { x: 20.3, y: 66.4, locationJa: 'Djerring Centre (DC)', locationEn: 'Djerring Centre (DC)' },
  'F07': { x: 20.1, y: 70.3, locationJa: 'Djerring Centre (DC)', locationEn: 'Djerring Centre (DC)' },
  'F08': { x: 24.9, y: 71.8, locationJa: 'Djerring Centre (DC)', locationEn: 'Djerring Centre (DC)' },
  'F09': { x: 82.3, y: 62.9, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },
  'F10': { x: 66.7, y: 62.9, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },
  'F11': { x: 62.2, y: 62.9, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },
  'F12': { x: 57.5, y: 62.9, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },
  'F13': { x: 52.9, y: 62.9, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },
  'F14': { x: 73.2, y: 84.5, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },
  'F15': { x: 59.4, y: 84.4, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },
  'F16': { x: 55.0, y: 84.4, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },
  'F17': { x: 48.5, y: 78.8, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },

  // --- キッズアクティビティ (Kids Activities: K01, K02) ---
  'K01': { x: 48.5, y: 76.4, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },
  'K02': { x: 48.5, y: 81.2, locationJa: 'Town Hall Reserve (Park)', locationEn: 'Town Hall Reserve (Park)' },

  // --- スポンサー (Sponsors: S1, S2, S3) ---
  'S1': { x: 78.7, y: 26.8, locationJa: 'Collingwood Town Hall', locationEn: 'Collingwood Town Hall' },
  'S2': { x: 77.9, y: 31.4, locationJa: 'Collingwood Town Hall', locationEn: 'Collingwood Town Hall' },
  'S3': { x: 66.3, y: 30.8, locationJa: 'Collingwood Town Hall', locationEn: 'Collingwood Town Hall' },

  // --- アート展示 (Art Exhibition: A1 - A9) ---
  'A1': { x: 71.7, y: 20.8, locationJa: 'Collingwood Town Hall (Art Room)', locationEn: 'Collingwood Town Hall (Art Room)' },
  'A2': { x: 71.7, y: 19.3, locationJa: 'Collingwood Town Hall (Art Room)', locationEn: 'Collingwood Town Hall (Art Room)' },
  'A3': { x: 72.8, y: 18.5, locationJa: 'Collingwood Town Hall (Art Room)', locationEn: 'Collingwood Town Hall (Art Room)' },
  'A4': { x: 74.3, y: 18.5, locationJa: 'Collingwood Town Hall (Art Room)', locationEn: 'Collingwood Town Hall (Art Room)' },
  'A5': { x: 75.8, y: 18.5, locationJa: 'Collingwood Town Hall (Art Room)', locationEn: 'Collingwood Town Hall (Art Room)' },
  'A6': { x: 77.3, y: 19.3, locationJa: 'Collingwood Town Hall (Art Room)', locationEn: 'Collingwood Town Hall (Art Room)' },
  'A7': { x: 77.3, y: 22.8, locationJa: 'Collingwood Town Hall (Art Room)', locationEn: 'Collingwood Town Hall (Art Room)' },
  'A8': { x: 77.3, y: 24.8, locationJa: 'Collingwood Town Hall (Art Room)', locationEn: 'Collingwood Town Hall (Art Room)' },
  'A9': { x: 74.2, y: 25.2, locationJa: 'Collingwood Town Hall (Art Room)', locationEn: 'Collingwood Town Hall (Art Room)' }
};

/**
 * ブース番号文字列から対応するマップ座標を取得するヘルパー関数
 * （ハイフンやゼロ埋めの表記揺れを自動正規化）
 */
export function getBoothCoordinates(rawBooth?: string | null): BoothCoord | null {
  if (!rawBooth) return null;
  const cleaned = rawBooth.trim().toUpperCase().replace(/[-ー_#\s]/g, '');
  if (!cleaned) return null;

  // 1. 完全一致
  if (BOOTH_COORDINATES[cleaned]) {
    return BOOTH_COORDINATES[cleaned];
  }

  // 2. 1桁番号のゼロ埋め（M1 -> M01, F1 -> F01, PW1 -> PW01, FW1 -> FW01, K1 -> K01）
  const withZero = cleaned.replace(/^([A-Z]+)(\d)$/, '$10$2');
  if (BOOTH_COORDINATES[withZero]) {
    return BOOTH_COORDINATES[withZero];
  }

  // 3. ゼロ除去（S01 -> S1, A01 -> A1）
  const withoutZero = cleaned.replace(/^([A-Z]+)0(\d)$/, '$1$2');
  if (BOOTH_COORDINATES[withoutZero]) {
    return BOOTH_COORDINATES[withoutZero];
  }

  return null;
}
