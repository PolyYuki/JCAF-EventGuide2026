import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import type { EventInfo } from '../types';
import { Bookmark, Settings, Globe, Volume2 } from 'lucide-react';

/**
 * ローカル環境（localhost / 開発モード）または管理者モードであるかを判定
 */
function isLocalOrAdmin(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Vite開発環境
  if (import.meta.env.DEV) return true;

  // 2. ローカル環境 (localhost, 127.0.0.1, ローカルIP等)
  const hostname = window.location.hostname;
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  ) {
    return true;
  }

  // 3. 管理者アクセス用のクエリパラメータ (例: ?admin=true または ?sync=true)
  // 本番公開後でも、運営スタッフが同期したい時にアクセス可能にする
  const searchParams = new URLSearchParams(window.location.search);
  if (
    searchParams.get('admin') === 'true' ||
    searchParams.get('sync') === 'true' ||
    searchParams.get('settings') === 'true'
  ) {
    return true;
  }

  return false;
}

interface HeaderProps {
  eventInfo: EventInfo;
  onOpenFavorites: () => void;
  onOpenSettings: () => void;
  onSelectTab: (tab: 'map' | 'stalls' | 'stage' | 'info') => void;
}

export const Header: React.FC<HeaderProps> = ({
  eventInfo,
  onOpenFavorites,
  onOpenSettings,
  onSelectTab
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const { favoriteStallIds } = useFavorites();

  const isJa = lang === 'ja';
  const showAdminSettings = useMemo(() => isLocalOrAdmin(), []);

  return (
    <>
      <header className="app-header">
        <div
          className="header-brand"
          onClick={() => onSelectTab('map')}
          role="button"
          tabIndex={0}
          title="Top / Map"
        >
          <div className="header-logos-group">
            <div className="header-logo-wrapper" title="JCAF">
              {eventInfo.logoUrl ? (
                <img
                  src={eventInfo.logoUrl}
                  alt="JCAF Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
                  <rect width="40" height="40" rx="8" stroke="#d4af37" strokeWidth="1.5" />
                  <path
                    d="M12 25 C14 15, 26 15, 28 25"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="14" r="3.5" fill="#ffffff" />
                </svg>
              )}
            </div>

            <div className="header-sublogo-wrapper" title="Australia - Japan 50 years of Friendship and Cooperation">
              <img
                src="/australia-japan-50th.jpg"
                alt="Australia-Japan 50th Anniversary Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
          <div className="header-title-box">
            <h1 className="header-title">
              {isJa ? eventInfo.nameJa : eventInfo.nameEn}
            </h1>
            <span className="header-subtitle">
              {isJa ? 'デジタルイベントガイド' : 'Digital Event Guide'}
            </span>
          </div>
        </div>

        <div className="header-actions">
          {/* 日英切替ボタン */}
          <button
            onClick={toggleLang}
            className="lang-switch-btn"
            title={isJa ? 'Switch to English' : '日本語に切り替え'}
            aria-label="Language switch"
          >
            <Globe size={14} />
            <span>{isJa ? 'EN' : '日本語'}</span>
          </button>

          {/* ブックマークボタン */}
          <button
            onClick={onOpenFavorites}
            className="icon-btn"
            title={t('header.bookmark')}
            aria-label="Saved favorites"
          >
            <Bookmark size={18} />
            {favoriteStallIds.length > 0 && (
              <span className="badge-count">{favoriteStallIds.length}</span>
            )}
          </button>

          {/* スプレッドシート設定 (ローカル環境または管理者モード時のみ表示) */}
          {showAdminSettings && (
            <button
              onClick={onOpenSettings}
              className="icon-btn"
              title={t('header.data_sync')}
              aria-label="Google Sheets settings"
            >
              <Settings size={17} />
            </button>
          )}
        </div>
      </header>

      {/* お知らせ・アナウンスティッカー */}
      {(eventInfo.announcementJa || eventInfo.announcementEn) && (
        <div className="event-ticker">
          <span className="ticker-tag">INFO</span>
          <Volume2 size={13} style={{ flexShrink: 0, opacity: 0.9 }} />
          <div
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1
            }}
          >
            {isJa ? eventInfo.announcementJa : (eventInfo.announcementEn || eventInfo.announcementJa)}
          </div>
        </div>
      )}
    </>
  );
};
