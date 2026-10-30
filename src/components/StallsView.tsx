import React, { useState, useMemo } from 'react';
import type { Stall, StallCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import styles from './StallsView.module.css';
import {
  Search,
  X,
  MapPin,
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
  onCloseDetail?: () => void;
}

export const StallsView: React.FC<StallsViewProps> = ({
  stalls,
  initialSelectedStallId,
  onShowOnMap,
  onCloseDetail
}) => {
  const { lang, t } = useLanguage();
  const isJa = lang === 'ja';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
  }, [stalls, searchQuery, selectedCategory]);

  const handleCloseModal = () => {
    setInspectStall(null);
    if (onCloseDetail) {
      onCloseDetail();
    }
  };

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
      case 'kids':
      case 'kids_activity':
        return 'badge-category badge-kids';
      case 'art':
      case 'art_exhibition':
        return 'badge-category badge-art';
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
            className={`${styles.pill} ${selectedCategory === 'sponsor' ? styles.pillActive : ''}`}
            style={
              selectedCategory === 'sponsor'
                ? { background: '#004aad', color: '#ffffff', borderColor: '#004aad' }
                : undefined
            }
            onClick={() => setSelectedCategory('sponsor')}
          >
            🏢 {t('stalls.category_sponsor')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'market' ? styles.pillActive : ''}`}
            style={
              selectedCategory === 'market'
                ? { background: '#ffbd59', color: '#1e293b', borderColor: '#f59e0b' }
                : undefined
            }
            onClick={() => setSelectedCategory('market')}
          >
            🛍️ {t('stalls.category_market')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'paid_workshop' ? styles.pillActive : ''}`}
            style={
              selectedCategory === 'paid_workshop'
                ? { background: '#f08283', color: '#ffffff', borderColor: '#e15b5d' }
                : undefined
            }
            onClick={() => setSelectedCategory('paid_workshop')}
          >
            🎨 {t('stalls.category_paid_workshop')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'free_workshop' ? styles.pillActive : ''}`}
            style={
              selectedCategory === 'free_workshop'
                ? { background: '#5ce1e6', color: '#1e293b', borderColor: '#06b6d4' }
                : undefined
            }
            onClick={() => setSelectedCategory('free_workshop')}
          >
            🖌️ {t('stalls.category_free_workshop')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'food' ? styles.pillActive : ''}`}
            style={
              selectedCategory === 'food'
                ? { background: '#7ed957', color: '#1e293b', borderColor: '#4ade80' }
                : undefined
            }
            onClick={() => setSelectedCategory('food')}
          >
            🍱 {t('stalls.category_food')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'kids' ? styles.pillActive : ''}`}
            style={
              selectedCategory === 'kids'
                ? { background: '#ffde59', color: '#1e293b', borderColor: '#eab308' }
                : undefined
            }
            onClick={() => setSelectedCategory('kids')}
          >
            🎈 {t('stalls.category_kids')}
          </button>
          <button
            className={`${styles.pill} ${selectedCategory === 'art' ? styles.pillActive : ''}`}
            style={
              selectedCategory === 'art'
                ? { background: '#e2a9f1', color: '#1e293b', borderColor: '#c084fc' }
                : undefined
            }
            onClick={() => setSelectedCategory('art')}
          >
            🖼️ {t('stalls.category_art')}
          </button>
        </div>

        {/* 状態表示 */}
        <div className={styles.statusRow}>
          <span>
            {t('stalls.count_prefix')}
            <strong>{filteredStalls.length}</strong>
            {t('stalls.count_suffix')}
          </span>
        </div>

        {/* キッズアクティビティ選択時のゴールドコイン案内バナー */}
        {selectedCategory === 'kids' && (
          <div
            style={{
              background: 'linear-gradient(90deg, #fef3c7 0%, #fef9c3 100%)',
              border: '1.5px solid #eab308',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#78350f',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🪙</span>
            <span>
              {isJa
                ? 'キッズアクティビティの参加にはゴールドコイン（$1 or $2）が必要です。'
                : 'A gold coin ($1 or $2) is required to participate in Kids Activities.'}
            </span>
          </div>
        )}
      </div>

      {/* 出店者カードリスト */}
      {filteredStalls.length === 0 ? (
        <div className={styles.emptyState}>
          <Store size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            {t('stalls.no_results')}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              className="btn btn-outline"
              style={{ marginTop: '12px', fontSize: '0.8rem' }}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              {t('stalls.clear_search')}
            </button>
          )}
        </div>
      ) : (
        <div className={styles.stallGrid}>
          {filteredStalls.map((stall) => {
            const isPureSponsor = stall.category === 'sponsor' && !stall.boothNumber;

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
                        {stall.boothNumber && (
                          <span className={styles.boothNumber}>{stall.boothNumber}</span>
                        )}
                        {!isPureSponsor && (stall.locationJa || stall.locationEn) && (
                          <span className={styles.locationBadge}>
                            <MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} />
                            {isJa ? stall.locationJa : stall.locationEn}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        {(stall.category === 'kids' || stall.category === 'kids_activity') && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '999px',
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #f59e0b'
                            }}
                          >
                            🪙 {isJa ? 'ゴールドコイン ($1 or $2)' : 'Gold Coin ($1 or $2)'}
                          </span>
                        )}
                        {stall.sponsorTier && (
                          <span className="badge-category badge-gold" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                            {stall.sponsorTier}
                          </span>
                        )}
                        <span className={getBadgeClass(stall.category)}>
                          {isJa ? stall.categoryJa : stall.categoryEn}
                        </span>
                      </div>
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
                    {isPureSponsor ? (
                      stall.website ? (
                        <a
                          href={stall.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnShowMap}
                          style={{ textDecoration: 'none' }}
                        >
                          <Globe size={13} />
                          <span>{isJa ? '公式ページ' : 'Website'}</span>
                        </a>
                      ) : stall.instagram ? (
                        <a
                          href={stall.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnShowMap}
                          style={{ textDecoration: 'none' }}
                        >
                          <InstagramIcon size={13} />
                          <span>Instagram</span>
                        </a>
                      ) : null
                    ) : (
                      <button
                        className={styles.btnShowMap}
                        onClick={() => onShowOnMap(stall.id)}
                      >
                        <MapPin size={13} />
                        <span>{t('stalls.view_map')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 詳細モーダル (Bottom Sheet) */}
      {inspectStall && (() => {
        const isPureInspectSponsor = inspectStall.category === 'sponsor' && !inspectStall.boothNumber;

        return (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-handle" />
              <div className="sheet-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {inspectStall.boothNumber && (
                    <span className={styles.boothNumber}>{inspectStall.boothNumber}</span>
                  )}
                  {!isPureInspectSponsor && (inspectStall.locationJa || inspectStall.locationEn) && (
                    <span className={styles.locationBadge}>
                      <MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} />
                      {isJa ? inspectStall.locationJa : inspectStall.locationEn}
                    </span>
                  )}
                  {inspectStall.sponsorTier && (
                    <span className="badge-category badge-gold" style={{ fontSize: '0.72rem' }}>
                      {inspectStall.sponsorTier}
                    </span>
                  )}
                  <span className={getBadgeClass(inspectStall.category)}>
                    {isJa ? inspectStall.categoryJa : inspectStall.categoryEn}
                  </span>
                </div>
                <button
                  className="icon-btn"
                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none' }}
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="sheet-body">
                {(inspectStall.photoUrl || inspectStall.imageUrl) && (
                  <div className={styles.modalImageWrapper}>
                    <img
                      src={inspectStall.photoUrl || inspectStall.imageUrl}
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

                {/* キッズアクティビティの参加費（ゴールドコイン）案内 */}
                {(inspectStall.category === 'kids' || inspectStall.category === 'kids_activity') && (
                  <div
                    style={{
                      background: 'linear-gradient(90deg, #fef3c7 0%, #fef9c3 100%)',
                      border: '1.5px solid #eab308',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: '#78350f',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '1.05rem' }}>🪙</span>
                    <span>
                      {isJa
                        ? '参加にはゴールドコイン（$1 or $2）が必要です'
                        : 'Gold coin ($1 or $2) required for participation'}
                    </span>
                  </div>
                )}

                {/* こだわりハイライト */}
                {!isPureInspectSponsor && (inspectStall.highlightJa || inspectStall.highlightEn) && (
                  <div className={styles.modalHighlightBox}>
                    ✨ {isJa ? inspectStall.highlightJa : inspectStall.highlightEn}
                  </div>
                )}

                {/* 出店場所 */}
                {!isPureInspectSponsor && (inspectStall.locationJa || inspectStall.locationEn) && (
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

                {(inspectStall.descriptionJa || inspectStall.descriptionEn) && (
                  <div className={styles.modalSection}>
                    <div className={styles.modalSectionTitle}>
                      {isPureInspectSponsor ? (isJa ? '紹介' : 'About') : (isJa ? '出店紹介' : 'About this Stall')}
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text-main)' }}>
                      {isJa ? inspectStall.descriptionJa : inspectStall.descriptionEn}
                    </p>
                  </div>
                )}

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
                  {isPureInspectSponsor ? (
                    (inspectStall.website || inspectStall.instagram) ? (
                      <a
                        href={inspectStall.website || inspectStall.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '12px', textDecoration: 'none', justifyContent: 'center' }}
                      >
                        <ExternalLink size={16} />
                        <span>{isJa ? '公式ページを開く' : 'Visit Website'}</span>
                      </a>
                    ) : null
                  ) : (
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
                  )}

                  <button
                    className="btn btn-outline"
                    style={{ padding: '12px 18px' }}
                    onClick={() => handleShare(inspectStall)}
                    title="Share"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
