import React, { useState, useRef, useEffect } from 'react';
import type { Stall, Facility } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import styles from './MapView.module.css';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Heart,
  ArrowRight,
  X,
  Info,
  ShieldAlert,
  Coffee,
  Trash2,
  Baby
} from 'lucide-react';

interface MapViewProps {
  stalls: Stall[];
  facilities: Facility[];
  selectedStallId?: string | null;
  onSelectStall: (stall: Stall) => void;
  onClearSelectedStall?: () => void;
  onNavigateToStallList: (stallId?: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  stalls,
  facilities,
  selectedStallId,
  onSelectStall,
  onClearSelectedStall,
  onNavigateToStallList
}) => {
  const { lang, t } = useLanguage();
  const { isStallFavorite, toggleFavoriteStall } = useFavorites();
  const isJa = lang === 'ja';

  // フィルター
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // ズーム・パン状態
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // 選択中のアイテム（ストールまたは施設）
  const [selectedItem, setSelectedItem] = useState<{
    type: 'stall' | 'facility';
    stall?: Stall;
    facility?: Facility;
  } | null>(null);

  // 外部からの selectedStallId 変更検知（ストール一覧からのジャンプ）
  useEffect(() => {
    if (selectedStallId) {
      const found = stalls.find((s) => s.id === selectedStallId);
      if (found) {
        setSelectedItem({ type: 'stall', stall: found });
        // マップ位置を自動センタリング＆少し拡大
        if (viewportRef.current) {
          const rect = viewportRef.current.getBoundingClientRect();
          const targetX = (found.mapX / 100) * 1000;
          const targetY = (found.mapY / 100) * 750;
          const newScale = 1.4;
          setScale(newScale);
          setPosition({
            x: rect.width / 2 - targetX * newScale,
            y: rect.height / 2 - targetY * newScale
          });
        }
      }
    }
  }, [selectedStallId, stalls]);

  // 初期センタリング
  useEffect(() => {
    if (viewportRef.current && !selectedStallId) {
      const rect = viewportRef.current.getBoundingClientRect();
      const initialScale = Math.min(rect.width / 1000, rect.height / 750) * 0.95;
      const validScale = Math.max(0.6, Math.min(1.0, initialScale));
      setScale(validScale);
      setPosition({
        x: (rect.width - 1000 * validScale) / 2,
        y: (rect.height - 750 * validScale) / 2
      });
    }
  }, []);

  // パン操作（マウス・タッチ共通）
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // ズーム操作
  const handleZoom = (delta: number) => {
    setScale((prev) => {
      const next = Math.min(Math.max(0.6, prev + delta), 2.5);
      return Number(next.toFixed(2));
    });
  };

  const handleReset = () => {
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const initialScale = Math.min(rect.width / 1000, rect.height / 750) * 0.95;
      const validScale = Math.max(0.6, Math.min(1.0, initialScale));
      setScale(validScale);
      setPosition({
        x: (rect.width - 1000 * validScale) / 2,
        y: (rect.height - 750 * validScale) / 2
      });
    }
  };

  // フィルタリング
  const filteredStalls = stalls.filter((stall) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'facility') return false;
    return stall.category === filterCategory;
  });

  const showFacilities = filterCategory === 'all' || filterCategory === 'facility';

  // 施設アイコンレンダラー
  const renderFacilityIcon = (type: Facility['type']) => {
    switch (type) {
      case 'entrance':
        return <Navigation size={13} />;
      case 'info':
        return <Info size={13} />;
      case 'firstaid':
        return <ShieldAlert size={13} />;
      case 'toilet':
        return <span style={{ fontSize: '10px', fontWeight: 'bold' }}>WC</span>;
      case 'food_court':
        return <Coffee size={13} />;
      case 'trash':
        return <Trash2 size={13} />;
      case 'nursing':
        return <Baby size={13} />;
      default:
        return <Info size={13} />;
    }
  };

  const getPinClass = (category: Stall['category']) => {
    switch (category) {
      case 'market':
      case 'craft':
      case 'goods':
        return styles.pinMarket || styles.pinCraft;
      case 'sponsor':
        return styles.pinSponsor;
      case 'paid_workshop':
      case 'workshop':
        return styles.pinPaidWorkshop || styles.pinWorkshop;
      case 'free_workshop':
        return styles.pinFreeWorkshop;
      case 'food':
        return styles.pinFood;
      default:
        return styles.pinMarket || styles.pinCraft;
    }
  };

  return (
    <div className={styles.mapContainer}>
      {/* ツールバー（カテゴリフィルター） */}
      <div className={styles.mapToolbar}>
        <div className={styles.filterScroll}>
          <button
            className={`${styles.filterChip} ${filterCategory === 'all' ? styles.filterChipActive : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            {t('map.filter_all')}
          </button>
          <button
            className={`${styles.filterChip} ${filterCategory === 'market' ? styles.filterChipActive : ''}`}
            onClick={() => setFilterCategory('market')}
          >
            🛍️ {t('map.filter_market')}
          </button>
          <button
            className={`${styles.filterChip} ${filterCategory === 'sponsor' ? styles.filterChipActive : ''}`}
            onClick={() => setFilterCategory('sponsor')}
          >
            🏢 {t('map.filter_sponsor')}
          </button>
          <button
            className={`${styles.filterChip} ${filterCategory === 'paid_workshop' ? styles.filterChipActive : ''}`}
            onClick={() => setFilterCategory('paid_workshop')}
          >
            🎨 {t('map.filter_paid_workshop')}
          </button>
          <button
            className={`${styles.filterChip} ${filterCategory === 'free_workshop' ? styles.filterChipActive : ''}`}
            onClick={() => setFilterCategory('free_workshop')}
          >
            🖌️ {t('map.filter_free_workshop')}
          </button>
          <button
            className={`${styles.filterChip} ${filterCategory === 'food' ? styles.filterChipActive : ''}`}
            onClick={() => setFilterCategory('food')}
          >
            🍱 {t('map.filter_food')}
          </button>
          <button
            className={`${styles.filterChip} ${filterCategory === 'facility' ? styles.filterChipActive : ''}`}
            onClick={() => setFilterCategory('facility')}
          >
            🚻 {t('map.filter_facility')}
          </button>
        </div>
      </div>

      {/* ズーム & リセット コントロール */}
      <div className={styles.mapControls}>
        <button
          className={styles.controlBtn}
          onClick={() => handleZoom(0.25)}
          title={t('map.zoom_in')}
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button
          className={styles.controlBtn}
          onClick={() => handleZoom(-0.25)}
          title={t('map.zoom_out')}
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          className={styles.controlBtn}
          onClick={handleReset}
          title={t('map.reset')}
          aria-label="Reset map"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* ビューポート（ドラッグ操作エリア） */}
      <div
        ref={viewportRef}
        className={styles.mapViewport}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className={styles.mapCanvas}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
          }}
        >
          {/* ベース会場マップSVG（和風フェスティバル庭園マップ） */}
          <svg
            viewBox="0 0 1000 750"
            width="1000"
            height="750"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              {/* 背景テクスチャ */}
              <pattern id="tatami-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ede7db" strokeWidth="0.8" />
              </pattern>
              {/* 池のグラデーション */}
              <linearGradient id="pondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>
              {/* メインステージの屋根 */}
              <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#881337" />
                <stop offset="100%" stopColor="#4c0519" />
              </linearGradient>
            </defs>

            {/* 会場敷地背景 */}
            <rect width="1000" height="750" fill="#f4efe6" />
            <rect width="1000" height="750" fill="url(#tatami-grid)" opacity="0.6" />

            {/* 外郭・白壁と木々 */}
            <rect x="20" y="20" width="960" height="710" rx="20" fill="#faf7f0" stroke="#d5cbb8" strokeWidth="3" />

            {/* 芝生エリア・緑地 */}
            <path
              d="M 200 120 Q 500 80 800 120 Q 880 300 850 500 Q 750 650 450 630 Q 150 620 120 450 Q 100 250 200 120 Z"
              fill="#e2edd9"
              opacity="0.85"
            />

            {/* 園路・玉砂利・石畳アプローチ */}
            {/* メインゲートからの大通り */}
            <path
              d="M 120 680 Q 250 520 500 480 Q 750 480 880 350"
              fill="none"
              stroke="#dcd2bf"
              strokeWidth="50"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 中央サークル広場 */}
            <circle cx="500" cy="480" r="90" fill="#e8dfce" stroke="#cfc1a8" strokeWidth="3" strokeDasharray="6 4" />

            {/* 庭園の池（Shinji-ike / 心字池） */}
            <path
              d="M 380 520 C 440 500, 480 540, 520 530 C 580 520, 620 580, 580 620 C 530 660, 420 650, 360 600 C 330 570, 340 530, 380 520 Z"
              fill="url(#pondGrad)"
              stroke="#38bdf8"
              strokeWidth="2"
              opacity="0.9"
            />
            {/* 太鼓橋 */}
            <path d="M 450 530 Q 470 515 490 530" stroke="#c23b22" strokeWidth="6" fill="none" strokeLinecap="round" />

            {/* 庭園の松と桜のシンボル */}
            <g opacity="0.7">
              <circle cx="280" cy="160" r="14" fill="#a7f3d0" />
              <circle cx="290" cy="150" r="10" fill="#6ee7b7" />
              <circle cx="720" cy="180" r="16" fill="#fbcfe8" />
              <circle cx="735" cy="170" r="12" fill="#f472b6" />
              <circle cx="680" cy="620" r="15" fill="#a7f3d0" />
              <circle cx="200" cy="420" r="18" fill="#a7f3d0" />
            </g>

            {/* --- 建造物エリア --- */}

            {/* メインステージ「雅 (Miyabi)」 */}
            <g transform="translate(410, 60)">
              <rect x="0" y="0" width="180" height="95" rx="8" fill="url(#roofGrad)" stroke="#d4af37" strokeWidth="2.5" />
              <rect x="15" y="15" width="150" height="65" rx="4" fill="#1e293b" />
              {/* ステージ照明・舞台演出 */}
              <circle cx="90" cy="47" r="24" fill="#f59e0b" opacity="0.25" />
              <text x="90" y="44" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                STAGE
              </text>
              <text x="90" y="62" fill="#d4af37" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                {isJa ? 'ステージ' : 'Main Stage'}
              </text>
              {/* 観覧席エリアマーク */}
              <rect x="-20" y="105" width="220" height="60" rx="6" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="90" y="138" fill="#64748b" fontSize="10" textAnchor="middle">
                {isJa ? '観覧芝生エリア' : 'Lawn Viewing Area'}
              </text>
            </g>

            {/* アウトドアパフォーマンス */}
            <g transform="translate(60, 240)">
              <rect x="0" y="0" width="160" height="80" rx="8" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
              <rect x="8" y="8" width="144" height="64" rx="4" fill="#0f172a" />
              <text x="80" y="36" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                OUTDOOR PERFORMANCE
              </text>
              <text x="80" y="54" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="serif">
                {isJa ? 'アウトドアパフォーマンス' : 'Outdoor Area'}
              </text>
            </g>

            {/* 正門メインエントランス */}
            <g transform="translate(60, 640)">
              <rect x="0" y="0" width="130" height="50" rx="6" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
              <text x="65" y="28" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                {isJa ? '⛩️ 正門・入口' : '⛩️ Main Entrance'}
              </text>
              <text x="65" y="42" fill="#cbd5e1" fontSize="9" textAnchor="middle">
                GATE & INFO
              </text>
            </g>

            {/* 芝生飲食・憩い広場 */}
            <g transform="translate(420, 380)">
              <rect x="0" y="0" width="160" height="70" rx="10" fill="#fef3c7" opacity="0.6" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="80" y="35" fill="#92400e" fontSize="11" fontWeight="bold" textAnchor="middle">
                🍱 {isJa ? '憩いの飲食芝生エリア' : 'Picnic & Dining Lawn'}
              </text>
              <text x="80" y="52" fill="#b45309" fontSize="9" textAnchor="middle">
                {isJa ? 'ベンチ・日よけテント設置' : 'Shaded tables & seating'}
              </text>
            </g>

            {/* エリア案内看板ラベル */}
            <g opacity="0.65" fontFamily="sans-serif" fontSize="11" fontWeight="bold" fill="#475569">
              <text x="320" y="275">◀ WORKSHOP AREA</text>
              <text x="500" y="275">CRAFT & ART AREA ▶</text>
              <text x="470" y="715">▲ FOOD & SAKE STREET ▲</text>
            </g>
          </svg>

          {/* --- SVGオーバーレイ（出店ストールピン） --- */}
          {filteredStalls.map((stall) => {
            const isSelected = selectedItem?.stall?.id === stall.id;
            return (
              <div
                key={stall.id}
                className={`${styles.pinContainer} ${isSelected ? styles.pinSelected : ''}`}
                style={{
                  left: `${stall.mapX}%`,
                  top: `${stall.mapY}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem({ type: 'stall', stall });
                  onSelectStall(stall);
                }}
              >
                {/* 選択時のパルスリング */}
                {isSelected && <div className={styles.pulseRing} />}
                <div className={`${styles.stallPin} ${getPinClass(stall.category)}`}>
                  {stall.boothNumber}
                </div>
              </div>
            );
          })}

          {/* --- 施設ピン --- */}
          {showFacilities &&
            facilities.map((fac) => {
              const isSelected = selectedItem?.facility?.id === fac.id;
              return (
                <div
                  key={fac.id}
                  className={`${styles.pinContainer} ${isSelected ? styles.pinSelected : ''}`}
                  style={{
                    left: `${fac.mapX}%`,
                    top: `${fac.mapY}%`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'facility', facility: fac });
                  }}
                >
                  {isSelected && <div className={styles.pulseRing} />}
                  <div className={styles.facilityPin}>
                    {renderFacilityIcon(fac.type)}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* --- ピンタップ時の下部ボトム詳細カード --- */}
      {selectedItem && (
        <div className={styles.detailBottomCard} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.closeCardBtn}
            onClick={() => {
              setSelectedItem(null);
              if (onClearSelectedStall) onClearSelectedStall();
            }}
            aria-label="Close card"
          >
            <X size={18} />
          </button>

          {selectedItem.type === 'stall' && selectedItem.stall && (
            <>
              {selectedItem.stall.imageUrl && (
                <img
                  src={selectedItem.stall.imageUrl}
                  alt={isJa ? selectedItem.stall.nameJa : selectedItem.stall.nameEn}
                  className={styles.detailThumbnail}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <div className={styles.detailInfo}>
                <span className={styles.detailBoothBadge}>
                  {selectedItem.stall.boothNumber} · {isJa ? selectedItem.stall.categoryJa : selectedItem.stall.categoryEn}
                  {(selectedItem.stall.locationJa || selectedItem.stall.locationEn) && ` · 📍${isJa ? selectedItem.stall.locationJa : selectedItem.stall.locationEn}`}
                </span>
                <h3 className={styles.detailTitle}>
                  {isJa ? selectedItem.stall.nameJa : selectedItem.stall.nameEn}
                </h3>
                <p className={styles.detailDesc}>
                  {isJa ? selectedItem.stall.shortDescJa : selectedItem.stall.shortDescEn}
                </p>
              </div>

              <div className={styles.detailActions}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  onClick={() => onNavigateToStallList(selectedItem.stall?.id)}
                >
                  {t('stalls.details')} <ArrowRight size={13} />
                </button>
                <button
                  className={`btn ${isStallFavorite(selectedItem.stall.id) ? 'btn-accent' : 'btn-outline'}`}
                  style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                  onClick={() => toggleFavoriteStall(selectedItem.stall!.id)}
                  title="Bookmark"
                >
                  <Heart
                    size={14}
                    fill={isStallFavorite(selectedItem.stall.id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </>
          )}

          {selectedItem.type === 'facility' && selectedItem.facility && (
            <div className={styles.detailInfo} style={{ paddingRight: '20px' }}>
              <span className="badge-category badge-facility">
                {isJa ? '施設・インフォ' : 'Facility Info'}
              </span>
              <h3 className={styles.detailTitle} style={{ marginTop: '4px' }}>
                {isJa ? selectedItem.facility.nameJa : selectedItem.facility.nameEn}
              </h3>
              <p className={styles.detailDesc}>
                {isJa ? selectedItem.facility.descJa : selectedItem.facility.descEn}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
