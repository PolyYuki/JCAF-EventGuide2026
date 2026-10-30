import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { EventInfo, StagePerformance } from '../types';
import { Settings, Globe, Volume2 } from 'lucide-react';

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
  stages?: StagePerformance[];
  onOpenSettings: () => void;
  onSelectTab: (tab: 'map' | 'stalls' | 'stage' | 'info') => void;
}

const parseTimeToMinutes = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

const getPerformanceInterval = (perf: StagePerformance, list: StagePerformance[]) => {
  const start = parseTimeToMinutes(perf.startTime) ?? 660;
  let end = parseTimeToMinutes(perf.endTime);
  if (end === null || end <= start) {
    const nextSameArea = list
      .filter((s) => s.stageId === perf.stageId && (parseTimeToMinutes(s.startTime) ?? 0) > start)
      .sort((a, b) => (parseTimeToMinutes(a.startTime) ?? 0) - (parseTimeToMinutes(b.startTime) ?? 0))[0];
    if (nextSameArea) {
      end = parseTimeToMinutes(nextSameArea.startTime);
    } else {
      end = start + 30;
    }
  }
  return { start, end: end ?? start + 30 };
};

export const Header: React.FC<HeaderProps> = ({
  eventInfo,
  stages = [],
  onOpenSettings,
  onSelectTab
}) => {
  const { lang, toggleLang, t } = useLanguage();

  const isJa = lang === 'ja';
  const showAdminSettings = useMemo(() => isLocalOrAdmin(), []);

  // 現在時刻のリアルタイム更新（15秒ごと）
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // 現在開催中のパフォーマンスを抽出
  const nowPerformances = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return stages.filter((perf) => {
      const { start, end } = getPerformanceInterval(perf, stages);
      return currentMinutes >= start && currentMinutes < end;
    });
  }, [stages, now]);

  // ティッカー表示テキストの生成
  const tickerText = useMemo(() => {
    const baseText = isJa
      ? eventInfo.announcementJa
      : eventInfo.announcementEn || eventInfo.announcementJa;

    if (nowPerformances.length === 0) {
      return baseText;
    }

    const perfTexts = nowPerformances.map((perf) => {
      const isOutdoor = perf.stageId === 'outdoor' || perf.stageId === 'culture';
      const areaLabel = isJa
        ? isOutdoor
          ? '🌿 アウトドアパフォーマンス'
          : '🎤 ステージ'
        : isOutdoor
          ? '🌿 Outdoor Performance'
          : '🎤 Stage';
      const title = isJa ? perf.titleJa : perf.titleEn || perf.titleJa;
      const artist = isJa ? perf.artistJa : perf.artistEn || perf.artistJa;
      const titleWithArtist = artist && artist !== title ? `${title} (${artist})` : title;
      const timeRange = perf.endTime
        ? `${perf.startTime}〜${perf.endTime}`
        : `${perf.startTime}〜`;
      return `${areaLabel}: ${titleWithArtist} [${timeRange}]`;
    });

    if (isJa) {
      return `【現在開催中】${perfTexts.join(' ／ ')}　｜　${baseText}`;
    } else {
      return `[NOW PLAYING] ${perfTexts.join(' / ')}  |  ${baseText}`;
    }
  }, [isJa, eventInfo.announcementJa, eventInfo.announcementEn, nowPerformances]);

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
          <div className="header-title-box">
            <h1 className="header-title">
              {isJa ? (
                eventInfo.nameJa
              ) : eventInfo.nameEn.startsWith('Japan Culture & Art ') ? (
                <>
                  Japan Culture &amp; Art
                  <br />
                  {eventInfo.nameEn.replace('Japan Culture & Art ', '')}
                </>
              ) : (
                eventInfo.nameEn
              )}
            </h1>
            <span className="header-subtitle">
              {isJa ? 'デジタルイベントガイド' : 'Digital Event Guide'}
            </span>
          </div>
        </div>

        <div className="header-actions">
          {/* 日豪友好協力50周年ロゴ */}
          <div className="header-sublogo-wrapper" title="Australia - Japan 50 years of Friendship and Cooperation">
            <img
              src="/australia-japan-50th.jpg"
              alt="Australia-Japan 50th Anniversary Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>

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
      {tickerText && (
        <div
          className="event-ticker"
          onClick={() => {
            if (nowPerformances.length > 0) {
              onSelectTab('stage');
            }
          }}
          style={{ cursor: nowPerformances.length > 0 ? 'pointer' : 'default' }}
          title={
            nowPerformances.length > 0
              ? isJa
                ? 'タップしてタイムテーブルを見る'
                : 'Tap to view timetable'
              : undefined
          }
        >
          <span className="ticker-tag">INFO</span>
          <Volume2 size={13} style={{ flexShrink: 0, opacity: 0.9 }} />
          <div className="ticker-marquee-viewport">
            <div
              className="ticker-marquee-track"
              style={{
                animationDuration: nowPerformances.length > 0 ? '22s' : '14s'
              }}
            >
              <span className="ticker-marquee-item">{tickerText}</span>
              <span className="ticker-marquee-item" aria-hidden="true">
                {tickerText}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
