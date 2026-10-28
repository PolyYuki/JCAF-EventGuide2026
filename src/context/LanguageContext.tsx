import React, { createContext, useContext, useState } from 'react';
import type { Language } from '../types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, { ja: string; en: string }> = {
  // Navigation
  'nav.map': { ja: '会場マップ', en: 'Map' },
  'nav.stalls': { ja: '出店者一覧', en: 'Stalls' },
  'nav.stage': { ja: 'ステージ', en: 'Stage' },
  'nav.info': { ja: '来場案内', en: 'Info' },

  // Header
  'header.badge': { ja: 'デジタルイベントガイド', en: 'Digital Event Guide' },
  'header.bookmark': { ja: 'お気に入り', en: 'Bookmarks' },
  'header.data_sync': { ja: 'データ連携', en: 'Data Sync' },

  // Map
  'map.title': { ja: 'インタラクティブ会場マップ', en: 'Interactive Venue Map' },
  'map.subtitle': { ja: 'ピンをタップするとブース詳細が表示されます', en: 'Tap pins to view booth details' },
  'map.reset': { ja: '位置をリセット', en: 'Reset View' },
  'map.zoom_in': { ja: '拡大', en: 'Zoom In' },
  'map.zoom_out': { ja: '縮小', en: 'Zoom Out' },
  'map.filter_all': { ja: 'すべて表示', en: 'All' },
  'map.filter_market': { ja: 'マーケット', en: 'Market' },
  'map.filter_sponsor': { ja: 'スポンサー', en: 'Sponsors' },
  'map.filter_paid_workshop': { ja: '有料ワークショップ', en: 'Paid Workshop' },
  'map.filter_free_workshop': { ja: '無料ワークショップ', en: 'Free Workshop' },
  'map.filter_food': { ja: 'フード', en: 'Food & Drinks' },
  'map.filter_facility': { ja: '施設（トイレ・本部等）', en: 'Facilities' },
  'map.legend_main_stage': { ja: 'ステージ', en: 'Main Stage' },
  'map.legend_culture_stage': { ja: 'アウトドアパフォーマンス', en: 'Outdoor Performance' },
  'map.select_prompt': { ja: 'ピンをタップして詳細を確認', en: 'Tap any pin on the map to inspect' },
  'map.view_in_list': { ja: '一覧で見る', en: 'View in List' },

  // Stalls & Booths
  'stalls.title': { ja: '出店・ブース一覧', en: 'Booths & Stalls' },
  'stalls.search_placeholder': { ja: 'ブース名、キーワード、内容、タグで検索...', en: 'Search by booth name, craft, food, or keyword...' },
  'stalls.category_all': { ja: 'すべて', en: 'All' },
  'stalls.category_market': { ja: 'マーケット', en: 'Market' },
  'stalls.category_sponsor': { ja: 'スポンサー', en: 'Sponsors' },
  'stalls.category_paid_workshop': { ja: '有料ワークショップ', en: 'Paid Workshop' },
  'stalls.category_free_workshop': { ja: '無料ワークショップ', en: 'Free Workshop' },
  'stalls.category_food': { ja: 'フード', en: 'Food' },
  'stalls.category_craft': { ja: '伝統工芸・器', en: 'Traditional Crafts' },
  'stalls.category_workshop': { ja: 'ワークショップ', en: 'Workshops' },
  'stalls.category_goods': { ja: '物販・公式', en: 'Goods' },
  'stalls.view_map': { ja: '地図で位置を確認', en: 'Show on Map' },
  'stalls.details': { ja: '詳細を見る', en: 'Details' },
  'stalls.no_results': { ja: '条件に一致する項目が見つかりませんでした', en: 'No items match your search.' },
  'stalls.clear_search': { ja: '検索条件をクリア', en: 'Clear filters' },
  'stalls.favorites_only': { ja: 'お気に入りのみ表示', en: 'Saved Only' },
  'stalls.count_prefix': { ja: '全', en: 'Total ' },
  'stalls.count_suffix': { ja: '件', en: ' items' },

  // Stage & Outdoor Performance
  'stage.title': { ja: 'タイムテーブル', en: 'Timetable' },
  'stage.day1': { ja: '11月8日 (日)', en: 'Sun, Nov 8' },
  'stage.day2': { ja: 'その他・別日程', en: 'Day 2' },
  'stage.all_stages': { ja: 'すべて', en: 'All Programs' },
  'stage.stage': { ja: 'ステージ', en: 'Stage' },
  'stage.outdoor': { ja: 'アウトドアパフォーマンス', en: 'Outdoor Performance' },
  'stage.main_stage': { ja: 'ステージ', en: 'Stage' },
  'stage.culture_stage': { ja: 'アウトドアパフォーマンス', en: 'Outdoor Performance' },
  'stage.now': { ja: '現在開催中', en: 'NOW PLAYING' },
  'stage.next': { ja: '次回プログラム', en: 'UP NEXT' },
  'stage.upcoming': { ja: '開催予定', en: 'UPCOMING' },
  'stage.ended': { ja: '終了', en: 'ENDED' },

  // Info
  'info.title': { ja: '来場者ガイド & 施設情報', en: 'Visitor Guide & Info' },
  'info.facilities_title': { ja: '会場施設案内', en: 'Venue Facilities' },
  'info.access_title': { ja: '交通アクセス & 会場情報', en: 'Access & Venue Details' },
  'info.rules_title': { ja: 'ご来場のマナーとお願い', en: 'Festival Guidelines & Etiquette' },
  'info.faq_title': { ja: 'よくあるご質問 (FAQ)', en: 'Frequently Asked Questions' },
  'info.about_title': { ja: '主催者について (JCAF)', en: 'About JCAF' },
  'info.open_google_maps': { ja: 'Google マップで経路を開く', en: 'Open in Google Maps' },
  'info.emergency_title': { ja: '緊急時のご案内', en: 'Emergency Contact & First Aid' },

  // Common
  'common.close': { ja: '閉じる', en: 'Close' },
  'common.share': { ja: 'シェアする', en: 'Share' },
  'common.shared_success': { ja: 'URLをコピーしました！', en: 'URL copied to clipboard!' },
  'common.loading': { ja: 'データを読み込み中...', en: 'Loading event data...' },
  'common.offline_notice': { ja: 'オフラインまたはキャッシュデータで表示中', en: 'Showing cached festival data' }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ja',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('jcaf_language');
    if (saved === 'ja' || saved === 'en') return saved;
    // ブラウザの言語設定を確認
    return navigator.language.startsWith('ja') ? 'ja' : 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('jcaf_language', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'ja' ? 'en' : 'ja');
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.ja || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
