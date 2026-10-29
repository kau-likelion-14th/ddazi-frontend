import React, { useRef, useState } from "react";

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
  const [intro, setIntro] = useState("안녕하세요");
  const [favoriteSong, setFavoriteSong] = useState("내꺼하자 - 인피니트");


  let nickname = "";

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    nickname = user.username || "";
  } catch (error) {
    console.error("사용자 정보 불러오기 실패:", error);
  }


  const handleClickEditIcon = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImageFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveProfile = () => {
    const profileData = {
      nickname,
      intro,
      favoriteSong,
      imageFileName: selectedImageFile?.name || "기본 이미지",
    };

    console.log("저장된 프로필 정보:", profileData);
    alert("프로필이 저장되었습니다.");
  };

  const displayImageSrc = previewUrl || defaultProfileImage;

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
}

export default Profile;