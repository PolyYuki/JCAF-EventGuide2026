import React, { useState, useEffect } from 'react';
import type { StagePerformance } from '../types';
import { useLanguage } from '../context/LanguageContext';
import styles from './StageView.module.css';
import {
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ExternalLink
} from 'lucide-react';

const InstagramIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 14,
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface StageViewProps {
  stages: StagePerformance[];
  initialStageFilter?: 'all' | 'stage' | 'outdoor';
  onShowStageOnMap?: (stageId: string) => void;
}

export const StageView: React.FC<StageViewProps> = ({
  stages,
  initialStageFilter = 'all',
  onShowStageOnMap
}) => {
  const { lang, t } = useLanguage();
  const isJa = lang === 'ja';

  const [activeDay, setActiveDay] = useState<number>(1);
  const [stageFilter, setStageFilter] = useState<'all' | 'stage' | 'outdoor'>(initialStageFilter);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setStageFilter(initialStageFilter);
  }, [initialStageFilter]);

  // 現在時刻のリアルタイム連動（15秒ごとに自動更新）
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  const formattedCurrentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  // "HH:MM" -> 分への変換ヘルパー
  const parseTimeToMinutes = (timeStr?: string): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.trim().split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  // 演目の開始時刻と終了時刻（分換算）を算出
  // 終了時刻が空欄の場合は、同一エリアの次の演目開始時刻、または開始+30分
  const getPerformanceInterval = (perf: StagePerformance, list: StagePerformance[]) => {
    const start = parseTimeToMinutes(perf.startTime) ?? 660; // 11:00
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

  // 選択日とフィルターで絞り込み
  const dayStages = stages
    .filter((s) => s.day === activeDay)
    .filter((s) => {
      if (stageFilter === 'all') return true;
      if (stageFilter === 'stage') return s.stageId === 'stage' || s.stageId === 'main';
      if (stageFilter === 'outdoor') return s.stageId === 'outdoor' || s.stageId === 'culture';
      return true;
    })
    .sort((a, b) => (parseTimeToMinutes(a.startTime) ?? 0) - (parseTimeToMinutes(b.startTime) ?? 0));

  // ステータス判定（NOW, NEXT, UPCOMING, ENDED）
  // ステージとアウトドアパフォーマンスは別会場で同時進行するため、エリアごとに独立して判定
  const getPerformanceStatus = (perf: StagePerformance) => {
    const { start, end } = getPerformanceInterval(perf, stages);

    // 1. 現在開催中（NOW）: 実時刻が開始時刻以上かつ終了時刻未満
    if (currentTimeMinutes >= start && currentTimeMinutes < end) {
      return 'NOW';
    }

    // 2. 終了済み（ENDED）: 実時刻が終了時刻以降
    if (currentTimeMinutes >= end) {
      return 'ENDED';
    }

    // 3. 次回プログラム（NEXT）: まだ始まっていない演目のうち、そのエリアで最も早いもの
    const upcomingInSameArea = stages
      .filter((s) => s.stageId === perf.stageId)
      .map((s) => ({ perf: s, ...getPerformanceInterval(s, stages) }))
      .filter((item) => item.start > currentTimeMinutes)
      .sort((a, b) => a.start - b.start);

    if (upcomingInSameArea.length > 0 && upcomingInSameArea[0].perf.id === perf.id) {
      return 'NEXT';
    }

    return 'UPCOMING';
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>
      {/* 日程セレクター (Day 2 がある場合のみ切替、単日の場合は日程バッジを表示) */}
      {stages.some((s) => s.day === 2) ? (
        <div className={styles.daySelector}>
          <button
            className={`${styles.dayBtn} ${activeDay === 1 ? styles.dayBtnActive : ''}`}
            onClick={() => setActiveDay(1)}
          >
            {t('stage.day1')}
          </button>
          <button
            className={`${styles.dayBtn} ${activeDay === 2 ? styles.dayBtnActive : ''}`}
            onClick={() => setActiveDay(2)}
          >
            {t('stage.day2')}
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '8px 16px',
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            margin: '0 auto 14px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
            <span>📅</span>
            <span>{isJa ? '2026年11月8日（日）11:00 AM - 4:00 PM' : 'Sunday, November 8, 2026, 11:00 AM - 4:00 PM'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            <span>{isJa ? `現在時刻に自動連動中 (${formattedCurrentTime})` : `Live Clock Sync (${formattedCurrentTime})`}</span>
          </div>
        </div>
      )}

      {/* ステージフィルター */}
      <div className={styles.stageFilterRow}>
        <button
          className={`${styles.filterBtn} ${stageFilter === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setStageFilter('all')}
        >
          {t('stage.all_stages')}
        </button>
        <button
          className={`${styles.filterBtn} ${stageFilter === 'stage' ? styles.filterBtnActive : ''}`}
          style={
            stageFilter === 'stage'
              ? { background: '#d81e35', color: '#ffffff', borderColor: '#d81e35' }
              : undefined
          }
          onClick={() => setStageFilter('stage')}
        >
          🏛️ {t('stage.stage')}
        </button>
        <button
          className={`${styles.filterBtn} ${stageFilter === 'outdoor' ? styles.filterBtnActive : ''}`}
          style={
            stageFilter === 'outdoor'
              ? { background: '#8b5cf6', color: '#ffffff', borderColor: '#8b5cf6' }
              : undefined
          }
          onClick={() => setStageFilter('outdoor')}
        >
          🌳 {t('stage.outdoor')}
        </button>
      </div>

      {/* タイムラインリスト */}
      <div className={styles.timeline}>
        {dayStages.map((perf) => {
          const status = getPerformanceStatus(perf);
          const isExpanded = expandedId === perf.id;
          const isNow = status === 'NOW';
          const isNext = status === 'NEXT';
          const isEnded = status === 'ENDED';

          return (
            <div key={perf.id} className={styles.timelineItem}>
              <div
                className={`${styles.timelineDot} ${isNow ? styles.timelineDotActive : ''}`}
              />

              <div
                className={`${styles.stageCard} ${isNow ? styles.stageCardNow : ''} ${isEnded ? styles.stageCardEnded : ''}`}
                onClick={() => toggleExpand(perf.id)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.timeBadge}>
                    <Clock size={13} />
                    <span>
                      {perf.endTime ? `${perf.startTime} - ${perf.endTime}` : perf.startTime}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isNow && (
                      <span className={styles.statusTagNow}>
                        ● {t('stage.now')}
                      </span>
                    )}
                    {isNext && (
                      <span className={styles.statusTagNext}>
                        ⏳ {t('stage.next')}
                      </span>
                    )}
                    {isEnded && (
                      <span className={styles.statusTagEnded}>
                        ✓ {isJa ? '終了' : 'Ended'}
                      </span>
                    )}
                    <span className="badge-category badge-craft" style={{ fontSize: '0.65rem' }}>
                      {isJa ? perf.categoryJa : perf.categoryEn}
                    </span>
                  </div>
                </div>

                <div className={styles.cardMain}>
                  {perf.imageUrl && (
                    <img
                      src={perf.imageUrl}
                      alt={perf.titleJa}
                      className={styles.performerLogo}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('drive.google.com/thumbnail')) {
                          const idMatch = target.src.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                          if (idMatch && idMatch[1]) {
                            target.src = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
                            return;
                          }
                        } else if (target.src.includes('lh3.googleusercontent.com/d/')) {
                          const id = target.src.split('/d/')[1];
                          if (id) {
                            target.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
                            return;
                          }
                        }
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}

                  <div className={styles.titleBlock}>
                    <h3 className={styles.programTitle}>
                      {isJa ? perf.titleJa : perf.titleEn}
                    </h3>

                    {(perf.artistJa || perf.artistEn) && (
                      <div className={styles.artistRow}>
                        <UserCheck size={14} style={{ color: 'var(--color-accent)' }} />
                        <span>{isJa ? (perf.artistJa || perf.artistEn) : (perf.artistEn || perf.artistJa)}</span>
                      </div>
                    )}

                    {perf.link && (
                      <div style={{ marginTop: '4px' }}>
                        <a
                          href={perf.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            borderRadius: '16px',
                            color: 'var(--color-text)',
                            borderColor: 'var(--color-border)',
                            textDecoration: 'none',
                            background: 'rgba(255, 255, 255, 0.05)'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {perf.link.includes('instagram.com') ? (
                            <InstagramIcon size={12} style={{ color: '#E1306C' }} />
                          ) : (
                            <ExternalLink size={12} />
                          )}
                          <span>
                            {perf.link.includes('instagram.com') ? 'Instagram' : (isJa ? '公式リンク' : 'Link')}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <div className={styles.stageLocationBadge}>
                    <MapPin size={11} />
                    <span>{isJa ? perf.stageNameJa : perf.stageNameEn}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#94a3b8', fontSize: '0.75rem' }}>
                    <span>{isExpanded ? (isJa ? '閉じる' : 'Less') : (isJa ? '詳細' : 'More')}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* 展開時の詳細説明 */}
                {isExpanded && (() => {
                  const detailPhoto = perf.photoUrl || perf.imageUrl;
                  return (
                    <div className={styles.descText}>
                      {detailPhoto && (
                        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                          <img
                            src={detailPhoto}
                            alt={isJa ? perf.titleJa : perf.titleEn}
                            loading="lazy"
                            style={{
                              maxHeight: '240px',
                              width: '100%',
                              borderRadius: '10px',
                              objectFit: 'contain',
                              background: '#f8fafc',
                              border: '1px solid var(--color-border)',
                              display: 'block',
                              margin: '0 auto'
                            }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.includes('drive.google.com/thumbnail')) {
                                const idMatch = target.src.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                if (idMatch && idMatch[1]) {
                                  target.src = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
                                  return;
                                }
                              } else if (target.src.includes('lh3.googleusercontent.com/d/')) {
                                const id = target.src.split('/d/')[1];
                                if (id) {
                                  target.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
                                  return;
                                }
                              }
                              (e.currentTarget.parentElement || e.currentTarget).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                    {(perf.descJa || perf.descEn) ? (
                      <p>{isJa ? perf.descJa : perf.descEn}</p>
                    ) : (
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        {isJa ? '当日の迫力あるパフォーマンスをぜひステージでお楽しみください！' : 'Enjoy the dynamic live performance at the stage!'}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      {perf.link && (
                        <a
                          href={perf.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            textDecoration: 'none'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {perf.link.includes('instagram.com') ? (
                            <InstagramIcon size={14} />
                          ) : (
                            <ExternalLink size={14} />
                          )}
                          <span>
                            {perf.link.includes('instagram.com')
                              ? (isJa ? '出演者 / 演目のInstagramを見る' : 'View on Instagram')
                              : (isJa ? '公式リンク・関連ページを開く' : 'Open Link')}
                          </span>
                        </a>
                      )}

                      {onShowStageOnMap && (
                        <button
                          className="btn btn-outline"
                          style={{ width: '100%', fontSize: '0.75rem', padding: '6px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowStageOnMap(perf.stageId);
                          }}
                        >
                          <MapPin size={13} />
                          <span>{isJa ? '地図でこのステージの場所を見る' : 'View stage on map'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
