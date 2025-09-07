// src/components/common/LanguageSwitcher.jsx
import React from "react";
import { useI18n } from "@/hooks/useI18n"; // Updated import path

const LanguageSwitcher = () => {
  const { language, changeLanguage, t } = useI18n();

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={language}
        onChange={handleLanguageChange}
        className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbe0e6] bg-white focus:border-[#dbe0e6] h-10 placeholder:text-[#60758a] p-2 text-base font-normal leading-normal appearance-none pr-8"
      >
        <option value="en">{t("languages.en")}</option>
        <option value="ru">{t("languages.ru")}</option>
        <option value="ge">{t("languages.ge")}</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
