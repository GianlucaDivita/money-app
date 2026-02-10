import { useState, useEffect, useCallback } from 'react';
import type { DashboardLayout } from '../types';
import { DEFAULT_DASHBOARD_WIDGETS } from '../lib/constants';
import { getSetting, setSetting } from '../lib/db';

const STORAGE_KEY = 'dashboard-layout';

export function useDashboardLayout() {
  const [widgets, setWidgets] = useState<DashboardLayout>(DEFAULT_DASHBOARD_WIDGETS);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Load persisted layout
  useEffect(() => {
    getSetting<DashboardLayout>(STORAGE_KEY).then(saved => {
      if (saved?.length) {
        // Merge: keep saved order/visibility, add any new default widgets
        const savedIds = new Set(saved.map(w => w.id));
        const merged = [
          ...saved,
          ...DEFAULT_DASHBOARD_WIDGETS.filter(w => !savedIds.has(w.id)),
        ];
        setWidgets(merged);
      }
    });
  }, []);

  const persist = useCallback((next: DashboardLayout) => {
    setWidgets(next);
    setSetting(STORAGE_KEY, next);
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    persist(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  }, [widgets, persist]);

  const moveUp = useCallback((id: string) => {
    const idx = widgets.findIndex(w => w.id === id);
    if (idx <= 0) return;
    const next = [...widgets];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    persist(next.map((w, i) => ({ ...w, order: i })));
  }, [widgets, persist]);

  const moveDown = useCallback((id: string) => {
    const idx = widgets.findIndex(w => w.id === id);
    if (idx < 0 || idx >= widgets.length - 1) return;
    const next = [...widgets];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    persist(next.map((w, i) => ({ ...w, order: i })));
  }, [widgets, persist]);

  const resetToDefault = useCallback(() => {
    persist(DEFAULT_DASHBOARD_WIDGETS);
  }, [persist]);

  return {
    widgets,
    toggleVisibility,
    moveUp,
    moveDown,
    resetToDefault,
    isCustomizing,
    setIsCustomizing,
  };
}
