import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Stall, Facility } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getBoothCoordinates } from '../data/boothCoordinates';
import styles from './MapView.module.css';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  ArrowRight,
  X,
  Info,
  ShieldAlert,
  Coffee,
  Trash2,
  Baby,
  Calendar,
  Crosshair,
  Copy,
  Check
} from 'lucide-react';

function isLocalOrAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV) return true;
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
  const searchParams = new URLSearchParams(window.location.search);
  return (
    searchParams.get('admin') === 'true' ||
    searchParams.get('sync') === 'true' ||
    searchParams.get('settings') === 'true'
  );
}

interface MapViewProps {
  stalls: Stall[];
  facilities: Facility[];
  selectedStallId?: string | null;
  onSelectStall: (stall: Stall) => void;
  onClearSelectedStall?: () => void;
  onNavigateToStallList: (stallId?: string) => void;
  onNavigateToStage?: (stageArea?: 'stage' | 'outdoor') => void;
}

// 添付公式会場マップ画像の実寸解像度
const MAP_WIDTH = 954;
const MAP_HEIGHT = 1024;

export const MapView: React.FC<MapViewProps> = ({
  stalls,
  facilities,
  selectedStallId,
  onSelectStall,
  onClearSelectedStall,
  onNavigateToStallList,
  onNavigateToStage
}) => {
  const { lang, t } = useLanguage();
  const isJa = lang === 'ja';
  const showAdminTools = useMemo(() => isLocalOrAdmin(), []);

  // 座標測定モード（ローカル・管理画面のみ）
  const [isCoordMeasureMode, setIsCoordMeasureMode] = useState(false);
  const [measuredCoord, setMeasuredCoord] = useState<{ x: number; y: number } | null>(null);
  const [copiedType, setCopiedType] = useState<'both' | 'x' | 'y' | null>(null);
  const pointerDownClientRef = useRef<{ x: number; y: number } | null>(null);

  const handleCopyCoord = (text: string, type: 'both' | 'x' | 'y') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1800);
  };

  // フィルター
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // ズーム・パン状態
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // マルチタッチ（ピンチズーム）追跡用Ref
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartRef = useRef<{
    distance: number;
    scale: number;
    center: { x: number; y: number };
    position: { x: number; y: number };
  } | null>(null);

  // 選択中のアイテム（ストール、施設、ステージ）
  const [selectedItem, setSelectedItem] = useState<{
    type: 'stall' | 'facility' | 'stage';
    stall?: Stall;
    facility?: Facility;
    stageInfo?: {
      area: 'stage' | 'outdoor';
      titleJa: string;
      titleEn: string;
      descJa: string;
      descEn: string;
      locationJa: string;
      locationEn: string;
    };
  } | null>(null);

  // ブースの座標解決ヘルパー
  const getStallCoord = (stall: Stall) => {
    const boothCoord = getBoothCoordinates(stall.boothNumber);
    if (boothCoord) {
      return { x: boothCoord.x, y: boothCoord.y };
    }
    return { x: stall.mapX || 50, y: stall.mapY || 50 };
  };

  // 外部からの selectedStallId 変更検知（ストール一覧からのジャンプ）
  useEffect(() => {
    if (selectedStallId) {
      const found = stalls.find((s) => s.id === selectedStallId);
      if (found) {
        setSelectedItem({ type: 'stall', stall: found });
        const coord = getStallCoord(found);
        // マップ位置を自動センタリング＆少し拡大
        if (viewportRef.current) {
          const rect = viewportRef.current.getBoundingClientRect();
          const targetX = (coord.x / 100) * MAP_WIDTH;
          const targetY = (coord.y / 100) * MAP_HEIGHT;
          const newScale = 1.35;
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
      const initialScale = Math.min(rect.width / MAP_WIDTH, rect.height / MAP_HEIGHT) * 0.95;
      const validScale = Math.max(0.4, Math.min(1.0, initialScale));
      setScale(validScale);
      setPosition({
        x: (rect.width - MAP_WIDTH * validScale) / 2,
        y: (rect.height - MAP_HEIGHT * validScale) / 2
      });
    }
  }, []);

  // 2点間のユークリッド距離
  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  };

  // 2点間の中心座標
  const getCenter = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  };

  // パン & ピンチ操作（マルチタッチ対応）
  const handlePointerDown = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      // 1本指: ドラッグ開始
      setIsDragging(true);
      pointerDownClientRef.current = { x: e.clientX, y: e.clientY };
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      pinchStartRef.current = null;
    } else if (activePointersRef.current.size === 2) {
      // 2本指: ピンチズーム開始
      setIsDragging(false);
      pointerDownClientRef.current = null;
      const pointers = Array.from(activePointersRef.current.values());
      const dist = getDistance(pointers[0], pointers[1]);
      const center = getCenter(pointers[0], pointers[1]);
      pinchStartRef.current = {
        distance: Math.max(dist, 1),
        scale: scale,
        center: center,
        position: { ...position }
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2 && pinchStartRef.current) {
      // 2本指ピンチズーム処理
      const pointers = Array.from(activePointersRef.current.values());
      const currentDist = getDistance(pointers[0], pointers[1]);
      const currentCenter = getCenter(pointers[0], pointers[1]);

      const scaleFactor = currentDist / pinchStartRef.current.distance;
      const newScale = Math.min(Math.max(0.4, pinchStartRef.current.scale * scaleFactor), 3.0);

      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        // ピンチ開始時の中心点のビューポート相対座標
        const startCenterX = pinchStartRef.current.center.x - rect.left;
        const startCenterY = pinchStartRef.current.center.y - rect.top;

        // ピンチ開始時のキャンバス上の点
        const canvasX = (startCenterX - pinchStartRef.current.position.x) / pinchStartRef.current.scale;
        const canvasY = (startCenterY - pinchStartRef.current.position.y) / pinchStartRef.current.scale;

        // 現在の中心点のビューポート相対座標
        const currCenterX = currentCenter.x - rect.left;
        const currCenterY = currentCenter.y - rect.top;

        // 新しい position（ピンチ中心を維持した拡大縮小＋指の移動に追従）
        const newPosX = currCenterX - canvasX * newScale;
        const newPosY = currCenterY - canvasY * newScale;

        setScale(Number(newScale.toFixed(3)));
        setPosition({ x: newPosX, y: newPosY });
      }
    } else if (activePointersRef.current.size === 1 && isDragging) {
      // 1本指ドラッグ処理
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size === 1) {
      // 2本指から1本指に戻った場合、残った指でドラッグを再開
      setIsDragging(true);
      pinchStartRef.current = null;
      const remainingPointer = Array.from(activePointersRef.current.values())[0];
      dragStartRef.current = {
        x: remainingPointer.x - position.x,
        y: remainingPointer.y - position.y
      };
    } else if (activePointersRef.current.size === 0) {
      // 座標測定モード時、ドラッグではなくクリック（移動距離6px未満）であれば座標を計算
      if (isCoordMeasureMode && pointerDownClientRef.current && viewportRef.current) {
        const moveDist = Math.hypot(
          e.clientX - pointerDownClientRef.current.x,
          e.clientY - pointerDownClientRef.current.y
        );
        if (moveDist < 6) {
          const rect = viewportRef.current.getBoundingClientRect();
          const canvasX = (e.clientX - rect.left - position.x) / scale;
          const canvasY = (e.clientY - rect.top - position.y) / scale;
          const pctX = Number(Math.max(0, Math.min(100, (canvasX / MAP_WIDTH) * 100)).toFixed(1));
          const pctY = Number(Math.max(0, Math.min(100, (canvasY / MAP_HEIGHT) * 100)).toFixed(1));
          setMeasuredCoord({ x: pctX, y: pctY });
        }
      }
      pointerDownClientRef.current = null;
      setIsDragging(false);
      pinchStartRef.current = null;
    }
  };

  // マウスホイール / トラックパッド ズーム処理
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      setScale((prevScale) => {
        const newScale = Math.min(Math.max(0.4, prevScale * zoomFactor), 3.0);
        setPosition((prevPos) => {
          const canvasX = (mouseX - prevPos.x) / prevScale;
          const canvasY = (mouseY - prevPos.y) / prevScale;
          return {
            x: mouseX - canvasX * newScale,
            y: mouseY - canvasY * newScale
          };
        });
        return Number(newScale.toFixed(3));
      });
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', onWheel);
    };
  }, []);

  // ズーム操作
  const handleZoom = (delta: number) => {
    setScale((prev) => {
      const next = Math.min(Math.max(0.4, prev + delta), 2.8);
      return Number(next.toFixed(2));
    });
  };

  const handleReset = () => {
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const initialScale = Math.min(rect.width / MAP_WIDTH, rect.height / MAP_HEIGHT) * 0.95;
      const validScale = Math.max(0.4, Math.min(1.0, initialScale));
      setScale(validScale);
      setPosition({
        x: (rect.width - MAP_WIDTH * validScale) / 2,
        y: (rect.height - MAP_HEIGHT * validScale) / 2
      });
    }
  };

  // フィルタリング (ブース番号がないスポンサーは出店しないためマップピンから除外)
  const filteredStalls = stalls.filter((stall) => {
    if (stall.category === 'sponsor' && !stall.boothNumber) {
      return false;
    }
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
      case 'kids':
      case 'kids_activity':
        return styles.pinKids;
      case 'art':
      case 'art_exhibition':
        return styles.pinArt;
      default:
        return styles.pinMarket || styles.pinCraft;
    }
  };

  const getPinTheme = (category: Stall['category']): { bg: string; color: string } => {
    switch (category) {
      case 'sponsor':
        return { bg: '#004aad', color: '#ffffff' };
      case 'market':
      case 'craft':
      case 'goods':
        return { bg: '#ffbd59', color: '#1e293b' };
      case 'paid_workshop':
      case 'workshop':
        return { bg: '#f08283', color: '#ffffff' };
      case 'free_workshop':
        return { bg: '#5ce1e6', color: '#1e293b' };
      case 'food':
        return { bg: '#7ed957', color: '#1e293b' };
      case 'kids':
      case 'kids_activity':
        return { bg: '#ffde59', color: '#1e293b' };
      case 'art':
      case 'art_exhibition':
        return { bg: '#e2a9f1', color: '#1e293b' };
      default:
        return { bg: '#ffbd59', color: '#1e293b' };
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
            className={`${styles.filterChip} ${filterCategory === 'kids' ? styles.filterChipActive : ''}`}
            onClick={() => setFilterCategory('kids')}
          >
            🎈 {t('map.filter_kids')}
          </button>
          <button
            className={`${styles.filterChip} ${filterCategory === 'art' ? styles.filterChipActive : ''}`}
            onClick={() => setFilterCategory('art')}
          >
            🖼️ {t('map.filter_art')}
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
        {showAdminTools && (
          <button
            className={styles.controlBtn}
            style={
              isCoordMeasureMode
                ? {
                    background: '#d81e35',
                    color: '#ffffff',
                    borderColor: '#d81e35',
                    boxShadow: '0 4px 12px rgba(216, 30, 53, 0.35)'
                  }
                : undefined
            }
            onClick={() => {
              setIsCoordMeasureMode((prev) => {
                const next = !prev;
                if (!next) setMeasuredCoord(null);
                return next;
              });
            }}
            title={isJa ? '座標測定モード（クリック地点のマップX/Yを取得）' : 'Coordinate Picker Mode'}
            aria-label="Coordinate picker mode"
          >
            <Crosshair size={18} />
          </button>
        )}
      </div>

      {/* 管理者用：座標測定パネル */}
      {showAdminTools && isCoordMeasureMode && (
        <div
          style={{
            position: 'absolute',
            top: '54px',
            left: '8px',
            right: '8px',
            zIndex: 35,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.76rem',
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            border: '1px solid rgba(253, 224, 71, 0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#fde047', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Crosshair size={14} />
              {isJa ? '座標測定モード' : 'Coord Picker'}
            </span>
            {measuredCoord ? (
              <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.84rem', background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                マップX: <strong style={{ color: '#38bdf8' }}>{measuredCoord.x}</strong> / マップY: <strong style={{ color: '#38bdf8' }}>{measuredCoord.y}</strong>
              </span>
            ) : (
              <span style={{ color: '#cbd5e1' }}>
                {isJa ? 'マップ上の任意の場所をクリックしてください' : 'Click anywhere on the map'}
              </span>
            )}
          </div>

          {measuredCoord && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleCopyCoord(`${measuredCoord.x}\t${measuredCoord.y}`, 'both')}
                style={{
                  background: '#fde047',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="スプレッドシートの隣り合うX・Y列にそのまま貼り付けできます"
              >
                {copiedType === 'both' ? <Check size={12} /> : <Copy size={12} />}
                {copiedType === 'both' ? 'コピー済' : 'X・Y両方コピー (シート貼付用)'}
              </button>
              <button
                onClick={() => handleCopyCoord(String(measuredCoord.x), 'x')}
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copiedType === 'x' ? '✓ Xコピー済' : `X (${measuredCoord.x})`}
              </button>
              <button
                onClick={() => handleCopyCoord(String(measuredCoord.y), 'y')}
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copiedType === 'y' ? '✓ Yコピー済' : `Y (${measuredCoord.y})`}
              </button>
            </div>
          )}
        </div>
      )}

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
          {/* 公式会場マップ画像 */}
          <img
            src="/venue-map.png"
            alt="JCAF Venue Map"
            className={styles.mapImage}
            draggable={false}
          />

          {/* --- メインステージ タップゾーン --- */}
          <div
            className={styles.pinContainer}
            style={{ left: '52.4%', top: '40.8%' }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem({
                type: 'stage',
                stageInfo: {
                  area: 'stage',
                  titleJa: 'メインホール ステージ (Stage Performance & Workshop)',
                  titleEn: 'Main Hall Stage (Stage Performance & Workshop)',
                  descJa: 'Collingwood Town Hall メインホール特設ステージ。和太鼓、伝統舞踊、武道演武、音楽ライブを開催！',
                  descEn: 'Collingwood Town Hall Main Stage featuring Taiko drumming, traditional dance, martial arts and live music!',
                  locationJa: 'Collingwood Town Hall (Main Hall)',
                  locationEn: 'Collingwood Town Hall (Main Hall)'
                }
              });
            }}
            title={isJa ? 'タップしてステージ情報を確認' : 'Tap for Main Stage info'}
          >
            <div
              style={{
                background: '#e9cc97',
                color: '#1e293b',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                border: '1.5px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap'
              }}
            >
              🎤 {isJa ? 'ステージ' : 'Stage'}
            </div>
          </div>

          {/* --- アウトドアパフォーマンス タップゾーン --- */}
          <div
            className={styles.pinContainer}
            style={{ left: '86.9%', top: '75.4%' }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem({
                type: 'stage',
                stageInfo: {
                  area: 'outdoor',
                  titleJa: 'アウトドアパフォーマンス (Outdoor Performance)',
                  titleEn: 'Outdoor Performance Area',
                  descJa: 'Town Hall Reserve（公園）野外芝生エリア。開放的な屋外でのストリートパフォーマンス、太鼓、大道芸をお届け！',
                  descEn: 'Town Hall Reserve outdoor lawn area with exciting open-air street performances, taiko and entertainment!',
                  locationJa: 'Town Hall Reserve (Park)',
                  locationEn: 'Town Hall Reserve (Park)'
                }
              });
            }}
            title={isJa ? 'タップしてアウトドアパフォーマンス情報を確認' : 'Tap for Outdoor Performance info'}
          >
            <div
              style={{
                background: '#e9cc97',
                color: '#1e293b',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                border: '1.5px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap'
              }}
            >
              🌳 {isJa ? '屋外演目' : 'Outdoor'}
            </div>
          </div>

          {/* --- 出店ブースピン --- */}
          {filteredStalls.map((stall) => {
            const isSelected = selectedItem?.stall?.id === stall.id;
            const coord = getStallCoord(stall);

            return (
              <div
                key={stall.id}
                className={`${styles.pinContainer} ${isSelected ? styles.pinSelected : ''}`}
                style={{
                  left: `${coord.x}%`,
                  top: `${coord.y}%`
                }}
                onClick={(e) => {
                  if (isCoordMeasureMode) return;
                  e.stopPropagation();
                  setSelectedItem({ type: 'stall', stall });
                  onSelectStall(stall);
                }}
              >
                {/* 選択時のパルスリング */}
                {isSelected && <div className={styles.pulseRing} />}
                <div className={`${styles.stallPin} ${getPinClass(stall.category)}`}>
                  {stall.boothNumber || '•'}
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
                    if (isCoordMeasureMode) return;
                    e.stopPropagation();
                    setSelectedItem({ type: 'facility', facility: fac });
                  }}
                >
                  <div className={styles.facilityPin}>
                    {renderFacilityIcon(fac.type)}
                  </div>
                </div>
              );
            })}

          {/* --- 座標測定モード時のターゲットマーカー --- */}
          {showAdminTools && isCoordMeasureMode && measuredCoord && (
            <div
              className={styles.pinContainer}
              style={{
                left: `${measuredCoord.x}%`,
                top: `${measuredCoord.y}%`,
                zIndex: 50,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'rgba(216, 30, 53, 0.9)',
                  border: '2.5px solid #fde047',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}
              >
                <Crosshair size={15} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 選択中のアイテム詳細カード（ボトムポップアップシート） */}
      {selectedItem && (
        <div className={styles.detailPopup}>
          <button
            className={styles.closeDetailBtn}
            onClick={() => {
              setSelectedItem(null);
              if (onClearSelectedStall) onClearSelectedStall();
            }}
            aria-label="Close details"
          >
            <X size={18} />
          </button>

          {selectedItem.type === 'stall' && selectedItem.stall && (() => {
            const pinTheme = getPinTheme(selectedItem.stall.category);
            return (
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
                  <span
                    className={styles.detailBoothBadge}
                    style={{
                      backgroundColor: pinTheme.bg,
                      color: pinTheme.color,
                      border: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
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
                    className="btn"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.78rem',
                      backgroundColor: pinTheme.bg,
                      color: pinTheme.color,
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                    }}
                    onClick={() => onNavigateToStallList(selectedItem.stall?.id)}
                  >
                    {t('stalls.details')} <ArrowRight size={13} />
                  </button>
                </div>
              </>
            );
          })()}

          {selectedItem.type === 'facility' && selectedItem.facility && (
            <>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {renderFacilityIcon(selectedItem.facility.type)}
              </div>
              <div className={styles.detailInfo}>
                <span
                  className={styles.detailBoothBadge}
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {isJa ? '施設案内' : 'Facility'}
                </span>
                <h3 className={styles.detailTitle}>
                  {isJa ? selectedItem.facility.nameJa : selectedItem.facility.nameEn}
                </h3>
                <p className={styles.detailDesc}>
                  {isJa ? selectedItem.facility.descJa : selectedItem.facility.descEn}
                </p>
              </div>
            </>
          )}

          {selectedItem.type === 'stage' && selectedItem.stageInfo && (
            <>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: '#e9cc97',
                  color: '#1e293b',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '1.2rem'
                }}
              >
                🎭
              </div>
              <div className={styles.detailInfo}>
                <span
                  className={styles.detailBoothBadge}
                  style={{
                    backgroundColor: '#e9cc97',
                    color: '#1e293b',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                >
                  📍 {isJa ? selectedItem.stageInfo.locationJa : selectedItem.stageInfo.locationEn}
                </span>
                <h3 className={styles.detailTitle}>
                  {isJa ? selectedItem.stageInfo.titleJa : selectedItem.stageInfo.titleEn}
                </h3>
                <p className={styles.detailDesc}>
                  {isJa ? selectedItem.stageInfo.descJa : selectedItem.stageInfo.descEn}
                </p>
              </div>

              {onNavigateToStage && (
                <div className={styles.detailActions}>
                  <button
                    className="btn"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap',
                      backgroundColor: '#e9cc97',
                      color: '#1e293b',
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                    }}
                    onClick={() => onNavigateToStage(selectedItem.stageInfo?.area)}
                  >
                    <Calendar size={13} style={{ marginRight: '4px' }} />
                    {isJa ? '演目一覧' : 'Timetable'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
