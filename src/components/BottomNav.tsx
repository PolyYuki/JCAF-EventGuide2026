import type { ActiveTab } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Map, Store, Calendar, Building2, Info } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'map' as ActiveTab,
      label: t('nav.map'),
      icon: Map
    },
    {
      id: 'stalls' as ActiveTab,
      label: t('nav.stalls'),
      icon: Store
    },
    {
      id: 'stage' as ActiveTab,
      label: t('nav.stage'),
      icon: Calendar
    },
    {
      id: 'sponsors' as ActiveTab,
      label: t('nav.sponsors'),
      icon: Building2
    },
    {
      id: 'info' as ActiveTab,
      label: t('nav.info'),
      icon: Info
    }
  ];

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              data-tab={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="nav-icon-wrapper">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
