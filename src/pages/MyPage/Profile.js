import React, { useRef, useState, useEffect } from "react";
import { get, put, uploadProfile } from "../../Api";
import config from "../../Config";

const defaultProfileImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" rx="100" fill="#f1f1f1"/>
    <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle" font-size="96">🦁</text>
  </svg>
`)}`;

function Profile() {
  const fileInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [nickname, setNickname] = useState("");
  const [intro, setIntro] = useState("");
  const [favoriteSong, setFavoriteSong] = useState("내꺼하자 - 인피니트");

  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchProfileData = async () => {
    try {
      const response = await get(config.PROFILE.GET);
      const result = response?.result;

      console.log("프로필 데이터:", result);

      setNickname(result?.username || "");
      setIntro(result?.introduction || "");
      setProfileImageUrl(result?.profileImageUrl || null);

    } catch (error) {
      console.error("프로필 데이터 불러오기 실패:", error);
    }
  };

  const handleClickEditIcon = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    let introSaved = false;

    try {
      const introResponse = await put(config.PROFILE.INTRO, {
        introduce: intro,
      });

      if (introResponse?.isSuccess === false) {
        throw new Error(introResponse.message || "소개글 저장 실패");
      }
      introSaved = true;

      if (selectedImageFile) {
        const imageResponse = await uploadProfile(config.PROFILE.PUT, {
          imageFile: selectedImageFile,
        });

        if (imageResponse?.isSuccess === false) {
          throw new Error(imageResponse.message || "프로필 이미지 저장 실패");
        }

        setProfileImageUrl(imageResponse.result?.profileImageUrl || profileImageUrl);
        setSelectedImageFile(null);
        setPreviewUrl("");
      }

      alert("프로필이 저장됐어요.");
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      alert(
        introSaved
          ? "소개글은 저장됐지만 프로필 이미지 저장에 실패했어요."
          : "프로필 저장에 실패했어요."
      );
    }
  };

  const displayImageSrc = previewUrl || profileImageUrl || defaultProfileImage;

  return (
    <section className="profile-section">
      <div className="profile-top">
        <div className="profile-left">
          <div className="profile-image-wrapper">
            <img
              className="profile-img"
              src={displayImageSrc}
              alt="프로필 이미지"
            />

            <button
              type="button"
              className="profile-edit-button"
              onClick={handleClickEditIcon}
              aria-label="프로필 이미지 수정"
            >
              ✎
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="profile-file-input"
              onChange={handleFileChange}
            />
          </div>

          <h2 className="profile-nickname">{nickname}</h2>
        </div>

        <button
          type="button"
          className="profile-save-button"
          onClick={handleSaveProfile}
        >
          프로필 저장
        </button>
      </div>

      <div className="profile-form">
        <label className="profile-label">
          한 줄 소개
          <input
            className="profile-input"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="한 줄 소개를 입력하세요"
          />
        </label>

        <label className="profile-label">
          좋아하는 노래
          <div className="song-input-wrapper">
            <span className="song-icon">🎵</span>
            <input
              className="song-input"
              value={favoriteSong}
              onChange={(e) => setFavoriteSong(e.target.value)}
              placeholder="좋아하는 노래를 입력하세요"
            />
            <span className="search-icon">⌕</span>
          </div>
        </label>
      </div>
    </section>
  );
};
export default Profile;
