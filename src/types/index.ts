export type Language = 'ja' | 'en';

export type StallCategory =
  | 'market'          // マーケット
  | 'sponsor'         // スポンサー
  | 'paid_workshop'   // 有料ワークショップ
  | 'free_workshop'   // 無料ワークショップ
  | 'food'            // フード
  | 'kids'            // キッズアクティビティ
  | 'art'             // アート展示
  | 'kids_activity'   // 後方互換・エイリアス
  | 'art_exhibition'  // 後方互換・エイリアス
  | 'craft'           // 後方互換
  | 'workshop'        // 後方互換
  | 'goods';          // 後方互換

export interface Stall {
  id: string;
  boothNumber: string;
  nameJa: string;
  nameEn: string;
  category: StallCategory;
  categoryJa: string;
  categoryEn: string;
  shortDescJa: string;
  shortDescEn: string;
  descriptionJa: string;
  descriptionEn: string;
  mapX: number; // percentage from left (0 - 100)
  mapY: number; // percentage from top (0 - 100)
  tagsJa: string[];
  tagsEn: string[];
  imageUrl?: string;
  photoUrl?: string;
  instagram?: string;
  website?: string;
  priceRange?: string;
  highlightJa?: string;
  highlightEn?: string;
  locationJa?: string; // 出店場所 (例: Collingwood Town Hall, 公園, Djerring Centre)
  locationEn?: string;
  sponsorTier?: string; // スポンサー種別 (ゴールド、シルバー、ブロンズ、In-Kind、サポーター等)
}

export type PerformanceArea = 'stage' | 'outdoor' | 'main' | 'culture';

export interface StagePerformance {
  id: string;
  day: number; // 1 or 2
  stageId: PerformanceArea;
  stageNameJa: string;
  stageNameEn: string;
  startTime: string; // e.g., "11:00"
  endTime: string;   // e.g., "11:45"
  titleJa: string;
  titleEn: string;
  artistJa: string;
  artistEn: string;
  descJa: string;
  descEn: string;
  imageUrl?: string;
  photoUrl?: string;
  categoryJa: string;
  categoryEn: string;
  link?: string;
}

export type FacilityType = 'toilet' | 'info' | 'firstaid' | 'food_court' | 'trash' | 'nursing' | 'entrance';

export interface Facility {
  id: string;
  type: FacilityType;
  nameJa: string;
  nameEn: string;
  descJa: string;
  descEn: string;
  mapX: number; // percentage (0 - 100)
  mapY: number; // percentage (0 - 100)
}

export interface EventInfo {
  nameJa: string;
  nameEn: string;
  taglineJa: string;
  taglineEn: string;
  datesJa: string;
  datesEn: string;
  hoursJa: string;
  hoursEn: string;
  venueJa: string;
  venueEn: string;
  addressJa: string;
  addressEn: string;
  admissionJa: string;
  admissionEn: string;
  organizerJa: string;
  organizerEn: string;
  attendanceJa?: string;
  attendanceEn?: string;
  logoUrl?: string;
  announcementJa?: string;
  announcementEn?: string;
}

export interface FaqItem {
  questionJa: string;
  questionEn: string;
  answerJa: string;
  answerEn: string;
  categoryJa: string;
  categoryEn: string;
}

export type ActiveTab = 'map' | 'stalls' | 'stage' | 'info';
