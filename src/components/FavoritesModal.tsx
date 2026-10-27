import type { Stall } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { X, Bookmark, MapPin, Trash2 } from 'lucide-react';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stalls: Stall[];
  onShowOnMap: (stallId: string) => void;
  onInspectStall: (stallId: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  stalls,
  onShowOnMap,
  onInspectStall
}) => {
  const { lang } = useLanguage();
  const { favoriteStallIds, toggleFavoriteStall, clearFavorites } = useFavorites();
  const isJa = lang === 'ja';

  if (!isOpen) return null;

  const favoriteStalls = stalls.filter((stall) => favoriteStallIds.includes(stall.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bookmark size={20} style={{ color: 'var(--color-accent)' }} />
            <h2 className="sheet-title">
              {isJa ? 'お気に入りストール' : 'Saved Bookmarks'}
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#f1f5f9',
                color: 'var(--color-primary)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {favoriteStalls.length}
            </span>
          </div>

          <button
            className="icon-btn"
            style={{ background: '#f1f5f9', color: '#64748b', border: 'none' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sheet-body">
          {favoriteStalls.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Bookmark size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                {isJa ? 'まだお気に入りが登録されていません' : 'No saved stalls yet'}
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                {isJa
                  ? '出店者一覧やマップからハートアイコンをタップして保存できます。'
                  : 'Tap the heart icon on any stall card or map pin to bookmark it.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {favoriteStalls.map((stall) => (
                <div
                  key={stall.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: '#ffffff',
                    gap: '12px'
                  }}
                >
                  {stall.imageUrl && (
                    <img
                      src={stall.imageUrl}
                      alt=""
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover'
                      }}
                    />
                  )}

                  <div
                    style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onClick={() => {
                      onClose();
                      onInspectStall(stall.id);
                    }}
                  >
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          background: '#f1f5f9',
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}
                      >
                        {stall.boothNumber}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {isJa ? stall.categoryJa : stall.categoryEn}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {isJa ? stall.nameJa : stall.nameEn}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '6px 8px', fontSize: '0.72rem' }}
                      onClick={() => {
                        onClose();
                        onShowOnMap(stall.id);
                      }}
                      title="Show on map"
                    >
                      <MapPin size={13} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '6px 8px', color: '#ef4444' }}
                      onClick={() => toggleFavoriteStall(stall.id)}
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onClick={clearFavorites}
                >
                  {isJa ? 'すべてのお気に入りをクリア' : 'Clear all bookmarks'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
