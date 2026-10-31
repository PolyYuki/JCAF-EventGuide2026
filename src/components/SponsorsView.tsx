import React, { useState, useMemo } from 'react';
import type { Stall } from '../types';
import { useLanguage } from '../context/LanguageContext';
import styles from './SponsorsView.module.css';
import { DetailMediaView } from './DetailMediaView';
import {
  Search,
  X,
  MapPin,
  Share2,
  Globe,
  ExternalLink,
  Award,
  ArrowRight
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

interface SponsorsViewProps {
  stalls: Stall[];
  onShowOnMap: (stallId: string) => void;
}

export const SponsorsView: React.FC<SponsorsViewProps> = ({ stalls, onShowOnMap }) => {
  const { lang } = useLanguage();
  const isJa = lang === 'ja';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [inspectSponsor, setInspectSponsor] = useState<Stall | null>(null);

  // スポンサーのみを抽出
  const allSponsors = useMemo(() => {
    return stalls.filter((s) => s.category === 'sponsor');
  }, [stalls]);

  // 利用可能なスポンサー種別のリストを動的抽出
  const availableTiers = useMemo(() => {
    const tiers = new Set<string>();
    allSponsors.forEach((s) => {
      if (s.sponsorTier) tiers.add(s.sponsorTier.trim());
    });
    // 好ましい表示順
    const preferredOrder = [
      'Gold Sponsor',
      'Silver Sponsor',
      'Bronze Sponsor',
      'In-Kind Sponsor',
      'Supporter'
    ];
    return Array.from(tiers).sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [allSponsors]);

  // フィルタリング処理
  const filteredSponsors = useMemo(() => {
    return allSponsors.filter((sponsor) => {
      // 種別フィルタ
      if (selectedTier !== 'all') {
        if (!sponsor.sponsorTier || !sponsor.sponsorTier.toLowerCase().includes(selectedTier.toLowerCase())) {
          return false;
        }
      }

      // 検索クエリ
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchNameJa = sponsor.nameJa.toLowerCase().includes(q);
      const matchNameEn = sponsor.nameEn.toLowerCase().includes(q);
      const matchDescJa = sponsor.descriptionJa.toLowerCase().includes(q);
      const matchDescEn = sponsor.descriptionEn.toLowerCase().includes(q);
      const matchTier = (sponsor.sponsorTier || '').toLowerCase().includes(q);
      const matchBooth = sponsor.boothNumber.toLowerCase().includes(q);

      return matchNameJa || matchNameEn || matchDescJa || matchDescEn || matchTier || matchBooth;
    });
  }, [allSponsors, selectedTier, searchQuery]);

  const getTierClass = (tier?: string) => {
    if (!tier) return styles.tierSilver;
    const lower = tier.toLowerCase();
    if (lower.includes('gold')) return styles.tierGold;
    if (lower.includes('silver')) return styles.tierSilver;
    if (lower.includes('bronze')) return styles.tierBronze;
    if (lower.includes('in-kind') || lower.includes('kind')) return styles.tierInKind;
    if (lower.includes('supporter')) return styles.tierSupporter;
    return styles.tierSilver;
  };

  const handleShare = (sponsor: Stall) => {
    const title = isJa ? sponsor.nameJa : sponsor.nameEn;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert(isJa ? 'URLをクリップボードにコピーしました！' : 'URL copied to clipboard!');
    }
  };

  return (
    <div className={styles.sponsorsContainer}>
      {/* ページヘッダー */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>
          🏢 {isJa ? '協賛・スポンサー' : 'Festival Sponsors'}
        </h1>
        <p className={styles.pageSubtitle}>
          {isJa
            ? '日本文化芸術祭をご支援・応援いただいている企業・団体の皆さまです'
            : 'We sincerely thank all our valued sponsors and supporters of JCAF 2026.'}
        </p>
      </div>

      {/* 検索バー */}
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={isJa ? 'スポンサー名、紹介文、キーワードで検索...' : 'Search sponsors, description, keyword...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className={styles.clearSearchBtn}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* スポンサー種別タブ */}
      <div className={styles.tierFilterScroll}>
        <button
          className={`${styles.tierPill} ${selectedTier === 'all' ? styles.tierPillActive : ''}`}
          onClick={() => setSelectedTier('all')}
        >
          {isJa ? 'すべて表示' : 'All Sponsors'} ({allSponsors.length})
        </button>
        {availableTiers.map((tier) => {
          const count = allSponsors.filter((s) => s.sponsorTier && s.sponsorTier.includes(tier)).length;
          return (
            <button
              key={tier}
              className={`${styles.tierPill} ${selectedTier === tier ? styles.tierPillActive : ''}`}
              onClick={() => setSelectedTier(tier)}
            >
              {tier} ({count})
            </button>
          );
        })}
      </div>

      {/* カウント表示 */}
      <div className={styles.countBar}>
        <span>
          {isJa ? `全 ${filteredSponsors.length} 件` : `${filteredSponsors.length} Sponsors`}
        </span>
      </div>

      {/* スポンサーカード一覧 */}
      {filteredSponsors.length === 0 ? (
        <div className={styles.noResults}>
          <Award size={36} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
          <p>{isJa ? '該当するスポンサーが見つかりませんでした' : 'No sponsors found matching your criteria.'}</p>
        </div>
      ) : (
        <div className={styles.sponsorGrid}>
          {filteredSponsors.map((sponsor) => {
            const hasBooth = Boolean(sponsor.boothNumber);
            return (
              <div
                key={sponsor.id}
                className={styles.sponsorCard}
                onClick={() => setInspectSponsor(sponsor)}
              >
                <div className={styles.cardTop}>
                  {sponsor.imageUrl && (
                    <div className={styles.cardLogoWrapper}>
                      <img
                        src={sponsor.imageUrl}
                        alt={isJa ? sponsor.nameJa : sponsor.nameEn}
                        className={styles.cardLogo}
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
                          (target.parentElement || target).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className={styles.cardContent}>
                    <div className={styles.badgeRow}>
                      {sponsor.sponsorTier && (
                        <span className={`${styles.tierBadge} ${getTierClass(sponsor.sponsorTier)}`}>
                          {sponsor.sponsorTier}
                        </span>
                      )}
                      {hasBooth && (
                        <span className={styles.boothBadge}>
                          ブース {sponsor.boothNumber}
                        </span>
                      )}
                      {sponsor.locationJa && (
                        <span className={styles.locationBadge}>
                          📍 {isJa ? sponsor.locationJa : (sponsor.locationEn || sponsor.locationJa)}
                        </span>
                      )}
                    </div>

                    <h2 className={styles.sponsorName}>
                      {isJa ? sponsor.nameJa : sponsor.nameEn}
                    </h2>

                    {(sponsor.shortDescJa || sponsor.descriptionJa) && (
                      <p className={styles.sponsorShortDesc}>
                        {isJa
                          ? (sponsor.shortDescJa || sponsor.descriptionJa)
                          : (sponsor.shortDescEn || sponsor.descriptionEn || sponsor.shortDescJa || sponsor.descriptionJa)}
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles.cardBottomActions} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.socialGroup}>
                    {sponsor.instagram && (
                      <a
                        href={sponsor.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.socialBtn} ${styles.instagramBg}`}
                        title="Instagram"
                        aria-label="Instagram"
                      >
                        <InstagramIcon size={15} />
                      </a>
                    )}
                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.socialBtn} ${styles.websiteBg}`}
                        title="Website"
                        aria-label="Website"
                      >
                        <Globe size={15} />
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {hasBooth ? (
                      <button
                        className={styles.btnShowMap}
                        onClick={() => onShowOnMap(sponsor.id)}
                      >
                        <MapPin size={13} />
                        <span>{isJa ? '地図で出店位置を見る' : 'View on Map'}</span>
                      </button>
                    ) : (
                      <button
                        className={styles.btnDetail}
                        onClick={() => setInspectSponsor(sponsor)}
                      >
                        <span>{isJa ? '詳細を見る' : 'Details'}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* スポンサー詳細モーダル (Bottom Sheet) */}
      {inspectSponsor && (
        <div className="modal-overlay" onClick={() => setInspectSponsor(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {inspectSponsor.sponsorTier && (
                  <span className={`${styles.tierBadge} ${getTierClass(inspectSponsor.sponsorTier)}`}>
                    {inspectSponsor.sponsorTier}
                  </span>
                )}
                {inspectSponsor.boothNumber && (
                  <span className={styles.boothBadge}>
                    ブース {inspectSponsor.boothNumber}
                  </span>
                )}
                {inspectSponsor.locationJa && (
                  <span className={styles.locationBadge}>
                    📍 {isJa ? inspectSponsor.locationJa : (inspectSponsor.locationEn || inspectSponsor.locationJa)}
                  </span>
                )}
              </div>
              <button
                className="icon-btn"
                style={{ background: '#f1f5f9', color: '#64748b', border: 'none' }}
                onClick={() => setInspectSponsor(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="sheet-body">
              {/* 動画または写真のメディア表示 */}
              {inspectSponsor.photoUrl && (
                <DetailMediaView
                  url={inspectSponsor.photoUrl}
                  alt={isJa ? inspectSponsor.nameJa : inspectSponsor.nameEn}
                />
              )}

              <h2 className="sheet-title" style={{ fontSize: '1.25rem', marginBottom: '12px' }}>
                {isJa ? inspectSponsor.nameJa : inspectSponsor.nameEn}
              </h2>

              {/* 出店場所 */}
              {(inspectSponsor.locationJa || inspectSponsor.locationEn) && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>
                    {isJa ? '出店場所' : 'Location'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    <MapPin size={15} style={{ color: '#004aad' }} />
                    <span>{isJa ? inspectSponsor.locationJa : inspectSponsor.locationEn}</span>
                  </div>
                </div>
              )}

              {/* 紹介文 */}
              {(inspectSponsor.descriptionJa || inspectSponsor.descriptionEn) && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
                    {isJa ? '紹介' : 'About'}
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.65', color: 'var(--color-text-main, #334155)', margin: 0, whiteSpace: 'pre-line' }}>
                    {isJa ? inspectSponsor.descriptionJa : (inspectSponsor.descriptionEn || inspectSponsor.descriptionJa)}
                  </p>
                </div>
              )}

              {/* 公式リンク・SNS */}
              {(inspectSponsor.instagram || inspectSponsor.website) && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
                    {isJa ? '公式リンク・SNS' : 'Links & Social'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {inspectSponsor.instagram && (
                      <a
                        href={inspectSponsor.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)',
                          color: '#ffffff',
                          padding: '8px 14px',
                          borderRadius: '9999px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <InstagramIcon size={16} />
                        <span>Instagram</span>
                        <ExternalLink size={12} style={{ opacity: 0.8 }} />
                      </a>
                    )}
                    {inspectSponsor.website && (
                      <a
                        href={inspectSponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#0284c7',
                          color: '#ffffff',
                          padding: '8px 14px',
                          borderRadius: '9999px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <Globe size={16} />
                        <span>{isJa ? '公式サイト' : 'Website'}</span>
                        <ExternalLink size={12} style={{ opacity: 0.8 }} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 下部アクションボタン */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {inspectSponsor.boothNumber ? (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '12px', background: '#004aad', borderColor: '#004aad' }}
                    onClick={() => {
                      const id = inspectSponsor.id;
                      setInspectSponsor(null);
                      onShowOnMap(id);
                    }}
                  >
                    <MapPin size={16} />
                    <span>{isJa ? '地図で出店位置を見る' : 'Show on Map'}</span>
                  </button>
                ) : (
                  (inspectSponsor.website || inspectSponsor.instagram) && (
                    <a
                      href={inspectSponsor.website || inspectSponsor.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '12px', textDecoration: 'none', justifyContent: 'center', background: '#004aad', borderColor: '#004aad' }}
                    >
                      <ExternalLink size={16} />
                      <span>{isJa ? '公式ページを開く' : 'Visit Website'}</span>
                    </a>
                  )
                )}

                <button
                  className="btn btn-outline"
                  style={{ padding: '12px 18px' }}
                  onClick={() => handleShare(inspectSponsor)}
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
