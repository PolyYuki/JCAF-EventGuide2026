import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';

/**
 * URLからGoogle DriveのファイルIDを抽出
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) return fileMatch[1];
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
  const dMatch = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];
  return null;
}

/**
 * YouTube URLから動画IDを抽出
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Vimeo URLから動画IDを抽出
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /vimeo\.com\/(?:video\/)?(\d+)/
  );
  return match ? match[1] : null;
}

/**
 * 拡張子から直接動画ファイルであるかを判定
 */
export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url.trim());
}

/**
 * 判明しているGoogle Drive動画ファイルID一覧（スプレッドシート上の動画）
 */
export const KNOWN_DRIVE_VIDEOS = new Set([
  '1alVEMP7UT_sw4TV4NBd3JHpCRGfClRYU', // Japan Homes (Video 001 AUS.mp4)
  '1U-GqDvmJGSvCE6VRknMBp0gPKNxPzhzC', // Nagomi&Co (会社PR.mov)
  '1cHZoRKc5AQUF5asclOGmQNKIkod02v4H', // Hosaku Hojicha (B-Roll Promotional Video.mp4)
  '15atto9tD_cHy9Pw7kEiIPeM_F3sVvTWW', // Ezy Tax Solutions (60sec.mp4)
  '1ndTGbnsCBiYPSBJhxhS76xaYpzsmUjrk', // Ezy Tax Solutions (旧ID)
  '1BEvUhqTc-RpCoCed0MEawhXJWQLt2-ry', // Littles Lawyers (Motor_Claim_EN.mov)
  '1hcXRFm9KrQdULmf2N1bwtLNr2NDPq0B9', // TALEWIND WORKS (WonderAir_会場用.mp4)
  '1q7qsRqhuB-KGsHglrxRhc-iC_zGwgGm2', // いすゞ (Isuzu Australia branding video.mp4)
]);

/**
 * スマホ（iOS Safari等）でも高速・確実にインライン再生できるよう最適化済みのGoogle Drive動画マップ
 */
export const LOCAL_DRIVE_VIDEOS: Record<string, string> = {
  '1ndTGbnsCBiYPSBJhxhS76xaYpzsmUjrk': '/videos/ezy-tax-solutions.mp4',
  '15atto9tD_cHy9Pw7kEiIPeM_F3sVvTWW': '/videos/ezy-tax-solutions.mp4'
};

/**
 * 秒数を 0:00 形式にフォーマット
 */
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * スマホでも確実に一時停止・再生できるカスタムビデオプレイヤー（<video>用）
 */
const CustomNativeVideoPlayer: React.FC<{
  src: string;
  poster?: string;
  alt: string;
  wrapperClassName?: string;
  defaultWrapperStyle: React.CSSProperties;
}> = ({ src, poster, alt, wrapperClassName, defaultWrapperStyle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleRestart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const newTime = Number(e.target.value);
    v.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) {
      v.requestFullscreen().catch(() => {});
    } else if ((v as any).webkitEnterFullscreen) {
      (v as any).webkitEnterFullscreen();
    }
  };

  return (
    <div
      className={wrapperClassName}
      style={{
        ...defaultWrapperStyle,
        padding: '0',
        background: '#0f172a',
        marginBottom: '14px',
        position: 'relative'
      }}
    >
      {/* ビデオ本体（タップで一時停止/再生） */}
      <div
        style={{ position: 'relative', width: '100%', cursor: 'pointer', background: '#000' }}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          aria-label={alt}
          title={alt}
          playsInline
          autoPlay
          muted
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || 0);
            }
          }}
          style={{
            width: '100%',
            maxHeight: '340px',
            display: 'block'
          }}
        />

        {/* 一時停止中の中央オーバーレイアイコン */}
        {!isPlaying && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none'
            }}
          >
            <Play size={28} style={{ marginLeft: '3px' }} />
          </div>
        )}
      </div>

      {/* 常時表示されるカスタム操作バー（一時停止ボタンを確実に提供） */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '8px 10px',
          background: '#0f172a',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* シークバー */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              height: '5px',
              accentColor: '#004aad',
              cursor: 'pointer'
            }}
            aria-label="Seek video"
          />
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* ボタン群（一時停止・再生・音声・最初から・全画面） */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* メインの一時停止 / 再生ボタン（誰でも分かるラベル付き） */}
            <button
              onClick={togglePlay}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: isPlaying ? '#dc2626' : '#004aad',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
              title={isPlaying ? '動画を一時停止' : '動画を再生'}
            >
              {isPlaying ? (
                <>
                  <Pause size={14} />
                  <span>一時停止</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>再生</span>
                </>
              )}
            </button>

            {/* 最初から再生ボタン */}
            <button
              onClick={handleRestart}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="最初から再生"
            >
              <RotateCcw size={13} />
              <span>最初から</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 音声ミュートトグルボタン */}
            <button
              onClick={toggleMute}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title={isMuted ? 'ミュート解除（音声を出す）' : 'ミュートにする'}
            >
              {isMuted ? (
                <>
                  <VolumeX size={14} />
                  <span>消音</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} />
                  <span>音声</span>
                </>
              )}
            </button>

            {/* 全画面ボタン */}
            <button
              onClick={handleFullscreen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '6px 8px',
                cursor: 'pointer'
              }}
              title="全画面表示"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Google Driveプレビュー用プレイヤー（スマホでも確実に一時停止・停止できるコントロール付き）
 */
const CustomDriveVideoPlayer: React.FC<{
  driveId: string;
  alt: string;
  wrapperClassName?: string;
  defaultWrapperStyle: React.CSSProperties;
}> = ({ driveId, alt, wrapperClassName, defaultWrapperStyle }) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
  const openUrl = `https://drive.google.com/file/d/${driveId}/view`;
  const posterUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;

  const handlePause = () => {
    setIsPaused(true);
  };

  const handlePlay = () => {
    setIsPaused(false);
    setReloadKey((k) => k + 1);
  };

  const handleRestart = () => {
    setIsPaused(false);
    setReloadKey((k) => k + 1);
  };

  return (
    <div
      className={wrapperClassName}
      style={{
        ...defaultWrapperStyle,
        padding: '8px',
        background: '#0f172a',
        flexDirection: 'column',
        display: 'flex',
        gap: '8px',
        marginBottom: '14px'
      }}
    >
      {/* 動画表示エリア */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          minHeight: '220px',
          borderRadius: '6px',
          overflow: 'hidden',
          background: '#000000'
        }}
      >
        {!isPaused ? (
          <iframe
            key={reloadKey}
            src={previewUrl}
            title={alt}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '6px',
              background: '#000000',
              display: 'block'
            }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          /* 一時停止中画面（動画を完全に停止し、ポスターと再開ボタンを表示） */
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000'
            }}
          >
            <img
              src={posterUrl}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.4
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.75)',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}
              >
                ⏸ 動画は一時停止中です
              </div>
              <button
                onClick={handlePlay}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#004aad',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px 22px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}
              >
                <Play size={16} />
                <span>再生を再開する</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Google Drive専用の操作コントロールバー（一時停止・再開を確実に提供） */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}
      >
        {!isPaused ? (
          <button
            onClick={handlePause}
            style={{
              flex: 1,
              minWidth: '130px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
            title="再生中の動画を一時停止"
          >
            <Pause size={15} />
            <span>動画を一時停止</span>
          </button>
        ) : (
          <button
            onClick={handlePlay}
            style={{
              flex: 1,
              minWidth: '130px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#004aad',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
            title="動画の再生を再開"
          >
            <Play size={15} />
            <span>動画を再開</span>
          </button>
        )}

        <button
          onClick={handleRestart}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="動画を最初から再生"
        >
          <RotateCcw size={13} />
          <span>最初から</span>
        </button>

        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '8px 12px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#f8fafc',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            textDecoration: 'none',
            boxSizing: 'border-box'
          }}
          title="Google Driveで大画面再生"
        >
          <span>🎬 大画面で開く</span>
          <ExternalLink size={12} style={{ opacity: 0.8 }} />
        </a>
      </div>

      {/* スマートフォン向けの操作ヒント */}
      <div
        style={{
          fontSize: '0.7rem',
          color: '#94a3b8',
          lineHeight: '1.4',
          textAlign: 'center'
        }}
      >
        💡 スマートフォンで動画プレイヤー内の一時停止ボタンが表示されない場合は、上の「一時停止」ボタンを押して停止できます。
      </div>
    </div>
  );
};

interface DetailMediaViewProps {
  url: string;
  alt: string;
  wrapperClassName?: string;
  imageClassName?: string;
}

/**
 * 詳細モーダル用のメディア表示コンポーネント（画像・動画自動判別＆スマホ再生対応）
 */
export const DetailMediaView: React.FC<DetailMediaViewProps> = ({
  url,
  alt,
  wrapperClassName,
  imageClassName
}) => {
  const driveId = useMemo(() => extractGoogleDriveId(url), [url]);
  const youtubeId = useMemo(() => extractYouTubeId(url), [url]);
  const vimeoId = useMemo(() => extractVimeoId(url), [url]);
  const directVideo = useMemo(() => isDirectVideoUrl(url), [url]);
  const localDriveVideoUrl = driveId ? LOCAL_DRIVE_VIDEOS[driveId] : undefined;
  const isDriveVideo = Boolean(
    driveId && (
      localDriveVideoUrl ||
      KNOWN_DRIVE_VIDEOS.has(driveId) ||
      /[?&#]video=1/i.test(url) ||
      url.includes('/preview')
    )
  );

  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setIsHidden(false);
  }, [url]);

  if (isHidden) return null;

  const defaultWrapperStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  // 1. YouTube動画
  if (youtubeId) {
    return (
      <div
        className={wrapperClassName}
        style={{ ...defaultWrapperStyle, padding: '8px', background: '#000000', marginBottom: '14px' }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&playsinline=1&controls=1&rel=0`}
          title={alt}
          style={{ width: '100%', aspectRatio: '16 / 9', border: 'none', borderRadius: '6px', display: 'block' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Vimeo動画
  if (vimeoId) {
    return (
      <div
        className={wrapperClassName}
        style={{ ...defaultWrapperStyle, padding: '8px', background: '#000000', marginBottom: '14px' }}
      >
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1`}
          title={alt}
          style={{ width: '100%', aspectRatio: '16 / 9', border: 'none', borderRadius: '6px', display: 'block' }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 3. 直接動画URL (.mp4, .mov, .webm) または スマホ最適化済みGoogle Drive動画
  if (directVideo || localDriveVideoUrl) {
    const videoSrc = localDriveVideoUrl || url;
    const posterUrl = driveId ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000` : undefined;
    return (
      <CustomNativeVideoPlayer
        src={videoSrc}
        poster={posterUrl}
        alt={alt}
        wrapperClassName={wrapperClassName}
        defaultWrapperStyle={defaultWrapperStyle}
      />
    );
  }

  // 4. その他のGoogle Drive動画（埋め込みプレビュー ＋ スマホでも確実に一時停止・再生できるコントローラー付き）
  if (driveId && isDriveVideo) {
    return (
      <CustomDriveVideoPlayer
        driveId={driveId}
        alt={alt}
        wrapperClassName={wrapperClassName}
        defaultWrapperStyle={defaultWrapperStyle}
      />
    );
  }

  // 5. 通常の画像（またはGoogle Drive画像）
  return (
    <div
      className={wrapperClassName}
      style={{
        ...defaultWrapperStyle,
        background: '#ffffff',
        border: '1px solid var(--color-border-light, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        marginBottom: '14px'
      }}
    >
      <img
        src={url}
        alt={alt}
        className={imageClassName}
        style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
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
          setIsHidden(true);
        }}
      />
    </div>
  );
};
