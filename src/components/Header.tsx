import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import type { EventInfo } from '../types';
import { Bookmark, Settings, Globe, Volume2 } from 'lucide-react';

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
          <div className="header-emblem" style={{ overflow: 'hidden', padding: '2px', background: '#ffffff' }}>
            {eventInfo.logoUrl ? (
              <img
                src={eventInfo.logoUrl}
                alt="JCAF Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
              />
            ) : (
              <svg viewBox="0 0 40 40" width="24" height="24" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#d4af37" strokeWidth="1.5" />
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

          {/* スプレッドシート設定 */}
          <button
            onClick={onOpenSettings}
            className="icon-btn"
            title={t('header.data_sync')}
            aria-label="Google Sheets settings"
          >
            <Settings size={17} />
          </button>
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
