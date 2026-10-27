import React, { useState, useEffect, useCallback } from 'react';
import type { ActiveTab, Stall, StagePerformance, Facility, EventInfo } from './types';
import { initialEventInfo, initialFaqs, initialStalls, initialStages, initialFacilities } from './data/mockData';
import { loadStallsData, loadStagesData, loadFacilitiesData } from './services/sheetService';
import { LanguageProvider } from './context/LanguageContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MapView } from './components/MapView';
import { StallsView } from './components/StallsView';
import { StageView } from './components/StageView';
import { InfoView } from './components/InfoView';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { FavoritesModal } from './components/FavoritesModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');

  // データステート
  const [eventInfo] = useState<EventInfo>(initialEventInfo);
  const [stalls, setStalls] = useState<Stall[]>(initialStalls);
  const [stages, setStages] = useState<StagePerformance[]>(initialStages);
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [isRemoteLoaded, setIsRemoteLoaded] = useState<boolean>(false);
  const [_isLoading, setIsLoading] = useState<boolean>(true);

  // マップと一覧間の連携ステート
  const [focusedStallId, setFocusedStallId] = useState<string | null>(null);

  // モーダルステート
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

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
    setFocusedStallId(stallId);
    setActiveTab('map');
  };

  // ステージから「地図で見る」をクリックした時
  const handleShowStageOnMap = (_stageId: string) => {
    setActiveTab('map');
  };

  // 施設から「地図で見る」をクリックした時
  const handleShowFacilityOnMap = (_facilityId: string) => {
    setActiveTab('map');
  };

  return (
    <div className="app-container">
      {/* プレミアム和モダンヘッダー */}
      <Header
        eventInfo={eventInfo}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setFocusedStallId(null);
        }}
      />

      {/* メインビューエリア */}
      <main className="main-content">
        {activeTab === 'map' && (
          <MapView
            stalls={stalls}
            facilities={facilities}
            selectedStallId={focusedStallId}
            onSelectStall={(stall) => setFocusedStallId(stall.id)}
            onClearSelectedStall={() => setFocusedStallId(null)}
            onNavigateToStallList={(stallId) => {
              if (stallId) setFocusedStallId(stallId);
              setActiveTab('stalls');
            }}
          />
        )}

        {activeTab === 'stalls' && (
          <StallsView
            stalls={stalls}
            initialSelectedStallId={focusedStallId}
            onShowOnMap={handleShowOnMap}
          />
        )}

        {activeTab === 'stage' && (
          <StageView
            stages={stages}
            onShowStageOnMap={handleShowStageOnMap}
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

      {/* お気に入り一覧モーダル */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        stalls={stalls}
        onShowOnMap={handleShowOnMap}
        onInspectStall={(id) => {
          setFocusedStallId(id);
          setActiveTab('stalls');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <FavoritesProvider>
        <AppContent />
      </FavoritesProvider>
    </LanguageProvider>
  );
}
