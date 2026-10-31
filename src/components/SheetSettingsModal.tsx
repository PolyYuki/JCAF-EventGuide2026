import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getSyncConfig, saveSyncConfig, getLastSyncTime } from '../services/sheetService';
import type { SyncConfig } from '../services/sheetService';
import {
  X,
  Database,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => Promise<void>;
  isRemoteLoaded: boolean;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  onSync,
  isRemoteLoaded
}) => {
  const { lang } = useLanguage();
  const isJa = lang === 'ja';

  const [config, setConfig] = useState<SyncConfig>(getSyncConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'stalls' | 'performances' | 'advanced'>('stalls');

  if (!isOpen) return null;

  const handleSaveAndSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      saveSyncConfig(config);
      await onSync();
      setSyncStatus(isJa ? '✅ スプレッドシートと同期完了しました！' : '✅ Synced with Google Sheets successfully!');
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Error';
      setSyncStatus(isJa ? `⚠️ 同期に失敗しました: ${err}` : `⚠️ Sync failed: ${err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetToDefault = async () => {
    const emptyConfig: SyncConfig = {
      marketCsvUrl: '',
      sponsorCsvUrl: '',
      paidWorkshopCsvUrl: '',
      freeWorkshopCsvUrl: '',
      foodCsvUrl: '',
      kidsCsvUrl: '',
      artCsvUrl: '',
      stageCsvUrl: '',
      outdoorCsvUrl: '',
      stallsCsvUrl: '',
      stagesCsvUrl: '',
      facilitiesCsvUrl: ''
    };
    setConfig(emptyConfig);
    saveSyncConfig(emptyConfig);
    localStorage.removeItem('jcaf_cached_stalls');
    localStorage.removeItem('jcaf_cached_stalls_v2');
    localStorage.removeItem('jcaf_cached_stalls_v3');
    localStorage.removeItem('jcaf_cached_stalls_v4');
    localStorage.removeItem('jcaf_cached_stalls_v5');
    localStorage.removeItem('jcaf_cached_stalls_v6');
    localStorage.removeItem('jcaf_cached_stages');
    localStorage.removeItem('jcaf_last_sync_time');
    setIsSyncing(true);
    try {
      await onSync();
      setSyncStatus(isJa ? '内蔵の初期データにリセットしました。' : 'Reset to default built-in dataset.');
    } finally {
      setIsSyncing(false);
    }
  };

  const lastSync = getLastSyncTime();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh', maxWidth: '640px' }}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 className="sheet-title">
              {isJa ? 'Googleスプレッドシート データ連携' : 'Google Sheets Data Sync'}
            </h2>
          </div>
          <button
            className="icon-btn"
            style={{ background: '#f1f5f9', color: '#64748b', border: 'none' }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sheet-body">
          {/* 現在のステータスバッジ */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: isRemoteLoaded ? '#f0fdf4' : '#f8fafc',
              border: `1px solid ${isRemoteLoaded ? '#86efac' : '#e2e8f0'}`,
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} style={{ color: isRemoteLoaded ? '#16a34a' : '#64748b' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                {isRemoteLoaded
                  ? (isJa ? '接続中: Googleスプレッドシート公開データ' : 'Connected: Live Google Sheet')
                  : (isJa ? '現在: 内蔵サンプルデータで動作中' : 'Active: Built-in Mock Dataset')}
              </span>
            </div>
            {lastSync && (
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* セキュリティ・方式説明 */}
          <div
            style={{
              fontSize: '0.75rem',
              color: '#475569',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              lineHeight: '1.5',
              marginBottom: '14px'
            }}
          >
            <strong>🔒 {isJa ? '安心・安全の完全無料設計' : 'Zero-Config & Secure'}</strong>: 
            {isJa
              ? ' 各シートの「ウェブに公開（CSV形式）」URLを貼るだけで自動同期されます。通常のスプレッドシートURLでも自動変換されます。'
              : ' Paste "Publish to web (CSV)" URLs. Regular edit/view links are converted automatically.'}
          </div>

          {/* タブ切り替え */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: activeTab === 'stalls' ? 700 : 500,
                background: activeTab === 'stalls' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'stalls' ? '#fff' : '#64748b',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('stalls')}
            >
              🛍️ {isJa ? '出店・ブース (7種)' : 'Booths (7)'}
            </button>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: activeTab === 'performances' ? 700 : 500,
                background: activeTab === 'performances' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'performances' ? '#fff' : '#64748b',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('performances')}
            >
              🏛️ {isJa ? 'パフォーマンス (2種)' : 'Programs (2)'}
            </button>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: activeTab === 'advanced' ? 700 : 500,
                background: activeTab === 'advanced' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'advanced' ? '#fff' : '#64748b',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('advanced')}
            >
              ⚙️ {isJa ? 'その他・施設' : 'Other'}
            </button>
          </div>

          {/* 入力フォーム */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {activeTab === 'stalls' && (
              <>
                {/* 1. マーケット */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f766e', marginBottom: '4px' }}>
                    1. 🛍️ {isJa ? 'マーケット シートURL' : 'Market Sheet URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (マーケット)"
                    value={config.marketCsvUrl}
                    onChange={(e) => setConfig({ ...config, marketCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>

                {/* 2. スポンサー */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4338ca', marginBottom: '4px' }}>
                    2. 🏢 {isJa ? 'スポンサー シートURL' : 'Sponsors Sheet URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (スポンサー)"
                    value={config.sponsorCsvUrl}
                    onChange={(e) => setConfig({ ...config, sponsorCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>

                {/* 3. 有料ワークショップ */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginBottom: '4px' }}>
                    3. 🎨 {isJa ? '有料ワークショップ シートURL' : 'Paid Workshops Sheet URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (有料ワークショップ)"
                    value={config.paidWorkshopCsvUrl}
                    onChange={(e) => setConfig({ ...config, paidWorkshopCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>

                {/* 4. 無料ワークショップ */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#047857', marginBottom: '4px' }}>
                    4. 🖌️ {isJa ? '無料ワークショップ シートURL' : 'Free Workshops Sheet URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (無料ワークショップ)"
                    value={config.freeWorkshopCsvUrl}
                    onChange={(e) => setConfig({ ...config, freeWorkshopCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>

                {/* 5. フード */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#be123c', marginBottom: '4px' }}>
                    5. 🍱 {isJa ? 'フード シートURL' : 'Food Sheet URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (フード)"
                    value={config.foodCsvUrl}
                    onChange={(e) => setConfig({ ...config, foodCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>

                {/* 6. キッズアクティビティ */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#db2777', marginBottom: '4px' }}>
                    6. 🎈 {isJa ? 'キッズアクティビティ シートURL' : 'Kids Activity Sheet URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (キッズアクティビティ)"
                    value={config.kidsCsvUrl}
                    onChange={(e) => setConfig({ ...config, kidsCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>

                {/* 7. アート展示 */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', marginBottom: '4px' }}>
                    7. 🖼️ {isJa ? 'アート展示 シートURL' : 'Art Exhibition Sheet URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (アート展示)"
                    value={config.artCsvUrl}
                    onChange={(e) => setConfig({ ...config, artCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>
              </>
            )}

            {activeTab === 'performances' && (
              <>
                {/* 6. ステージ */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#9f1239', marginBottom: '4px' }}>
                    6. 🏛️ {isJa ? 'ステージ シートURL' : 'Main Stage Sheet URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (ステージ)"
                    value={config.stageCsvUrl}
                    onChange={(e) => setConfig({ ...config, stageCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>

                {/* 7. アウトドアパフォーマンス */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>
                    7. 🌳 {isJa ? 'アウトドアパフォーマンス シートURL' : 'Outdoor Performance Sheet URL'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (アウトドアパフォーマンス)"
                    value={config.outdoorCsvUrl}
                    onChange={(e) => setConfig({ ...config, outdoorCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    🚻 {isJa ? '会場施設 (トイレ・本部等) シートURL (任意)' : 'Facilities Sheet URL (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... (施設)"
                    value={config.facilitiesCsvUrl}
                    onChange={(e) => setConfig({ ...config, facilitiesCsvUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.78rem' }}
                  />
                </div>

                <div style={{ marginTop: '8px', padding: '10px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {isJa
                      ? '※1つのスプレッドシート内に複数タブを作成して「シートごとに公開」したURLでも、それぞれ別々のスプレッドシートURLでもどちらでも動作します。'
                      : 'You can use separate sheets or separate tabs from a single Google Spreadsheet.'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 同期ステータスメッセージ */}
          {syncStatus && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: syncStatus.startsWith('✅') ? '#f0fdf4' : '#fffbeb',
                fontSize: '0.8rem',
                marginBottom: '14px',
                color: syncStatus.startsWith('✅') ? '#166534' : '#b45309',
                fontWeight: 600
              }}
            >
              {syncStatus}
            </div>
          )}

          {/* アクションボタン */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: '11px' }}
              onClick={handleSaveAndSync}
              disabled={isSyncing}
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? (isJa ? '同期中...' : 'Syncing...') : (isJa ? '保存して今すぐ同期' : 'Save & Sync Now')}</span>
            </button>

            <button
              className="btn btn-outline"
              style={{ padding: '11px 14px', fontSize: '0.78rem' }}
              onClick={handleResetToDefault}
              title="Reset"
            >
              {isJa ? '初期値に戻す' : 'Reset'}
            </button>
          </div>

          {/* 記入項目ガイド（アコーディオン） */}
          <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '12px' }}>
            <button
              onClick={() => setShowGuide(!showGuide)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={16} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {isJa ? 'スプレッドシートの記入項目（列名）と公開手順' : 'Column Specifications & Publish Guide'}
                </span>
              </div>
              {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showGuide && (
              <div style={{ padding: '12px', background: '#fafafa', borderRadius: '0 0 var(--radius-md) var(--radius-md)', border: '1px solid #e2e8f0', borderTop: 'none', fontSize: '0.75rem', lineHeight: '1.6', color: '#334155' }}>
                <h5 style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                  A. 出店・ブース系（マーケット／スポンサー／ワークショップ／フード）の列名
                </h5>
                <ul style={{ paddingLeft: '16px', marginBottom: '12px' }}>
                  <li><strong>ブース番号</strong> (または boothNumber): 例「M-01」「W-02」</li>
                  <li><strong>出店場所</strong> (または location): 例「Collingwood Town Hall」「Djerring Centre」「公園」</li>
                  <li><strong>店名</strong> (または nameJa): 店舗名・出店名（必須）</li>
                  <li><strong>英語名</strong> (または nameEn): 任意</li>
                  <li><strong>キャッチコピー</strong> (または shortDescJa): 一行紹介文</li>
                  <li><strong>紹介文</strong> (または descriptionJa): 詳しい説明</li>
                  <li><strong>見どころ</strong> (または highlightJa): おすすめポイント</li>
                  <li><strong>写真URL</strong> または <strong>ロゴURL</strong> (imageUrl): 画像リンク（※Google Drive共有リンクも自動認識）</li>
                  <li><strong>インスタURL</strong> または <strong>instagram</strong>: 「https://instagram.com/ユーザー名」または「@ユーザー名」</li>
                  <li><strong>公式サイト</strong> または <strong>website</strong>: 公式HP等のWebリンク</li>
                  <li><strong>マップX, マップY</strong>: 地図上の位置（0〜100、省略可・初期値50）</li>
                </ul>

                <div style={{ background: '#eff6ff', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe', marginBottom: '12px', fontSize: '0.72rem', color: '#1e40af' }}>
                  💡 <strong>Google Driveの画像を使う場合の注意点:</strong><br />
                  Google Drive上の画像ファイル（または格納フォルダ）の共有設定で、一般的なアクセスを必ず<strong>「リンクを知っている全員（閲覧者）」</strong>に設定してください。非公開のままだと権限制限により画像が表示されません。
                </div>

                <h5 style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                  B. パフォーマンス系（ステージ／アウトドアパフォーマンス）の列名
                </h5>
                <ul style={{ paddingLeft: '16px', marginBottom: '12px' }}>
                  <li><strong>日程</strong> (または day): 「1」または「2」</li>
                  <li><strong>開始時刻</strong> (または startTime): 例「11:00」</li>
                  <li><strong>終了時刻</strong> (または endTime): 例「11:45」</li>
                  <li><strong>演目名</strong> (または titleJa): プログラムのタイトル</li>
                  <li><strong>出演者名</strong> (または artistJa): 団体名・アーティスト名</li>
                  <li><strong>ジャンル</strong> (または categoryJa): 例「和太鼓」「大道芸」</li>
                  <li><strong>内容紹介</strong> (または descJa): 演目の紹介文</li>
                  <li><strong>写真URL</strong> (または imageUrl): 画像リンク</li>
                </ul>

                <h5 style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                  C. Googleスプレッドシート公開手順
                </h5>
                <ol style={{ paddingLeft: '16px' }}>
                  <li>スプレッドシート上部メニューの「ファイル」 ＞ 「共有」 ＞ 「ウェブに公開」をクリック。</li>
                  <li>「リンク」タブで対象シートを選び、形式を「カンマ区切り値 (.csv)」に変更して「公開」をクリック。</li>
                  <li>発行されたURLをコピーして上記の各入力欄に貼り付けます。</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
