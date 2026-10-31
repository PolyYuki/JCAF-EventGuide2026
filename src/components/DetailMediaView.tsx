import React, { useState, useMemo, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

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
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&playsinline=1&rel=0`}
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
      <div
        className={wrapperClassName}
        style={{ ...defaultWrapperStyle, padding: '8px', background: '#0f172a', marginBottom: '14px' }}
      >
        <video
          src={videoSrc}
          poster={posterUrl}
          controls
          playsInline
          autoPlay
          muted
          preload="metadata"
          style={{ width: '100%', maxHeight: '320px', borderRadius: '6px', display: 'block' }}
        />
      </div>
    );
  }

  // 4. その他のGoogle Drive動画（埋め込みプレビュー ＋ スマホでも確実に再生できる直通ボタン）
  if (driveId && isDriveVideo) {
    const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    const openUrl = `https://drive.google.com/file/d/${driveId}/view`;
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
        <iframe
          src={previewUrl}
          title={alt}
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            minHeight: '220px',
            border: 'none',
            borderRadius: '6px',
            background: '#000000',
            display: 'block'
          }}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: '8px 12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#f8fafc',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '6px',
            textDecoration: 'none',
            boxSizing: 'border-box'
          }}
        >
          <span>🎬</span>
          <span>Google Driveで動画を開く / 大画面再生</span>
          <ExternalLink size={13} style={{ opacity: 0.8 }} />
        </a>
      </div>
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

