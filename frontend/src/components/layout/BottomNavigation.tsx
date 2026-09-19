import React from 'react';
import { Home, FileText, Clock, HelpCircle, User } from 'lucide-react';
import { NavTab } from '../../types';

interface BottomNavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5" /> },
    { id: 'reminders', label: 'Reminders', icon: <Clock className="w-5 h-5" /> },
    { id: 'questions', label: 'Questions', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#fbf9f5]/95 backdrop-blur-md border-t border-warm-200/90 px-2 py-1.5 pb-safe shadow-lg"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-warm-950 font-bold'
                  : 'text-warm-500 hover:text-warm-900 font-medium'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-transform ${
                  isActive ? 'bg-warm-200/80 text-warm-950 scale-105' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const BottomNav = BottomNavigation;
