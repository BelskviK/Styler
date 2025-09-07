// src/hooks/useI18n.js
import { useContext } from "react";
import { I18nContext } from "@/context/I18nProvider";

// Custom hook to use the i18n context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
