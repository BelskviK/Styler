// src/pages/Settings.jsx
import React, { useState } from "react";
import { useI18n } from "@/hooks/useI18n"; // Updated import path
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const Settings = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const { t } = useI18n();

  // Handle image URL submission
  const handleImageSubmit = (e) => {
    e.preventDefault();
    if (imageUrl) {
      setProfileImage(imageUrl);
      setImageUrl("");
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          {t("settings.title")}
        </p>
        <LanguageSwitcher />
      </div>

      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        {t("settings.personalInfo")}
      </h2>

      {/* Profile Image Upload */}
      <div className="flex flex-col max-w-[480px] px-4 py-3">
        <p className="text-[#111418] text-base font-medium leading-normal pb-2">
          {t("settings.profileImage")}
        </p>
        <div className="flex items-center gap-4">
          {profileImage && (
            <div className="w-16 h-16 rounded-full overflow-hidden border border-[#dbe0e6]">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
          <form onSubmit={handleImageSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder={t("settings.pasteImageUrl")}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbe0e6] bg-white focus:border-[#dbe0e6] h-10 placeholder:text-[#60758a] p-2 text-base font-normal leading-normal"
            />
            <button
              type="submit"
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
              {t("settings.updateImage")}
            </button>
          </form>
        </div>
      </div>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111418] text-base font-medium leading-normal pb-2">
            {t("settings.name")}
          </p>
          <input
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbe0e6] bg-white focus:border-[#dbe0e6] h-14 placeholder:text-[#60758a] p-[15px] text-base font-normal leading-normal"
            placeholder={t("settings.name")}
          />
        </label>
      </div>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111418] text-base font-medium leading-normal pb-2">
            {t("settings.email")}
          </p>
          <input
            name="email"
            type="email"
            value={userData.email}
            onChange={handleInputChange}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbe0e6] bg-white focus:border-[#dbe0e6] h-14 placeholder:text-[#60758a] p-[15px] text-base font-normal leading-normal"
            placeholder={t("settings.email")}
          />
        </label>
      </div>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111418] text-base font-medium leading-normal pb-2">
            {t("settings.phone")}
          </p>
          <input
            name="phone"
            value={userData.phone}
            onChange={handleInputChange}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbe0e6] bg-white focus:border-[#dbe0e6] h-14 placeholder:text-[#60758a] p-[15px] text-base font-normal leading-normal"
            placeholder={t("settings.phone")}
          />
        </label>
      </div>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        {t("settings.notifications")}
      </h2>

      <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
        <div className="flex flex-col justify-center">
          <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">
            {t("settings.appointmentNotifications")}
          </p>
          <p className="text-[#60758a] text-sm font-normal leading-normal line-clamp-2">
            {t("settings.notificationDesc")}
          </p>
        </div>
        <div className="shrink-0">
          <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-[#f0f2f5] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-[#0d80f2]">
            <div
              className="h-full w-[27px] rounded-full bg-white"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px",
              }}
            ></div>
            <input type="checkbox" className="invisible absolute" />
          </label>
        </div>
      </div>

      <div className="flex px-4 py-3 justify-start">
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-white text-sm font-bold leading-normal tracking-[0.015em]">
          <span className="truncate">{t("common.save")}</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
