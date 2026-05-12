import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/FriendSearch.css";
import searchIcon from "../../assets/icon/search.png";

// 검색 결과로 사용할 임시 사용자 목록이다.
// 현재는 dummyUsers 배열에서 검색하지만, 실제 서비스에서는 서버에서 받은 사용자 데이터로 대체할 수 있다.
const dummyUsers = [
    {
        id: "1",
        userId: 1,
        name: "나나",
        tag: "1234",
        bio: "안녕하세요! 저는 나나입니다.",
        profileImageUrl: null,
    },
    {
        id: "2",
        userId: 2,
        name: "얀",
        tag: "2342",
        bio: "^^",
        profileImageUrl: null,
    },
    {
        id: "3",
        userId: 3,
        name: "지말",
        tag: "1214",
        bio: "ㅎㅎ",
        profileImageUrl: null,
    },
    {
        id: "4",
        userId: 4,
        name: "코다",
        tag: "1223",
        bio: ";ㅁ;",
        profileImageUrl: null,
    },
    {
        id: "5",
        userId: 5,
        name: "딜런",
        tag: "1777",
        bio: ".",
        profileImageUrl: null,
    },
];

function FriendSearch({
  title = "팔로우 요청",
  placeholder = "이름/태그로 검색",
  onFollow,
  followingList = [],
}) {
  // 검색 결과의 사용자 정보를 클릭했을 때 페이지를 이동하기 위해 사용한다.
  const navigate = useNavigate();

  // 검색창에 입력한 값을 query state로 관리한다.
  // query가 바뀌면 검색 결과를 다시 계산하고 화면에 반영한다.
  const [query, setQuery] = useState("");

  const followingIdSet = useMemo(() => {
    // followingList 배열에서 이미 팔로우 중인 사용자의 id만 모아 Set으로 만든다.
    // Set을 사용하면 검색 결과의 사용자가 이미 팔로우 중인지 빠르게 확인할 수 있다.
    return new Set(followingList.map((x) => x.id));
  }, [followingList]);

  const results = useMemo(() => {
    // 사용자가 입력한 검색어의 앞뒤 공백을 제거한다.
    const q = query.trim();

    // 검색어가 비어 있으면 검색 결과를 보여주지 않기 위해 빈 배열을 반환한다.
    if (!q) return [];

    // dummyUsers에서 이름, 태그, 이름#태그 중 검색어가 포함된 사용자만 필터링한다.
    // query state가 바뀔 때마다 이 결과가 다시 계산되고, 화면의 검색 목록도 바뀐다.
    return dummyUsers.filter((user) => {
      return (
        user.name.includes(q) ||
        user.tag.includes(q) ||
        `${user.name}#${user.tag}`.includes(q)
      );
    });
  }, [query]);

  // 검색 결과의 사용자 영역을 클릭했을 때 친구 상세 페이지로 이동한다.
  // state에는 클릭한 friend 정보를 담아 상세 페이지에서 사용할 수 있게 한다.
  const goFriendDetail = (friend) => {
    navigate("/friends/detail", { state: { friend } });
  };

  return (
    <section className="friend-search">
      {/* 부모 컴포넌트에서 전달받은 title을 검색 영역 제목으로 보여준다. */}
      <h2 className="friend-search__title">{title}</h2>

      <div className="friend-search__input-box">
        <span className="friend-search__icon" aria-hidden="true">
          <img
            src={searchIcon}
            alt="검색"
            className="friend-search__icon-img"
          />
        </span>

        <input
          className="friend-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      {/* 검색어가 비어 있으면 아무것도 보여주지 않는다.
          검색어가 있고 결과가 없으면 안내 문구를 보여주며,
          결과가 있으면 검색된 사용자 목록을 보여준다. */}
      {query.trim() === "" ? null : results.length === 0 ? (
        <div className="friend-search__empty">검색 결과가 없습니다.</div>
      ) : (
        <ul className="friend-search__list">
          {results.map((user) => {
            // 현재 검색 결과의 사용자가 이미 팔로우 목록에 있는지 확인한다.
            // true이면 버튼을 비활성화하고 "팔로잉"으로 보여준다.
            const isFollowing = followingIdSet.has(user.id);

            return (
              <li key={user.id} className="friend-search__item">
                {/* 검색 결과의 왼쪽 사용자 정보 영역이다.
                    클릭하거나 Enter/Space 키를 누르면 해당 사용자 상세 페이지로 이동한다. */}
                <div
                  className="friend-search__left"
                  role="button"
                  tabIndex={0}
                  onClick={() => goFriendDetail(user)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") goFriendDetail(user);
                  }}
                >
                  <div className="friend-avatar" aria-hidden="true">
                    {/* 프로필 이미지가 있으면 이미지를 보여주고,
                        없으면 기본 사용자 아이콘을 보여준다. */}
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt=""
                        className="friend-avatar__img"
                      />
                    ) : (
                      <UserIcon />
                    )}
                  </div>

                  <div className="friend-info">
                    <div className="friend-info__top">
                      {/* 검색 결과 사용자의 이름과 태그를 출력한다. */}
                      <span className="friend-info__name">{user.name}</span>
                      <span className="friend-info__tag">#{user.tag}</span>
                    </div>

                    <div className="friend-info__bio">
                      {/* bio가 있으면 bio를 보여주고, 없으면 기본 문구를 보여준다. */}
                      {user.bio || "한 줄 소개"}
                    </div>
                  </div>
                </div>

                {/* 팔로우 버튼이다.
                    이미 팔로우 중이면 disabled가 true가 되어 다시 클릭할 수 없다. */}
                <button
                  type="button"
                  className={`friend-follow-btn ${
                    isFollowing ? "is-disabled" : ""
                  }`}
                  onClick={(e) => {
                    // 버튼 클릭이 부모 영역의 상세 페이지 이동 이벤트로 이어지지 않도록 막는다.
                    e.stopPropagation();

                    // 부모 컴포넌트에서 onFollow를 전달한 경우에만 실행하고,
                    // 팔로우할 사용자 정보를 인자로 넘긴다.
                    onFollow?.(user);
                  }}
                  disabled={isFollowing}
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// 프로필 이미지가 없는 사용자에게 보여줄 기본 사용자 아이콘 컴포넌트이다.
function UserIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z"
        fill="#ffffff"
        opacity="0.9"
      />
      <path
        d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default FriendSearch;