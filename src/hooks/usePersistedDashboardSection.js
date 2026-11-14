import { useEffect, useState } from "react";

export default function usePersistedDashboardSection(
  storageKey,
  defaultSection = "Overview",
) {
  const [activeSection, setActiveSection] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) || defaultSection;
    } catch {
      return defaultSection;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, activeSection);
    } catch {
      // Storage unavailable; dashboard still works normally.
    }
  }, [storageKey, activeSection]);

  return [activeSection, setActiveSection];
}
