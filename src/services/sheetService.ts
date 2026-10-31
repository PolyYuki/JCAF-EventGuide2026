import Papa from 'papaparse';
import type { Stall, StagePerformance, Facility, StallCategory, PerformanceArea } from '../types';
import { getBoothCoordinates } from '../data/boothCoordinates';

const STORAGE_KEYS = {
  // 個別7シートURL
  MARKET_CSV_URL: 'jcaf_market_csv_url',
  SPONSOR_CSV_URL: 'jcaf_sponsor_csv_url',
  PAID_WORKSHOP_CSV_URL: 'jcaf_paid_workshop_csv_url',
  FREE_WORKSHOP_CSV_URL: 'jcaf_free_workshop_csv_url',
  FOOD_CSV_URL: 'jcaf_food_csv_url',
  KIDS_CSV_URL: 'jcaf_kids_csv_url',
  ART_CSV_URL: 'jcaf_art_csv_url',
  STAGE_CSV_URL: 'jcaf_stage_csv_url',
  OUTDOOR_CSV_URL: 'jcaf_outdoor_csv_url',

  // 従来の後方互換URL
  STALLS_CSV_URL: 'jcaf_stalls_csv_url',
  STAGES_CSV_URL: 'jcaf_stages_csv_url',
  FACILITIES_CSV_URL: 'jcaf_facilities_csv_url',

  // キャッシュ
  CACHED_STALLS: 'jcaf_cached_stalls_v6',
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
  kidsCsvUrl: string;
  artCsvUrl: string;
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
  kidsCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=476561829&single=true&output=csv',
  artCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=2109606652&single=true&output=csv',
  stageCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=795207739&single=true&output=csv',
  outdoorCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=536106092&single=true&output=csv',
  stallsCsvUrl: '',
  stagesCsvUrl: '',
  facilitiesCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkci_DzDcJW3ycMaGM4CExIXJXd3jeKfLwMgDamVTEe39hfhVcIATkTHHTdN8MekWJoTo9PQl8PyCI/pub?gid=1192712035&single=true&output=csv'
};

export function getSyncConfig(): SyncConfig {
  return {
    marketCsvUrl: (localStorage.getItem(STORAGE_KEYS.MARKET_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.marketCsvUrl,
    sponsorCsvUrl: (localStorage.getItem(STORAGE_KEYS.SPONSOR_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.sponsorCsvUrl,
    paidWorkshopCsvUrl: (localStorage.getItem(STORAGE_KEYS.PAID_WORKSHOP_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.paidWorkshopCsvUrl,
    freeWorkshopCsvUrl: (localStorage.getItem(STORAGE_KEYS.FREE_WORKSHOP_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.freeWorkshopCsvUrl,
    foodCsvUrl: (localStorage.getItem(STORAGE_KEYS.FOOD_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.foodCsvUrl,
    kidsCsvUrl: (localStorage.getItem(STORAGE_KEYS.KIDS_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.kidsCsvUrl,
    artCsvUrl: (localStorage.getItem(STORAGE_KEYS.ART_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.artCsvUrl,
    stageCsvUrl: (localStorage.getItem(STORAGE_KEYS.STAGE_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.stageCsvUrl,
    outdoorCsvUrl: (localStorage.getItem(STORAGE_KEYS.OUTDOOR_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.outdoorCsvUrl,

    stallsCsvUrl: (localStorage.getItem(STORAGE_KEYS.STALLS_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.stallsCsvUrl,
    stagesCsvUrl: (localStorage.getItem(STORAGE_KEYS.STAGES_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.stagesCsvUrl,
    facilitiesCsvUrl: (localStorage.getItem(STORAGE_KEYS.FACILITIES_CSV_URL) || '').trim() || DEFAULT_SYNC_CONFIG.facilitiesCsvUrl
  };
}

export function saveSyncConfig(config: SyncConfig): void {
  localStorage.setItem(STORAGE_KEYS.MARKET_CSV_URL, config.marketCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.SPONSOR_CSV_URL, config.sponsorCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.PAID_WORKSHOP_CSV_URL, config.paidWorkshopCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.FREE_WORKSHOP_CSV_URL, config.freeWorkshopCsvUrl.trim());
  localStorage.setItem(STORAGE_KEYS.FOOD_CSV_URL, (config.foodCsvUrl || '').trim());
  localStorage.setItem(STORAGE_KEYS.KIDS_CSV_URL, (config.kidsCsvUrl || '').trim());
  localStorage.setItem(STORAGE_KEYS.ART_CSV_URL, (config.artCsvUrl || '').trim());
  localStorage.setItem(STORAGE_KEYS.STAGE_CSV_URL, (config.stageCsvUrl || '').trim());
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
    cache: 'no-store',
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
 * スポンサー種別を「Gold」「Silver」「Bronze」「In-Kind」「Supporter」に正規化
 */
export function normalizeSponsorTier(rawTier?: string): string | undefined {
  if (!rawTier) return undefined;
  const trimmed = rawTier.trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  if (lower.includes('gold')) return 'Gold';
  if (lower.includes('silver')) return 'Silver';
  if (lower.includes('bronze')) return 'Bronze';
  if (lower.includes('in-kind') || lower.includes('kind')) return 'In-Kind';
  if (lower.includes('supporter')) return 'Supporter';
  return trimmed.replace(/\s*sponsor/gi, '').trim() || trimmed;
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
  const rawBoothNumber = getVal(row, 'boothNumber', 'booth', 'ブース番号', 'ブース', 'No');
  // スポンサーシートでブース番号がないものは出店しないため空文字を維持
  const boothNumber = rawBoothNumber || (defaultCategory === 'sponsor' ? '' : `B-${index + 1}`);
  const nameJa = getVal(row, 'nameJa', 'name', '出店名', '店名', 'ブース名', '名前', 'タイトル');
  const nameEn = getVal(row, 'nameEn', 'name_en', '英語名') || nameJa;

  if (!nameJa && !rawBoothNumber) {
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
    } else if (explicitCategory.includes('kid') || explicitCategory.includes('キッズ') || explicitCategory.includes('子ども') || explicitCategory.includes('子供')) {
      category = 'kids';
    } else if (explicitCategory.includes('art') || explicitCategory.includes('アート') || explicitCategory.includes('展示') || explicitCategory.includes('exhibition')) {
      category = 'art';
    }
  }

  const categoryJa = getVal(row, 'categoryJa', 'カテゴリ名') || categoryLabelJa;
  const categoryEn = getVal(row, 'categoryEn', '英語カテゴリ名') || categoryLabelEn;

  const shortDescJa = getVal(row, 'shortDescJa', 'shortDesc', 'キャッチコピー', '概要', '短文紹介');
  const shortDescEn = getVal(row, 'shortDescEn', 'shortDesc_en', '英語キャッチコピー') || shortDescJa;

  const descriptionJa = getVal(row, 'descriptionJa', 'description', 'descJa', '紹介文', '説明', '詳細');
  const descriptionEn = getVal(row, 'descriptionEn', 'description_en', 'descEn', '英語紹介文') || descriptionJa;

  const boothCoord = getBoothCoordinates(boothNumber);
  const rawMapX = Number(getVal(row, 'mapX', 'map_x', 'X', 'x', 'Ｘ', 'マップX', 'マップＸ', 'X座標', 'Ｘ座標'));
  const rawMapY = Number(getVal(row, 'mapY', 'map_y', 'Y', 'y', 'Ｙ', 'マップY', 'マップＹ', 'Y座標', 'Ｙ座標'));
  const mapX = !isNaN(rawMapX) && rawMapX > 0 ? rawMapX : (boothCoord ? boothCoord.x : 50);
  const mapY = !isNaN(rawMapY) && rawMapY > 0 ? rawMapY : (boothCoord ? boothCoord.y : 50);

  const rawTagsJa = getVal(row, 'tagsJa', 'tags', 'タグ', 'キーワード');
  const rawTagsEn = getVal(row, 'tagsEn', 'tags_en', '英語タグ');

  const tagsJa = rawTagsJa ? rawTagsJa.split(/[,、/]/).map(t => t.trim()).filter(Boolean) : [];
  const tagsEn = rawTagsEn ? rawTagsEn.split(/[,、/]/).map(t => t.trim()).filter(Boolean) : tagsJa;

  const rawLogoUrl =
    getVal(
      row,
      'ロゴ', 'ロゴURL', 'logo', 'logoUrl', 'logo_url', 'Logo', 'LOGO',
      'ロゴデータ', 'ロゴデータのリンク', 'ロゴのリンク', 'ロゴリンク', 'ロゴデータリンク',
      '出店者ロゴ', '店舗ロゴ', 'Logo Link', 'Logo URL', 'Logo Image', 'Icon', 'icon', 'アイコン'
    ) || getValContaining(row, 'ロゴ', 'logo', 'icon', 'アイコン');

  const rawPhotoUrl =
    getVal(
      row,
      '写真', '写真URL', '写真のリンク', '写真リンク', '写真データ', '写真データのリンク',
      '画像', '画像URL', '画像のリンク', '画像リンク',
      'photoUrl', 'photo', 'Photo', 'PHOTO', 'imageUrl', 'image', 'Image', 'IMAGE',
      '商品写真', '作品写真', 'ブース写真'
    ) || getValContaining(row, '写真', 'photo', '画像', 'image');

  const imageUrl = rawLogoUrl ? formatImageUrl(rawLogoUrl) : undefined;
  const photoUrl = rawPhotoUrl ? formatImageUrl(rawPhotoUrl) : undefined;

  const priceRange = getVal(row, 'priceRange', 'price', '価格帯', '価格', '料金') || undefined;
  const rawSponsorTier = getVal(row, 'sponsorTier', 'スポンサー種別', '種別', '協賛種別') || undefined;
  const sponsorTier = normalizeSponsorTier(rawSponsorTier);
  const highlightJa = getVal(row, 'highlightJa', 'highlight', '見どころ', 'こだわり', 'おすすめ') || sponsorTier || undefined;
  const highlightEn = getVal(row, 'highlightEn', 'highlight_en', '英語見どころ') || highlightJa;

  const rawInstagram = getVal(
    row,
    'instagram', 'インスタ', 'Instagram', 'インスタURL', 'Instagram URL',
    'instagramUrl', 'instagram_url', 'インスタグラム', 'SNS', 'SNS URL', 'sns',
    'IG', 'ig', 'Instagramアカウント', 'インスタアカウント'
  );
  let instagram = rawInstagram ? formatInstagramUrl(rawInstagram) : undefined;

  const rawWebsite = getVal(
    row,
    'website', 'hp', 'HP', 'ウェブサイト', '公式サイト', 'Webサイト',
    'url', 'URL', 'ホームページ', 'websiteUrl', 'website_url'
  );
  let website = rawWebsite ? formatWebsiteUrl(rawWebsite) : undefined;

  // Link列があれば判定してinstagramまたはwebsiteに割り当て
  const rawLink = getVal(row, 'Link', 'link', 'リンク');
  if (rawLink && !instagram && !website) {
    if (rawLink.includes('instagram.com') || rawLink.startsWith('@') || rawLink.startsWith('＠')) {
      instagram = formatInstagramUrl(rawLink);
    } else {
      website = formatWebsiteUrl(rawLink);
    }
  }

  const rawLocationJa =
    getVal(
      row,
      'locationJa', 'location', '出店場所', '場所', 'エリア', '会場',
      '出店エリア', 'ブースエリア', 'ブース場所', 'area', 'Area', 'location_ja'
    ) || getValContaining(row, '出店場所', '場所', 'エリア', '会場', 'location', 'area');
  const rawLocationEn = getVal(row, 'locationEn', 'location_en', '英語出店場所', '英語場所');

  const locationJa = rawLocationJa || (category === 'market' ? undefined : (boothCoord ? boothCoord.locationJa : undefined));
  const locationEn = rawLocationEn || rawLocationJa || (category === 'market' ? undefined : (boothCoord ? boothCoord.locationEn : locationJa));

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
    photoUrl,
    priceRange,
    highlightJa,
    highlightEn,
    instagram,
    website,
    locationJa,
    locationEn,
    sponsorTier
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
    { url: convertToCsvExportUrl(config.sponsorCsvUrl), category: 'sponsor', labelJa: 'スポンサー', labelEn: 'Sponsors' },
    { url: convertToCsvExportUrl(config.paidWorkshopCsvUrl), category: 'paid_workshop', labelJa: '有料ワークショップ', labelEn: 'Paid Workshop' },
    { url: convertToCsvExportUrl(config.freeWorkshopCsvUrl), category: 'free_workshop', labelJa: '無料ワークショップ', labelEn: 'Free Workshop' },
    { url: convertToCsvExportUrl(config.foodCsvUrl), category: 'food', labelJa: 'フード', labelEn: 'Food' },
    { url: convertToCsvExportUrl(config.kidsCsvUrl), category: 'kids', labelJa: 'キッズアクティビティ', labelEn: 'Kids Activity' },
    { url: convertToCsvExportUrl(config.artCsvUrl), category: 'art', labelJa: 'アート展示', labelEn: 'Art Exhibition' },
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
          const parsed = JSON.parse(cached);
          // キャッシュにkidsが含まれているかチェック
          if (Array.isArray(parsed) && parsed.some(s => s.category === 'kids')) {
            return { data: parsed, isFromRemote: false, error: errorMessage };
          }
        } catch {
          // ignore
        }
      }
      return { data: [], isFromRemote: false, error: errorMessage };
    }
  }

  // URL未指定の場合はキャッシュまたは空配列
  const cached = localStorage.getItem(STORAGE_KEYS.CACHED_STALLS);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.some(s => s.category === 'kids')) {
        return { data: parsed, isFromRemote: false };
      }
    } catch {
      // ignore
    }
  }

  return { data: [], isFromRemote: false };
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

  const rawLogoUrl =
    getVal(
      row,
      'logoUrl', 'logo', 'ロゴ', 'ロゴURL', 'ロゴデータ', 'ロゴデータのリンク',
      'ロゴのリンク', 'ロゴリンク', 'Logo', 'LOGO', '出演者ロゴ', '団体ロゴ'
    ) || getValContaining(row, 'ロゴ', 'logo');

  const rawPhotoUrl =
    getVal(
      row,
      'photoUrl', 'photo', '写真', '写真URL', '写真のリンク', '写真リンク',
      '写真データ', '写真データのリンク', '画像', '画像URL', '画像のリンク', '画像リンク',
      'imageUrl', 'image', 'Photo', 'PHOTO', 'Image', 'IMAGE', '演目写真', 'ステージ写真'
    ) || getValContaining(row, '写真', 'photo', '画像', 'image');

  const imageUrl = rawLogoUrl ? formatImageUrl(rawLogoUrl) : undefined;
  const photoUrl = rawPhotoUrl ? formatImageUrl(rawPhotoUrl) : undefined;

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
    photoUrl,
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
      return { data: [], isFromRemote: false, error: errorMessage };
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

  return { data: [], isFromRemote: false };
}

/**
 * 施設名の日本語→英語自動変換フォールバック（スプレッドシートに英語列がない場合用）
 */
function translateFacilityNameEn(nameJa: string, type: Facility['type']): string {
  const n = nameJa.trim();
  if (!n) return '';

  if (n.includes('正門') || n.includes('メインエントランス')) {
    return n.includes('Hoddle') ? 'Main Entrance Gate (Hoddle St)' : 'Main Entrance Gate';
  }
  if (n.includes('裏門') || n.includes('バックエントランス')) {
    return n.includes('Eddy') ? 'Back Entrance (Eddy Ct)' : 'Back Entrance';
  }
  if (n.includes('インフォメーション') && n.includes('ドリンク')) {
    return 'Information & Drink Sale';
  }
  if (n.includes('総合受付') || n === '受付') {
    return 'Reception';
  }
  if (n.includes('救護') || n.includes('AED') || n.includes('ファーストエイド')) {
    return 'First Aid & AED Station';
  }
  if (n.includes('ベビーカー')) {
    return 'Pram / Stroller Parking';
  }
  if (n.includes('授乳')) {
    return 'Nursing & Baby Care Room';
  }
  if (n.includes('トイレ') || n.includes('お手洗い')) {
    if (n.includes('Main Hall') || n.includes('メインホール')) return 'Restroom (Main Hall)';
    if (n.includes('Kitchen') || n.includes('キッチン')) return 'Restroom (Beside Kitchen)';
    if (n.includes('中庭') || n.includes('Courtyard') || n.includes('Djerring')) return 'Restroom (Courtyard)';
    return 'Restroom';
  }

  // 置換による英語化
  let translated = n
    .replace(/（/g, ' (')
    .replace(/）/g, ')')
    .replace(/正門メインエントランス/g, 'Main Entrance Gate')
    .replace(/メインエントランス/g, 'Main Entrance')
    .replace(/裏門バックエントランス/g, 'Back Entrance')
    .replace(/バックエントランス/g, 'Back Entrance')
    .replace(/総合インフォメーション/g, 'Information')
    .replace(/インフォメーション/g, 'Information')
    .replace(/ドリンク販売/g, 'Drink Sale')
    .replace(/総合受付/g, 'Reception')
    .replace(/受付/g, 'Reception')
    .replace(/救護所・AED/g, 'First Aid & AED')
    .replace(/救護所/g, 'First Aid Station')
    .replace(/水洗トイレ|トイレ|お手洗い/g, 'Restroom')
    .replace(/ベビーカー置き場|ベビーカー置場/g, 'Pram Parking')
    .replace(/授乳室/g, 'Nursing Room')
    .replace(/ゴミ箱|ごみ箱/g, 'Waste Bins')
    .replace(/メインホール/g, 'Main Hall')
    .replace(/タウンホール/g, 'Town Hall')
    .replace(/中庭/g, 'Courtyard')
    .replace(/公園/g, 'Park')
    .replace(/東側|西側|南側|北側/g, '')
    .replace(/横/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/[ぁ-んァ-ヶ一-龠]/.test(translated)) {
    return translated;
  }

  switch (type) {
    case 'entrance':
      return 'Entrance Gate';
    case 'toilet':
      return 'Restroom';
    case 'firstaid':
      return 'First Aid & AED Station';
    case 'nursing':
      return 'Nursing Room';
    case 'trash':
      return 'Waste & Recycling Bins';
    case 'food_court':
      return 'Food & Dining Area';
    default:
      return 'Information';
  }
}

/**
 * 施設説明の日本語→英語自動変換フォールバック（スプレッドシートに英語列がない場合用）
 */
function translateFacilityDescEn(descJa: string, _nameJa: string, type: Facility['type']): string {
  const d = descJa.trim();
  if (!d) return '';

  if (d.includes('正面入口') || d.includes('入場受付')) {
    return 'Main entrance gate & visitor entry';
  }
  if (d.includes('通用口') || d.includes('裏口') || d.includes('西側通路')) {
    return 'Back access & entrance';
  }
  if (d.includes('ラッキードロー') || d.includes('ドリンク販売')) {
    return 'Event info, beverage sales & lucky draw';
  }
  if (d.includes('受付カウンター') || d.includes('関係者')) {
    return 'Reception desk';
  }
  if (d.includes('体調不良') || d.includes('Town Hall Reserve')) {
    return 'First aid station located at Town Hall Reserve.';
  }
  if (d.includes('メインホール') && d.includes('トイレ')) {
    return 'Restroom beside Main Hall';
  }
  if (d.includes('タウンホール') && d.includes('トイレ')) {
    return 'Restroom in Town Hall';
  }
  if ((d.includes('中庭') || d.includes('屋外')) && d.includes('トイレ')) {
    return 'Restroom at Courtyard';
  }
  if (d.includes('ベビーカー')) {
    return 'Designated stroller / pram parking area';
  }

  let translated = d
    .replace(/正面入口/g, 'Main entrance')
    .replace(/総合案内/g, 'general info')
    .replace(/入場受付/g, 'visitor entry')
    .replace(/案内所/g, 'Information desk')
    .replace(/ドリンク販売/g, 'beverage sales')
    .replace(/ラッキードロー抽選|ラッキードロー/g, 'lucky draw')
    .replace(/関係者・来場者受付カウンター|受付カウンター/g, 'Reception desk')
    .replace(/メインホール横/g, 'Beside Main Hall')
    .replace(/メインホール/g, 'Main Hall')
    .replace(/タウンホール内|タウンホール/g, 'Town Hall')
    .replace(/屋外中庭エリア|中庭エリア|中庭/g, 'Courtyard')
    .replace(/公園/g, 'Park')
    .replace(/水洗トイレ|トイレ|お手洗い/g, 'Restroom')
    .replace(/東側|西側|南側|北側/g, '')
    .replace(/・/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/[ぁ-んァ-ヶ一-龠]/.test(translated)) {
    return translated;
  }

  switch (type) {
    case 'entrance':
      return 'Venue entrance & access point';
    case 'toilet':
      return 'Restroom facility';
    case 'firstaid':
      return 'First aid & emergency support station';
    case 'nursing':
      return 'Nursing & baby care space';
    case 'trash':
      return 'Waste & recycling station';
    default:
      return 'Festival facility & information';
  }
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
        .map((row, index) => {
          const nameJa = getVal(row, 'nameJa', 'name', '施設名', '名前', '名称', 'タイトル');
          const explicitNameEn = getVal(
            row,
            'nameEn', 'name_en', '英語名', '英語施設名', '施設名（英語）', '施設名(英語)',
            '名称（英語）', '名前（英語）', 'English Name', 'Name (EN)', 'Name EN'
          );
          if (!nameJa && !explicitNameEn) return null;

          const rawType = getVal(row, 'type', '種別', '種類', 'カテゴリ', 'アイコン').toLowerCase();
          let type: Facility['type'] = 'info';
          if (rawType.includes('entrance') || rawType.includes('入口') || rawType.includes('エントランス') || rawType.includes('門') || rawType.includes('gate')) {
            type = 'entrance';
          } else if (rawType.includes('toilet') || rawType.includes('wc') || rawType.includes('restroom') || rawType.includes('トイレ') || rawType.includes('お手洗い')) {
            type = 'toilet';
          } else if (rawType.includes('aid') || rawType.includes('救護') || rawType.includes('aed') || rawType.includes('firstaid') || rawType.includes('医務')) {
            type = 'firstaid';
          } else if (rawType.includes('nursing') || rawType.includes('授乳') || rawType.includes('おむつ') || rawType.includes('baby') || rawType.includes('キッズ')) {
            type = 'nursing';
          } else if (rawType.includes('trash') || rawType.includes('ゴミ') || rawType.includes('ごみ')) {
            type = 'trash';
          } else if (rawType.includes('food') || rawType.includes('飲食') || rawType.includes('休憩')) {
            type = 'food_court';
          } else if (rawType.includes('info') || rawType.includes('案内') || rawType.includes('受付') || rawType.includes('本部')) {
            type = 'info';
          }

          const descJa = getVal(row, 'descJa', 'desc', 'descriptionJa', 'description', '説明', '詳細', '案内', '場所');
          const explicitDescEn = getVal(
            row,
            'descEn', 'desc_en', 'descriptionEn', 'description_en', '英語説明', '英語詳細',
            '英語案内', '説明（英語）', '説明(英語)', '詳細（英語）', '案内（英語）',
            '場所（英語）', 'English Description', 'Description (EN)', 'Description EN'
          );

          const nameEn = explicitNameEn || translateFacilityNameEn(nameJa, type);
          const descEn = explicitDescEn || translateFacilityDescEn(descJa, nameJa, type);

          const rawX = Number(getVal(row, 'mapX', 'map_x', 'X', 'x', 'Ｘ', 'マップX', 'マップＸ', 'X座標', 'Ｘ座標'));
          const rawY = Number(getVal(row, 'mapY', 'map_y', 'Y', 'y', 'Ｙ', 'マップY', 'マップＹ', 'Y座標', 'Ｙ座標'));

          return {
            id: getVal(row, 'id', 'ID') || `fac-${index + 1}`,
            type,
            nameJa: nameJa || nameEn,
            nameEn: nameEn || nameJa,
            descJa,
            descEn,
            mapX: !isNaN(rawX) && rawX > 0 ? rawX : 50,
            mapY: !isNaN(rawY) && rawY > 0 ? rawY : 50
          };
        })
        .filter((f): f is Facility => f !== null);

      if (facilities.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CACHED_FACILITIES, JSON.stringify(facilities));
        return { data: facilities, isFromRemote: true };
      }
    } catch (err) {
      console.warn('Failed to fetch facilities from CSV, using fallback:', err);
    }
  }

  const cached = localStorage.getItem(STORAGE_KEYS.CACHED_FACILITIES);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { data: parsed, isFromRemote: false };
      }
    } catch {
      // ignore
    }
  }

  return { data: [], isFromRemote: false };
}

/**
 * 最後に同期した日時を取得
 */
export function getLastSyncTime(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
}
