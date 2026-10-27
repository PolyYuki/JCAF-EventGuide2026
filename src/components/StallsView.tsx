import React, { useState, useMemo } from 'react';
import type { Stall, StallCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import styles from './StallsView.module.css';
import {
  Search,
  X,
  MapPin,
  Heart,
  Share2,
  Store,
  Globe,
  ExternalLink
} from 'lucide-react';

const InstagramIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 16,
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

interface StallsViewProps {
  stalls: Stall[];
  initialSelectedStallId?: string | null;
  onShowOnMap: (stallId: string) => void;
}

export const StallsView: React.FC<StallsViewProps> = ({
  stalls,
  initialSelectedStallId,
  onShowOnMap
}) => {
  const { lang, t } = useLanguage();
  const { isStallFavorite, toggleFavoriteStall } = useFavorites();
  const isJa = lang === 'ja';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // 詳細モーダルで開いているストール
  const [inspectStall, setInspectStall] = useState<Stall | null>(() => {
    if (initialSelectedStallId) {
      return stalls.find((s) => s.id === initialSelectedStallId) || null;
    }
    return null;
  });

  // フィルタリング処理
  const filteredStalls = useMemo(() => {
    return stalls.filter((stall) => {
      // お気に入りフィルタ
      if (onlyFavorites && !isStallFavorite(stall.id)) {
        return false;
      }

      // カテゴリフィルタ
      if (selectedCategory !== 'all' && stall.category !== selectedCategory) {
        return false;
      }

      // 検索クエリ
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchNameJa = stall.nameJa.toLowerCase().includes(q);
      const matchNameEn = stall.nameEn.toLowerCase().includes(q);
      const matchDescJa = stall.descriptionJa.toLowerCase().includes(q);
      const matchDescEn = stall.descriptionEn.toLowerCase().includes(q);
      const matchBooth = stall.boothNumber.toLowerCase().includes(q);
      const matchLocationJa = (stall.locationJa || '').toLowerCase().includes(q);
      const matchLocationEn = (stall.locationEn || '').toLowerCase().includes(q);
      const matchTagsJa = stall.tagsJa.some((tag) => tag.toLowerCase().includes(q));
      const matchTagsEn = stall.tagsEn.some((tag) => tag.toLowerCase().includes(q));

      return (
        matchNameJa ||
        matchNameEn ||
        matchDescJa ||
        matchDescEn ||
        matchBooth ||
        matchLocationJa ||
        matchLocationEn ||
        matchTagsJa ||
        matchTagsEn
      );
    });
  }, [stalls, searchQuery, selectedCategory, onlyFavorites, isStallFavorite]);

  const handleShare = (stall: Stall) => {
    const text = `${isJa ? stall.nameJa : stall.nameEn} - JCAF Digital Guide`;
    if (navigator.share) {
      navigator.share({
        title: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('common.shared_success'));
    }
  };

  const getBadgeClass = (category: StallCategory) => {
    switch (category) {
      case 'market':
      case 'craft':
      case 'goods':
        return 'badge-category badge-market';
      case 'sponsor':
        return 'badge-category badge-sponsor';
      case 'paid_workshop':
      case 'workshop':
        return 'badge-category badge-paid-workshop';
      case 'free_workshop':
        return 'badge-category badge-free-workshop';
      case 'food':
        return 'badge-category badge-food';
      default:
        return 'badge-category';
    }
  };

  return (
    <div className={styles.container}>
      {/* 検索・絞り込みヘッダー */}
      <div className={styles.searchHeader}>
        <div className={styles.searchBarWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('stalls.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* カテゴリピル */}
        <div className={styles.categoryPills}>
          <button
            className={`${styles.pill} ${selectedCategory === 'all' ? styles.pillActive : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            {t('stalls.category_all')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'market' ? styles.pillActive : ''}`}
            onClick={() => setSelectedCategory('market')}
          >
            🛍️ {t('stalls.category_market')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'sponsor' ? styles.pillActive : ''}`}
            onClick={() => setSelectedCategory('sponsor')}
          >
            🏢 {t('stalls.category_sponsor')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'paid_workshop' ? styles.pillActive : ''}`}
            onClick={() => setSelectedCategory('paid_workshop')}
          >
            🎨 {t('stalls.category_paid_workshop')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'free_workshop' ? styles.pillActive : ''}`}
            onClick={() => setSelectedCategory('free_workshop')}
          >
            🖌️ {t('stalls.category_free_workshop')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'food' ? styles.pillActive : ''}`}
            onClick={() => setSelectedCategory('food')}
          >
            🍱 {t('stalls.category_food')}
          </button>
        </div>

        {/* 状態表示とお気に入りトグル */}
        <div className={styles.statusRow}>
          <span>
            {t('stalls.count_prefix')}
            <strong>{filteredStalls.length}</strong>
            {t('stalls.count_suffix')}
          </span>
          <button
            className={`${styles.favFilterBtn} ${onlyFavorites ? styles.favFilterBtnActive : ''}`}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
          >
            <Heart size={14} fill={onlyFavorites ? 'currentColor' : 'none'} />
            <span>{t('stalls.favorites_only')}</span>
          </button>
        </div>
      </div>

      {/* 出店者カードリスト */}
      {filteredStalls.length === 0 ? (
        <div className={styles.emptyState}>
          <Store size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            {t('stalls.no_results')}
          </p>
          {(searchQuery || selectedCategory !== 'all' || onlyFavorites) && (
            <button
              className="btn btn-outline"
              style={{ marginTop: '12px', fontSize: '0.8rem' }}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyFavorites(false);
              }}
            >
              {t('stalls.clear_search')}
            </button>
          )}
        </div>
      ) : (
        <div className={styles.stallGrid}>
          {filteredStalls.map((stall) => {
            const isFav = isStallFavorite(stall.id);
            return (
              <div
                key={stall.id}
                className={styles.stallCard}
                onClick={() => setInspectStall(stall)}
              >
                <div className={styles.cardTop}>
                  {stall.imageUrl && (
                    <img
                      src={stall.imageUrl}
                      alt={isJa ? stall.nameJa : stall.nameEn}
                      className={`${styles.cardImage} ${stall.category === 'sponsor' ? styles.sponsorCardImage : ''}`}
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
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeaderRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span className={styles.boothNumber}>{stall.boothNumber}</span>
                        {(stall.locationJa || stall.locationEn) && (
                          <span className={styles.locationBadge}>
                            <MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} />
                            {isJa ? stall.locationJa : stall.locationEn}
                          </span>
                        )}
                      </div>
                      <span className={getBadgeClass(stall.category)}>
                        {isJa ? stall.categoryJa : stall.categoryEn}
                      </span>
                    </div>

                    <h3 className={styles.cardTitle}>
                      {isJa ? stall.nameJa : stall.nameEn}
                    </h3>

                    <p className={styles.cardShortDesc}>
                      {isJa ? stall.shortDescJa : stall.shortDescEn}
                    </p>
                  </div>
                </div>

                <div className={styles.cardBottomActions} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* カード上のSNSリンク */}
                    {stall.instagram && (
                      <a
                        href={stall.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.cardSocialLink}
                        title="Instagram"
                        aria-label="Instagram"
                      >
                        <InstagramIcon size={14} />
                      </a>
                    )}
                    {stall.website && (
                      <a
                        href={stall.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.cardWebsiteLink}
                        title="Website"
                        aria-label="Website"
                      >
                        <Globe size={14} />
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="icon-btn"
                      style={{
                        background: isFav ? '#fee2e2' : '#f1f5f9',
                        color: isFav ? 'var(--color-accent)' : '#64748b',
                        border: 'none',
                        width: '32px',
                        height: '32px'
                      }}
                      onClick={() => toggleFavoriteStall(stall.id)}
                      title="Bookmark"
                      aria-label="Bookmark"
                    >
                      <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      className={styles.btnShowMap}
                      onClick={() => onShowOnMap(stall.id)}
                    >
                      <MapPin size={13} />
                      <span>{t('stalls.view_map')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 詳細モーダル (Bottom Sheet) */}
      {inspectStall && (
        <div className="modal-overlay" onClick={() => setInspectStall(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className={styles.boothNumber}>{inspectStall.boothNumber}</span>
                {(inspectStall.locationJa || inspectStall.locationEn) && (
                  <span className={styles.locationBadge}>
                    <MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} />
                    {isJa ? inspectStall.locationJa : inspectStall.locationEn}
                  </span>
                )}
                <span className={getBadgeClass(inspectStall.category)}>
                  {isJa ? inspectStall.categoryJa : inspectStall.categoryEn}
                </span>
              </div>
              <button
                className="icon-btn"
                style={{ background: '#f1f5f9', color: '#64748b', border: 'none' }}
                onClick={() => setInspectStall(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="sheet-body">
              {inspectStall.imageUrl && (
                <div className={styles.modalImageWrapper}>
                  <img
                    src={inspectStall.imageUrl}
                    alt={isJa ? inspectStall.nameJa : inspectStall.nameEn}
                    className={styles.modalImage}
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

              <h2 className="sheet-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                {isJa ? inspectStall.nameJa : inspectStall.nameEn}
              </h2>

              {/* こだわりハイライト */}
              {(inspectStall.highlightJa || inspectStall.highlightEn) && (
                <div className={styles.modalHighlightBox}>
                  ✨ {isJa ? inspectStall.highlightJa : inspectStall.highlightEn}
                </div>
              )}

              {/* 出店場所 */}
              {(inspectStall.locationJa || inspectStall.locationEn) && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>
                    {isJa ? '出店場所' : 'Location'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    <MapPin size={15} style={{ color: 'var(--color-accent)' }} />
                    <span>{isJa ? inspectStall.locationJa : inspectStall.locationEn}</span>
                  </div>
                </div>
              )}

              <div className={styles.modalSection}>
                <div className={styles.modalSectionTitle}>
                  {isJa ? '出店紹介' : 'About this Stall'}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text-main)' }}>
                  {isJa ? inspectStall.descriptionJa : inspectStall.descriptionEn}
                </p>
              </div>

              {/* Instagram & 公式サイト SNSリンクセクション */}
              {(inspectStall.instagram || inspectStall.website) && (
                <div className={styles.modalSection}>
                  <div className={styles.modalSectionTitle}>
                    {isJa ? '公式リンク・SNS' : 'Links & Social'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {inspectStall.instagram && (
                      <a
                        href={inspectStall.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.instagramBtn}
                      >
                        <InstagramIcon size={16} />
                        <span>Instagram</span>
                        <ExternalLink size={12} style={{ opacity: 0.8 }} />
                      </a>
                    )}
                    {inspectStall.website && (
                      <a
                        href={inspectStall.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.websiteBtn}
                      >
                        <Globe size={16} />
                        <span>{isJa ? '公式サイト' : 'Website'}</span>
                        <ExternalLink size={12} style={{ opacity: 0.8 }} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* モーダル下部のアクションボタン */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                  onClick={() => {
                    const id = inspectStall.id;
                    setInspectStall(null);
                    onShowOnMap(id);
                  }}
                >
                  <MapPin size={16} />
                  <span>{t('stalls.view_map')}</span>
                </button>

                <button
                  className={`btn ${isStallFavorite(inspectStall.id) ? 'btn-accent' : 'btn-outline'}`}
                  style={{ padding: '12px 18px' }}
                  onClick={() => toggleFavoriteStall(inspectStall.id)}
                >
                  <Heart
                    size={18}
                    fill={isStallFavorite(inspectStall.id) ? 'currentColor' : 'none'}
                  />
                </button>

                <button
                  className="btn btn-outline"
                  style={{ padding: '12px 16px' }}
                  onClick={() => handleShare(inspectStall)}
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
