import Papa from 'papaparse';
import type { Stall, StagePerformance, Facility, StallCategory, PerformanceArea } from '../types';
import { initialFacilities, initialStalls, initialStages } from '../data/mockData';

const STORAGE_KEYS = {
  // 個別7シートURL
  MARKET_CSV_URL: 'jcaf_market_csv_url',
  SPONSOR_CSV_URL: 'jcaf_sponsor_csv_url',
  PAID_WORKSHOP_CSV_URL: 'jcaf_paid_workshop_csv_url',
  FREE_WORKSHOP_CSV_URL: 'jcaf_free_workshop_csv_url',
  FOOD_CSV_URL: 'jcaf_food_csv_url',
  STAGE_CSV_URL: 'jcaf_stage_csv_url',
  OUTDOOR_CSV_URL: 'jcaf_outdoor_csv_url',

  // 従来の後方互換URL
  STALLS_CSV_URL: 'jcaf_stalls_csv_url',
  STAGES_CSV_URL: 'jcaf_stages_csv_url',
  FACILITIES_CSV_URL: 'jcaf_facilities_csv_url',

  // キャッシュ
  CACHED_STALLS: 'jcaf_cached_stalls',
  CACHED_STAGES: 'jcaf_cached_stages',
  CACHED_FACILITIES: 'jcaf_cached_facilities',
  LAST_SYNC_TIME: 'jcaf_last_sync_time'
};

export interface SyncConfig {
  // 7分類個別シートURL
  marketCsvUrl: string;
  sponsorCsvUrl: string;
  paidWorkshopCsvUrl: string;
  freeWorkshopCsvUrl: string;
  foodCsvUrl: string;
  stageCsvUrl: string;
  outdoorCsvUrl: string;

  // 統合・施設用（任意）
  stallsCsvUrl: string;
  stagesCsvUrl: string;
  facilitiesCsvUrl: string;
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  marketCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=0&single=true&output=csv',
  sponsorCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=131662202&single=true&output=csv',
  paidWorkshopCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=1804696312&single=true&output=csv',
  freeWorkshopCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=1233726698&single=true&output=csv',
  foodCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=1944448555&single=true&output=csv',
  stageCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=795207739&single=true&output=csv',
  outdoorCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=536106092&single=true&output=csv',
  stallsCsvUrl: '',
  stagesCsvUrl: '',
  facilitiesCsvUrl: ''
};

export function getSyncConfig(): SyncConfig {
  return {
    marketCsvUrl: localStorage.getItem(STORAGE_KEYS.MARKET_CSV_URL) || DEFAULT_SYNC_CONFIG.marketCsvUrl,
    sponsorCsvUrl: localStorage.getItem(STORAGE_KEYS.SPONSOR_CSV_URL) || DEFAULT_SYNC_CONFIG.sponsorCsvUrl,
    paidWorkshopCsvUrl: localStorage.getItem(STORAGE_KEYS.PAID_WORKSHOP_CSV_URL) || DEFAULT_SYNC_CONFIG.paidWorkshopCsvUrl,
    freeWorkshopCsvUrl: localStorage.getItem(STORAGE_KEYS.FREE_WORKSHOP_CSV_URL) || DEFAULT_SYNC_CONFIG.freeWorkshopCsvUrl,
    foodCsvUrl: localStorage.getItem(STORAGE_KEYS.FOOD_CSV_URL) || DEFAULT_SYNC_CONFIG.foodCsvUrl,
    stageCsvUrl: localStorage.getItem(STORAGE_KEYS.STAGE_CSV_URL) || DEFAULT_SYNC_CONFIG.stageCsvUrl,
    outdoorCsvUrl: localStorage.getItem(STORAGE_KEYS.OUTDOOR_CSV_URL) || DEFAULT_SYNC_CONFIG.outdoorCsvUrl,

    stallsCsvUrl: localStorage.getItem(STORAGE_KEYS.STALLS_CSV_URL) || DEFAULT_SYNC_CONFIG.stallsCsvUrl,
    stagesCsvUrl: localStorage.getItem(STORAGE_KEYS.STAGES_CSV_URL) || DEFAULT_SYNC_CONFIG.stagesCsvUrl,
    facilitiesCsvUrl: localStorage.getItem(STORAGE_KEYS.FACILITIES_CSV_URL) || DEFAULT_SYNC_CONFIG.facilitiesCsvUrl
  };
}

export function saveSyncConfig(config: SyncConfig): void {
  localStorage.setItem(STORAGE_KEYS.MARKET_CSV_URL, config.marketCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.SPONSOR_CSV_URL, config.sponsorCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.PAID_WORKSHOP_CSV_URL, config.paidWorkshopCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.FREE_WORKSHOP_CSV_URL, config.freeWorkshopCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.FOOD_CSV_URL, config.foodCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.STAGE_CSV_URL, config.stageCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.OUTDOOR_CSV_URL, config.outdoorCsvUrl.trim());

  localStorage.setItem(STORAGE_KEYS.STALLS_CSV_URL, config.stallsCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.STAGES_CSV_URL, config.stagesCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.FACILITIES_CSV_URL, config.facilitiesCsvUrl.trim());
}

/**
 * Googleスプレッドシートの標準共有URL（/editや/view）から公開CSV用URLに自動変換するヘルパー
 */
export function convertToCsvExportUrl(inputUrl: string, gid?: string): string {
  if (!inputUrl) return '';
  const trimmed = inputUrl.trim();

  // すでに csv エクスポート URL の場合
  if (trimmed.includes('output=csv') || trimmed.includes('/pub?output=csv') || trimmed.includes('/export?format=csv')) {
    return trimmed;
  }

  // スプレッドシートIDを抽出: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    const targetGid = gid || (gidMatch ? gidMatch[1] : '0');
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${targetGid}`;
  }

  return trimmed;
}

/**
 * 公開CSV URLからデータをフェッチしてパース
 */
async function fetchAndParseCsv<T>(url: string): Promise<T[]> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/csv,text/plain,*/*'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}

/**
 * 日本語または英語の列名から柔軟に値を取得するヘルパー
 */
function getVal(row: Record<string, unknown>, ...keys: string[]): string {
  // 1. 完全一致
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim();
    }
  }

  // 2. 空白・アンダースコア・大文字小文字を無視した一致
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    const normK = k.toLowerCase().replace(/[\s_\-・/]/g, '');
    const matchedKey = rowKeys.find(rk => rk.toLowerCase().replace(/[\s_\-・/]/g, '') === normK);
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
      return String(row[matchedKey]).trim();
    }
  }

  return '';
}

/**
 * 列名に含まれるキーワードで部分一致検索するフォールバック
 */
function getValContaining(row: Record<string, unknown>, ...keywords: string[]): string {
  const direct = getVal(row, ...keywords);
  if (direct) return direct;

  const rowKeys = Object.keys(row);
  for (const kw of keywords) {
    const lowKw = kw.toLowerCase();
    const matchedKey = rowKeys.find(rk => rk.toLowerCase().includes(lowKw));
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
      return String(row[matchedKey]).trim();
    }
  }
  return '';
}

/**
 * Google Drive等のURLを直接表示可能な画像URLに正規化
 */
export function formatImageUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Google Drive URLの場合 (例: https://drive.google.com/file/d/XXX/view, https://drive.google.com/open?id=XXX)
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    // /file/d/{id}/
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
    }
    // ?id={id} または &id={id}
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}&sz=w1000`;
    }
    // /d/{id}
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch && dMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${dMatch[1]}&sz=w1000`;
    }
  }

  // すでに http/https またはスラッシュで始まっている場合
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Instagram のURLまたはユーザー名を https://www.instagram.com/xxx/ 形式に正規化
 */
export function formatInstagramUrl(rawVal: string): string {
  if (!rawVal) return '';
  let trimmed = rawVal.trim();
  if (!trimmed) return '';

  // すでにフルURLの場合
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // instagram.com/... で始まっている場合
  if (trimmed.startsWith('instagram.com') || trimmed.startsWith('www.instagram.com')) {
    return `https://${trimmed}`;
  }

  // @username または username の場合 (全角＠も対応)
  trimmed = trimmed.replace(/^[@＠]/, '').replace(/^\/+|\/+$/g, '');
  if (trimmed) {
    return `https://www.instagram.com/${trimmed}/`;
  }

  return '';
}

/**
 * WebサイトURLの正規化 (http/httpsの自動補完)
 */
export function formatWebsiteUrl(rawVal: string): string {
  if (!rawVal) return '';
  const trimmed = rawVal.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

/**
 * 1つのブース系CSV行をStallオブジェクトに変換
 */
function parseStallRow(
  row: Record<string, unknown>,
  index: number,
  defaultCategory: StallCategory,
  categoryLabelJa: string,
  categoryLabelEn: string
): Stall | null {
  const boothNumber = getVal(row, 'boothNumber', 'booth', 'ブース番号', 'ブース', 'No') || `B-${index + 1}`;
  const nameJa = getVal(row, 'nameJa', 'name', '出店名', '店名', 'ブース名', '名前', 'タイトル');
  const nameEn = getVal(row, 'nameEn', 'name_en', '英語名') || nameJa;

  if (!nameJa && !getVal(row, 'boothNumber', 'booth', 'ブース番号')) {
    return null;
  }

  // カテゴリ（明示指定があればそれを優先、なければシートデフォルト）
  const explicitCategory = getVal(row, 'category', 'カテゴリ', 'カテゴリー').toLowerCase();
  let category: StallCategory = defaultCategory;
  if (explicitCategory) {
    if (explicitCategory.includes('market') || explicitCategory.includes('マーケット') || explicitCategory.includes('craft') || explicitCategory.includes('goods')) {
      category = 'market';
    } else if (explicitCategory.includes('sponsor') || explicitCategory.includes('スポンサー')) {
      category = 'sponsor';
    } else if (explicitCategory.includes('paid') || explicitCategory.includes('有料')) {
      category = 'paid_workshop';
    } else if (explicitCategory.includes('free') || explicitCategory.includes('無料')) {
      category = 'free_workshop';
    } else if (explicitCategory.includes('food') || explicitCategory.includes('フード') || explicitCategory.includes('飲食')) {
      category = 'food';
    }
  }

  const categoryJa = getVal(row, 'categoryJa', 'カテゴリ名') || categoryLabelJa;
  const categoryEn = getVal(row, 'categoryEn', '英語カテゴリ名') || categoryLabelEn;

  const shortDescJa = getVal(row, 'shortDescJa', 'shortDesc', 'キャッチコピー', '概要', '短文紹介');
  const shortDescEn = getVal(row, 'shortDescEn', 'shortDesc_en', '英語キャッチコピー') || shortDescJa;

  const descriptionJa = getVal(row, 'descriptionJa', 'description', 'descJa', '紹介文', '説明', '詳細');
  const descriptionEn = getVal(row, 'descriptionEn', 'description_en', 'descEn', '英語紹介文') || descriptionJa;

  const mapX = Number(row.mapX ?? row.map_x ?? row.X ?? row.x ?? 50) || 50;
  const mapY = Number(row.mapY ?? row.map_y ?? row.Y ?? row.y ?? 50) || 50;

  const rawTagsJa = getVal(row, 'tagsJa', 'tags', 'タグ', 'キーワード');
  const rawTagsEn = getVal(row, 'tagsEn', 'tags_en', '英語タグ');

  const tagsJa = rawTagsJa ? rawTagsJa.split(/[,、/]/).map(t => t.trim()).filter(Boolean) : [];
  const tagsEn = rawTagsEn ? rawTagsEn.split(/[,、/]/).map(t => t.trim()).filter(Boolean) : tagsJa;

  const rawImageUrl =
    getVal(
      row,
      'imageUrl', 'image', '画像URL', '写真URL', '写真', '画像',
      'ロゴ', 'ロゴURL', 'logo', 'logoUrl', 'logo_url', 'Logo', 'LOGO',
      'ロゴデータ', 'ロゴデータのリンク', 'ロゴのリンク', 'ロゴリンク', 'ロゴデータリンク',
      '画像リンク', '画像のリンク', '写真リンク', '写真のリンク', '出店者ロゴ', '店舗ロゴ',
      'Logo Link', 'Logo URL', 'Logo Image', 'Icon', 'icon', 'アイコン'
    ) || getValContaining(row, 'ロゴ', 'logo', '画像', '写真', 'image');
  const imageUrl = rawImageUrl ? formatImageUrl(rawImageUrl) : undefined;

  const priceRange = getVal(row, 'priceRange', 'price', '価格帯', '価格', '料金') || undefined;
  const highlightJa = getVal(row, 'highlightJa', 'highlight', '見どころ', 'こだわり', 'おすすめ') || undefined;
  const highlightEn = getVal(row, 'highlightEn', 'highlight_en', '英語見どころ') || highlightJa;

  const rawInstagram = getVal(
    row,
    'instagram', 'インスタ', 'Instagram', 'インスタURL', 'Instagram URL',
    'instagramUrl', 'instagram_url', 'インスタグラム', 'SNS', 'SNS URL', 'sns',
    'IG', 'ig', 'Instagramアカウント', 'インスタアカウント'
  );
  const instagram = rawInstagram ? formatInstagramUrl(rawInstagram) : undefined;

  const rawWebsite = getVal(
    row,
    'website', 'hp', 'HP', 'ウェブサイト', '公式サイト', 'Webサイト',
    'url', 'URL', 'ホームページ', 'websiteUrl', 'website_url'
  );
  const website = rawWebsite ? formatWebsiteUrl(rawWebsite) : undefined;

  const rawLocationJa = getVal(
    row,
    'locationJa', 'location', '出店場所', '場所', 'エリア', '会場',
    '出店エリア', 'ブースエリア', 'ブース場所', 'area', 'Area', 'location_ja'
  );
  const locationJa = rawLocationJa || undefined;
  const locationEn = getVal(row, 'locationEn', 'location_en', '英語出店場所', '英語場所') || locationJa;

  const id = getVal(row, 'id', 'ID') || `stall-${category}-${index + 1}`;

  return {
    id,
    boothNumber,
    nameJa,
    nameEn,
    category,
    categoryJa,
    categoryEn,
    shortDescJa,
    shortDescEn,
    descriptionJa,
    descriptionEn,
    mapX,
    mapY,
    tagsJa,
    tagsEn,
    imageUrl,
    priceRange,
    highlightJa,
    highlightEn,
    instagram,
    website,
    locationJa,
    locationEn
  };
}

/**
 * 出店・ブース（マーケット、スポンサー、有料WS、無料WS、フード）のデータロード
 */
export async function loadStallsData(): Promise<{ data: Stall[]; isFromRemote: boolean; error?: string }> {
  const config = getSyncConfig();

  interface StallTarget {
    url: string;
    category: StallCategory;
    labelJa: string;
    labelEn: string;
  }

  // 取得対象シートの定義
  const allTargets: StallTarget[] = [
    { url: convertToCsvExportUrl(config.marketCsvUrl), category: 'market', labelJa: 'マーケット', labelEn: 'Market' },
    { url: convertToCsvExportUrl(config.sponsorCsvUrl), category: 'sponsor', labelJa: 'スポンサーブース', labelEn: 'Sponsor Booths' },
    { url: convertToCsvExportUrl(config.paidWorkshopCsvUrl), category: 'paid_workshop', labelJa: '有料ワークショップ', labelEn: 'Paid Workshop' },
    { url: convertToCsvExportUrl(config.freeWorkshopCsvUrl), category: 'free_workshop', labelJa: '無料ワークショップ', labelEn: 'Free Workshop' },
    { url: convertToCsvExportUrl(config.foodCsvUrl), category: 'food', labelJa: 'フード', labelEn: 'Food' },
    // 従来の総合シート
    { url: convertToCsvExportUrl(config.stallsCsvUrl), category: 'market', labelJa: 'ブース', labelEn: 'Booth' }
  ];
  const targets = allTargets.filter(t => Boolean(t.url));

  if (targets.length > 0) {
    try {
      const allStalls: Stall[] = [];
      let globalIndex = 0;

      for (const target of targets) {
        try {
          const rawRows = await fetchAndParseCsv<Record<string, unknown>>(target.url);
          rawRows.forEach((row) => {
            const parsed = parseStallRow(row, globalIndex++, target.category, target.labelJa, target.labelEn);
            if (parsed) {
              allStalls.push(parsed);
            }
          });
        } catch (targetErr) {
          console.warn(`Failed to fetch sheet for category ${target.category}:`, targetErr);
        }
      }

      if (allStalls.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CACHED_STALLS, JSON.stringify(allStalls));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
        return { data: allStalls, isFromRemote: true };
      }
    } catch (err: unknown) {
      console.warn('Failed to fetch stalls from sheets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const cached = localStorage.getItem(STORAGE_KEYS.CACHED_STALLS);
      if (cached) {
        try {
          return { data: JSON.parse(cached), isFromRemote: false, error: errorMessage };
        } catch {
          // ignore
        }
      }
      return { data: initialStalls, isFromRemote: false, error: errorMessage };
    }
  }

  // URL未指定の場合はキャッシュまたは初期データ
  const cached = localStorage.getItem(STORAGE_KEYS.CACHED_STALLS);
  if (cached) {
    try {
      return { data: JSON.parse(cached), isFromRemote: false };
    } catch {
      // ignore
    }
  }

  return { data: initialStalls, isFromRemote: false };
}

/**
 * 1つのパフォーマンス行をStagePerformanceオブジェクトに変換
 */
function parsePerformanceRow(
  row: Record<string, unknown>,
  index: number,
  defaultStageId: PerformanceArea,
  defaultStageNameJa: string,
  defaultStageNameEn: string
): StagePerformance | null {
  const rawTitleJa = getVal(row, 'titleJa', 'title', '演目', 'プログラム名', 'タイトル');
  const titleJa = rawTitleJa.replace(/\r?\n\s*/g, ' ').trim();
  const rawTitleEn = getVal(row, 'titleEn', 'title_en', '英語タイトル');
  const titleEn = rawTitleEn ? rawTitleEn.replace(/\r?\n\s*/g, ' ').trim() : titleJa;
  const rawArtistJa = getVal(row, 'artistJa', 'artist', '出演者', '出演者名', '団体名', 'アーティスト');
  const artistJa = rawArtistJa.replace(/\r?\n\s*/g, ' ').trim();
  const rawArtistEn = getVal(row, 'artistEn', 'artist_en', '英語出演者');
  const artistEn = rawArtistEn ? rawArtistEn.replace(/\r?\n\s*/g, ' ').trim() : artistJa;

  if (!titleJa && !artistJa && !getVal(row, 'startTime', '開始時刻')) {
    return null;
  }

  const rawDay = getVal(row, 'day', '日程', '日');
  let day = 1;
  if (rawDay.includes('2') || rawDay.includes('25') || rawDay.includes('日')) {
    day = 2;
  }

  const startTime = getVal(row, 'startTime', 'start', '開始時刻', '開始時間', '開始') || '10:00';
  const endTime = getVal(row, 'endTime', 'end', '終了時刻', '終了時間', '終了');

  // ステージ識別
  const explicitStage = getVal(row, 'stageId', 'stage', 'エリア', 'ステージ', 'ステージ名').toLowerCase();
  let stageId: PerformanceArea = defaultStageId;
  let stageNameJa = defaultStageNameJa;
  let stageNameEn = defaultStageNameEn;

  if (explicitStage.includes('outdoor') || explicitStage.includes('アウトドア') || explicitStage.includes('culture') || explicitStage.includes('風')) {
    stageId = 'outdoor';
    stageNameJa = 'アウトドアパフォーマンス';
    stageNameEn = 'Outdoor Performance';
  } else if (explicitStage.includes('stage') || explicitStage.includes('ステージ') || explicitStage.includes('main') || explicitStage.includes('雅')) {
    stageId = 'stage';
    stageNameJa = 'ステージ';
    stageNameEn = 'Main Stage';
  }

  const descJa = getVal(row, 'descJa', 'desc', '紹介文', '内容', '説明', '詳細');
  const descEn = getVal(row, 'descEn', 'desc_en', '英語紹介文') || descJa;

  const categoryJa = getVal(row, 'categoryJa', 'category', 'ジャンル', 'カテゴリー') || 'パフォーマンス';
  const categoryEn = getVal(row, 'categoryEn', 'category_en', '英語ジャンル') || 'Performance';
  const rawImageUrl = getVal(row, 'imageUrl', 'image', '写真URL', '画像URL', '写真', '画像', 'ロゴ', 'logo');
  const imageUrl = rawImageUrl ? formatImageUrl(rawImageUrl) : undefined;
  const rawLink = getVal(row, 'link', 'Link', 'リンク', 'url', 'URL', 'インスタ', 'instagram', 'Instagram');
  const link = rawLink ? formatInstagramUrl(rawLink) : undefined;
  const id = getVal(row, 'id', 'ID') || `perf-${stageId}-${index + 1}`;

  return {
    id,
    day,
    stageId,
    stageNameJa,
    stageNameEn,
    startTime,
    endTime,
    titleJa,
    titleEn,
    artistJa,
    artistEn,
    descJa,
    descEn,
    imageUrl,
    categoryJa,
    categoryEn,
    link
  };
}

/**
 * ステージ & アウトドアパフォーマンスのデータロード
 */
export async function loadStagesData(): Promise<{ data: StagePerformance[]; isFromRemote: boolean; error?: string }> {
  const config = getSyncConfig();

  interface StageTarget {
    url: string;
    stageId: PerformanceArea;
    nameJa: string;
    nameEn: string;
  }

  const allTargets: StageTarget[] = [
    { url: convertToCsvExportUrl(config.stageCsvUrl), stageId: 'stage', nameJa: 'ステージ', nameEn: 'Main Stage' },
    { url: convertToCsvExportUrl(config.outdoorCsvUrl), stageId: 'outdoor', nameJa: 'アウトドアパフォーマンス', nameEn: 'Outdoor Performance' },
    { url: convertToCsvExportUrl(config.stagesCsvUrl), stageId: 'stage', nameJa: 'ステージ', nameEn: 'Stage' }
  ];
  const targets = allTargets.filter(t => Boolean(t.url));

  if (targets.length > 0) {
    try {
      const allStages: StagePerformance[] = [];
      let globalIndex = 0;

      for (const target of targets) {
        try {
          const rawRows = await fetchAndParseCsv<Record<string, unknown>>(target.url);
          rawRows.forEach((row) => {
            const parsed = parsePerformanceRow(row, globalIndex++, target.stageId, target.nameJa, target.nameEn);
            if (parsed) {
              allStages.push(parsed);
            }
          });
        } catch (targetErr) {
          console.warn(`Failed to fetch performances for ${target.stageId}:`, targetErr);
        }
      }

      if (allStages.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CACHED_STAGES, JSON.stringify(allStages));
        return { data: allStages, isFromRemote: true };
      }
    } catch (err: unknown) {
      console.warn('Failed to fetch stages from sheets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { data: initialStages, isFromRemote: false, error: errorMessage };
    }
  }

  const cached = localStorage.getItem(STORAGE_KEYS.CACHED_STAGES);
  if (cached) {
    try {
      return { data: JSON.parse(cached), isFromRemote: false };
    } catch {
      // ignore
    }
  }

  return { data: initialStages, isFromRemote: false };
}

/**
 * 施設（Facilities）データのロード
 */
export async function loadFacilitiesData(): Promise<{ data: Facility[]; isFromRemote: boolean }> {
  const config = getSyncConfig();
  const url = convertToCsvExportUrl(config.facilitiesCsvUrl);

  if (url) {
    try {
      const rawRows = await fetchAndParseCsv<Record<string, unknown>>(url);
      const facilities: Facility[] = rawRows
        .filter((row) => row.nameJa || row.nameEn || row['施設名'])
        .map((row, index) => ({
          id: String(row.id || `fac-${index + 1}`),
          type: (String(row.type || 'info').toLowerCase()) as Facility['type'],
          nameJa: String(row.nameJa || row.name || row['施設名'] || ''),
          nameEn: String(row.nameEn || row.nameJa || row['施設名'] || ''),
          descJa: String(row.descJa || row.desc || row['説明'] || ''),
          descEn: String(row.descEn || row.descJa || ''),
          mapX: Number(row.mapX || row.X || row.x) || 50,
          mapY: Number(row.mapY || row.Y || row.y) || 50
        }));

      if (facilities.length > 0) {
        return { data: facilities, isFromRemote: true };
      }
    } catch (err) {
      console.warn('Failed to fetch facilities from CSV, using fallback:', err);
    }
  }

  return { data: initialFacilities, isFromRemote: false };
}

/**
 * 最後に同期した日時を取得
 */
export function getLastSyncTime(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
}
