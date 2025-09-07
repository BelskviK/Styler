import React, { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import UserService from "@/services/UserService";
import { toast } from "react-toastify";

const Settings = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [userData, setUserData] = useState({
    id: "", // CRITICAL: Add id field
    name: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { t } = useI18n();

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await UserService.getCurrentUser();

      if (response.data.success) {
        setUserData({
          id: response.data.user.id, // CRITICAL: Store the user ID
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          phone: response.data.user.phone || "",
          address: response.data.user.address || "",
          profileImage: response.data.user.profileImage || "",
        });
        if (response.data.user.profileImage) {
          setProfileImage(response.data.user.profileImage);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(t("settings.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (imageUrl) {
      try {
        setProfileImage(imageUrl);
        setUserData((prev) => ({ ...prev, profileImage: imageUrl }));

        const response = await UserService.updateUser(userData.id, {
          profileImage: imageUrl,
        });

        if (response.data.success) {
          toast.success(t("settings.imageUpdated"));
        }

        setImageUrl("");
      } catch (error) {
        console.error("Error updating profile image:", error);
        toast.error(t("settings.saveError"));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate that we have a user ID
      if (!userData.id) {
        toast.error("User ID is missing. Please refresh the page.");
        return;
      }

      // Create the data object to send
      const updateData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        profileImage: userData.profileImage,
      };

      const response = await UserService.updateUser(userData.id, updateData);

      if (response.data.success) {
        toast.success(t("settings.saveSuccess"));
      }
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("settings.saveError"));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="layout-content-container flex justify-center items-center">
        <div className="loading-spinner">{t("common.loading")}</div>
      </div>
    );
  }

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

      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111418] text-base font-medium leading-normal pb-2">
            {t("settings.address")}
          </p>
          <textarea
            name="address"
            value={userData.address}
            onChange={handleInputChange}
            rows={3}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbe0e6] bg-white focus:border-[#dbe0e6] placeholder:text-[#60758a] p-[15px] text-base font-normal leading-normal"
            placeholder={t("settings.address")}
          />
        </label>
      </div>

      {/* Rest of the notifications and dark mode sections remain the same */}

      <div className="flex px-4 py-3 justify-start">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate">
            {saving ? t("common.saving") : t("common.save")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
