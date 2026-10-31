import React, { useState, useEffect, useCallback } from 'react';
import type { ActiveTab, Stall, StagePerformance, Facility, EventInfo } from './types';
import { initialEventInfo, initialFaqs, initialStalls, initialStages, initialFacilities } from './data/mockData';
import { loadStallsData, loadStagesData, loadFacilitiesData } from './services/sheetService';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MapView } from './components/MapView';
import { StallsView } from './components/StallsView';
import { StageView } from './components/StageView';
import { SponsorsView } from './components/SponsorsView';
import { InfoView } from './components/InfoView';
import { SheetSettingsModal } from './components/SheetSettingsModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');

  // データステート (初回レンダリング時から最新初期値/キャッシュを即時反映)
  const [eventInfo] = useState<EventInfo>(initialEventInfo);
  const [stalls, setStalls] = useState<Stall[]>(() => {
    try {
      const cached = localStorage.getItem('jcaf_cached_stalls_v6');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialStalls;
  });
  const [stages, setStages] = useState<StagePerformance[]>(() => {
    try {
      const cached = localStorage.getItem('jcaf_cached_stages');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialStages;
  });
  const [facilities, setFacilities] = useState<Facility[]>(() => {
    try {
      const cached = localStorage.getItem('jcaf_cached_facilities');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialFacilities;
  });
  const [isRemoteLoaded, setIsRemoteLoaded] = useState<boolean>(false);
  const [_isLoading, setIsLoading] = useState<boolean>(true);

  // マップと一覧間の連携ステート
  const [focusedStallId, setFocusedStallId] = useState<string | null>(null);
  const [focusedFacilityId, setFocusedFacilityId] = useState<string | null>(null);
  const [openedFromMap, setOpenedFromMap] = useState<boolean>(false);
  const [focusedStageArea, setFocusedStageArea] = useState<'all' | 'stage' | 'outdoor'>('all');

  // モーダルステート
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // データ同期処理
  const syncData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stallsRes, stagesRes, facilitiesRes] = await Promise.all([
        loadStallsData(),
        loadStagesData(),
        loadFacilitiesData()
      ]);

      setStalls(stallsRes.data);
      setStages(stagesRes.data);
      setFacilities(facilitiesRes.data);
      setIsRemoteLoaded(stallsRes.isFromRemote || stagesRes.isFromRemote);
    } catch (e) {
      console.warn('Sync failed, using existing/fallback data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncData();
  }, [syncData]);

  // 出店者一覧から「地図で見る」をクリックした時
  const handleShowOnMap = (stallId: string) => {
    setFocusedFacilityId(null);
    setFocusedStallId(stallId);
    setActiveTab('map');
  };

  // ステージから「地図で見る」をクリックした時
  const handleShowStageOnMap = (_stageId: string) => {
    setActiveTab('map');
  };

  // 施設から「地図で見る」をクリックした時
  const handleShowFacilityOnMap = (facilityId: string) => {
    setFocusedStallId(null);
    setFocusedFacilityId(facilityId);
    setActiveTab('map');
  };

  return (
    <div className="app-container">
      {/* プレミアム和モダンヘッダー */}
      <Header
        eventInfo={eventInfo}
        stages={stages}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectTab={(tab) => {
          setOpenedFromMap(false);
          setActiveTab(tab);
          setFocusedStallId(null);
          setFocusedFacilityId(null);
        }}
      />

      {/* メインビューエリア */}
      <main className="main-content">
        {activeTab === 'map' && (
          <MapView
            stalls={stalls}
            facilities={facilities}
            selectedStallId={focusedStallId}
            selectedFacilityId={focusedFacilityId}
            onSelectStall={(stall) => {
              setFocusedFacilityId(null);
              setFocusedStallId(stall.id);
            }}
            onClearSelectedStall={() => {
              setFocusedStallId(null);
              setFocusedFacilityId(null);
            }}
            onNavigateToStallList={(stallId) => {
              if (stallId) setFocusedStallId(stallId);
              setOpenedFromMap(true);
              setActiveTab('stalls');
            }}
            onNavigateToStage={(stageArea) => {
              setFocusedStageArea(stageArea || 'all');
              setActiveTab('stage');
            }}
          />
        )}

        {activeTab === 'stalls' && (
          <StallsView
            stalls={stalls}
            initialSelectedStallId={focusedStallId}
            onShowOnMap={(stallId) => {
              setOpenedFromMap(false);
              handleShowOnMap(stallId);
            }}
            onCloseDetail={() => {
              if (openedFromMap) {
                setOpenedFromMap(false);
                setActiveTab('map');
              }
            }}
          />
        )}

        {activeTab === 'stage' && (
          <StageView
            stages={stages}
            initialStageFilter={focusedStageArea}
            onShowStageOnMap={handleShowStageOnMap}
          />
        )}

        {activeTab === 'sponsors' && (
          <SponsorsView
            stalls={stalls}
            onShowOnMap={handleShowOnMap}
          />
        )}

        {activeTab === 'info' && (
          <InfoView
            eventInfo={eventInfo}
            facilities={facilities}
            faqs={initialFaqs}
            onShowFacilityOnMap={handleShowFacilityOnMap}
          />
        )}
      </main>

      {/* モバイル最適化ボトムナビゲーション */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setOpenedFromMap(false);
          if (tab === 'stalls') {
            setFocusedStallId(null);
          }
          if (tab === 'stage') {
            setFocusedStageArea('all');
          }
          setActiveTab(tab);
        }}
      />

      {/* スプレッドシート連携設定モーダル */}
      <SheetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSync={syncData}
        isRemoteLoaded={isRemoteLoaded}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
