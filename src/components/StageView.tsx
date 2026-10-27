import React, { useState } from 'react';
import type { StagePerformance } from '../types';
import { useLanguage } from '../context/LanguageContext';
import styles from './StageView.module.css';
import {
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';

interface StageViewProps {
  stages: StagePerformance[];
  onShowStageOnMap?: (stageId: string) => void;
}

export const StageView: React.FC<StageViewProps> = ({ stages, onShowStageOnMap }) => {
  const { lang, t } = useLanguage();
  const isJa = lang === 'ja';

  const [activeDay, setActiveDay] = useState<number>(1);
  const [stageFilter, setStageFilter] = useState<'all' | 'stage' | 'outdoor'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 現在時刻の取得（シミュレーション用：イベント開催中の場合は実時刻、それ以外は代表時刻 "12:15" としてデモ判定も可能）
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // 判定ヘルパー（"HH:MM" -> 分）
  const parseTimeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
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
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  // ステータス判定（NOW, NEXT, UPCOMING, ENDED）
  const getPerformanceStatus = (perf: StagePerformance, index: number) => {
    const start = parseTimeToMinutes(perf.startTime);
    const end = parseTimeToMinutes(perf.endTime);

    // イベント時間内（10:00〜18:00）で比較
    if (currentTimeMinutes >= 600 && currentTimeMinutes <= 1080) {
      if (currentTimeMinutes >= start && currentTimeMinutes <= end) {
        return 'NOW';
      }
      if (currentTimeMinutes < start) {
        // 次の直近プログラムか
        const isNext = !dayStages.some((other) => {
          const otherStart = parseTimeToMinutes(other.startTime);
          return otherStart > currentTimeMinutes && otherStart < start;
        });
        if (isNext) return 'NEXT';
      }
      if (currentTimeMinutes > end) {
        return 'ENDED';
      }
    } else {
      // 開催時間外のプレビュー時は Day 1 の2番目、3番目の演目をデモでハイライト
      if (activeDay === 1 && index === 1) return 'NOW';
      if (activeDay === 1 && index === 2) return 'NEXT';
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
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            margin: '0 auto 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--color-primary)'
          }}
        >
          <span>📅</span>
          <span>{isJa ? '2026年11月8日（日）11:00 AM - 4:00 PM' : 'Sunday, November 8, 2026, 11:00 AM - 4:00 PM'}</span>
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
          onClick={() => setStageFilter('stage')}
        >
          🏛️ {t('stage.stage')}
        </button>
        <button
          className={`${styles.filterBtn} ${stageFilter === 'outdoor' ? styles.filterBtnActive : ''}`}
          onClick={() => setStageFilter('outdoor')}
        >
          🌳 {t('stage.outdoor')}
        </button>
      </div>

      {/* タイムラインリスト */}
      <div className={styles.timeline}>
        {dayStages.map((perf, index) => {
          const status = getPerformanceStatus(perf, index);
          const isExpanded = expandedId === perf.id;
          const isNow = status === 'NOW';
          const isNext = status === 'NEXT';

          return (
            <div key={perf.id} className={styles.timelineItem}>
              <div
                className={`${styles.timelineDot} ${isNow ? styles.timelineDotActive : ''}`}
              />

              <div
                className={`${styles.stageCard} ${isNow ? styles.stageCardNow : ''}`}
                onClick={() => toggleExpand(perf.id)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.timeBadge}>
                    <Clock size={13} />
                    <span>
                      {perf.startTime} - {perf.endTime}
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
                    <span className="badge-category badge-craft" style={{ fontSize: '0.65rem' }}>
                      {isJa ? perf.categoryJa : perf.categoryEn}
                    </span>
                  </div>
                </div>

                <h3 className={styles.programTitle}>
                  {isJa ? perf.titleJa : perf.titleEn}
                </h3>

                <div className={styles.artistRow}>
                  <UserCheck size={14} style={{ color: 'var(--color-accent)' }} />
                  <span>{isJa ? perf.artistJa : perf.artistEn}</span>
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
                {isExpanded && (
                  <div className={styles.descText}>
                    <p>{isJa ? perf.descJa : perf.descEn}</p>
                    {onShowStageOnMap && (
                      <button
                        className="btn btn-outline"
                        style={{ marginTop: '10px', width: '100%', fontSize: '0.75rem', padding: '6px' }}
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
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
