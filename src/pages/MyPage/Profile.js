import React, { useRef, useState, useEffect } from "react";
import { get, put, post, uploadProfile } from "../../Api";
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
  const [song, setSong] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSong, setSelectedSong] = useState();

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


      setNickname(result?.username || "");
      setIntro(result?.introduction || "");
      setProfileImageUrl(result?.profileImageUrl || null);

      const songResponse = await get(config.YOUTUBE.ME);

      if (
        songResponse?.isSuccess === false ||
        !Array.isArray(songResponse?.result)
      ) {
        throw new Error("저장된 노래 조회 실패");
      }

      const songs = [...songResponse.result].sort(
        (a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt)
      );

      const latest = songs[0];
      setSong(latest ? `${latest.title} - ${latest.artist}` : "");

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
        console.error("소개글 저장 실패:", introResponse);
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

        alert("프로필 이미지가 저장됐어요.");

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

  const handleSearchSong = async () => {
    if (!song.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    try {
      const response = await get(
        `${config.YOUTUBE.SEARCH}?q=${encodeURIComponent(song.trim())}`
      );

      console.log("노래 검색 결과:", response);

      const results = response?.result ?? [];

      setSearchResults(results);

      setShowSearchResults(true);
    } catch (error) {
      console.error("노래 검색 실패:", error);
      alert("노래 검색에 실패했어요.");
    }
  }

  const handleSaveSong = async (selectedSong) => {
  if (!selectedSong) return;

  try {
    const response = await post(config.YOUTUBE.SAVE, {
      songId: selectedSong.songId,
      title: selectedSong.title,
      artist: selectedSong.artist,
    });

    if (response?.isSuccess === false) {
      throw new Error(response.message || "노래 저장 실패");
    }

    // 저장 성공 후 화면 갱신
    setSong(`${selectedSong.title} - ${selectedSong.artist}`);
    setShowSearchResults(false);
    setSearchResults([]);

    alert("좋아하는 노래가 저장됐어요.");
  } catch (error) {
    console.error("노래 저장 실패:", error.response?.data || error);

    if (error.response?.status === 409) {
      alert("이미 저장된 노래입니다.");
    } else {
      alert("노래 저장에 실패했어요.");
    }
  }
};

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
              value={song}
              placeholder="좋아하는 노래를 입력하세요"
              onChange={(e) => {
                setSong(e.target.value);
                setSelectedSong(null);
                setShowSearchResults(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSong();
                }
              }}
              
            />
            <span className="search-icon"
              src = {handleSearchSong}
              onClick={handleSearchSong}
              style={{ cursor: "pointer" }}
            >⌕</span>
          </div>
        </label>

        {showSearchResults &&
        <div className="song-search-results">
          {searchResults.length === 0 ? (
            <p>검색결과가 없습니다.</p>
          ) : (
            searchResults.map((item) => (
              <div
                key={(item.songId)}
                className="song-search-item"
                onClick = {() => handleSaveSong(item)}
              >
                  {item.title} - {item.artist}
              </div>
            ))
          )}
        
        
      </div>
      }
    </div>
    </section>
  );
}
export default Profile;
