import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FriendCalendar from "./FriendCalendar";
import FriendTodo from "./FriendTodo";

import "../../styles/FriendDetailPage.css";

// todo 카테고리별 배경색과 글자색을 정의한다.
// 이 값은 FriendTodo에 전달되어 todo 카테고리 뱃지 스타일에 사용할 수 있다.
const Categories = {
  공부: { backgroundColor: "#E5F8F1", color: "#333" },
  일상: { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

// Date 객체를 YYYY-MM-DD 형태의 문자열로 변환한다.
// selectedDate를 key로 바꿔 날짜별 todo 목록을 찾을 때 사용한다.
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 친구 상세 페이지에 전달된 친구 정보가 없을 때 사용할 기본 친구 데이터이다.
const dummyFriend = {
  followId: "1",
  name: "나나",
  tag: "1234",
  bio: "안녕하세요! 저는 나나입니다.",
  profileImage: null,
};

// 친구가 저장한 노래처럼 보여주기 위한 임시 데이터이다.
const dummySavedSongs = [
  {
    id: 1,
    title: "Ditto",
    artist: "NewJeans",
    imageUrl: null,
  },
];

// 날짜별 todo 임시 데이터이다.
// 선택된 날짜를 key로 사용해 해당 날짜의 todo 목록을 가져온다.
const dummyTodosByDate = {
  "2026-05-04": [
    { id: 1, text: "프론트 보충자료 읽기", category: "공부", completed: true },
    { id: 2, text: "FriendDetailPage 주석 달기", category: "공부", completed: false },
  ],
  "2026-05-06": [
    { id: 3, text: "친구 페이지 과제 제출", category: "동아리", completed: true },
  ],
  "2026-05-10": [
    { id: 4, text: "React 복습하기", category: "공부", completed: false },
    { id: 5, text: "동아리 회의", category: "동아리", completed: false },
    { id: 6, text: "산책하기", category: "일상", completed: true },
  ],
};

// 날짜별 남은 todo 개수를 표현하기 위한 임시 데이터이다.
const dummyRemainingByDate = {
  "2026-05-04": { hasTodo: true, remaining: 1 },
  "2026-05-06": { hasTodo: true, remaining: 0 },
  "2026-05-10": { hasTodo: true, remaining: 2 },
};

function FriendDetailPage() {
  // useNavigate는 뒤로가기 버튼을 눌렀을 때 이전 페이지로 이동하기 위해 사용한다.
  const navigate = useNavigate();

  // useLocation은 이전 페이지에서 navigate로 전달한 state 값을 읽기 위해 사용한다.
  const location = useLocation();

  // 친구 목록이나 검색 결과에서 전달한 friend 정보가 있으면 가져온다.
  // state가 없는 경우에는 null이 들어간다.
  const passedFriend = location.state?.friend ?? null;

  // 전달받은 친구 정보가 있으면 그 값을 사용하고,
  // 새로고침 등으로 location.state가 사라진 경우에는 dummyFriend를 사용한다.
  const [friend] = useState(passedFriend ?? dummyFriend);

  // 저장한 노래 목록을 state로 관리한다.
  // 현재 코드는 임시 데이터인 dummySavedSongs를 초기값으로 사용한다.
  const [savedSongs] = useState(dummySavedSongs);

  // 현재 선택된 날짜를 state로 관리한다.
  // 이 값이 바뀌면 아래 todos 값이 다시 계산되어 오른쪽 todo 목록이 바뀐다.
  const [selectedDate, setSelectedDate] = useState(new Date("2026-05-04"));

  // 현재 달력에서 보고 있는 월을 관리하기 위한 state이다.
  const [viewDate, setViewDate] = useState(new Date("2026-05-04"));

  // 날짜별 todo 데이터와 남은 todo 데이터를 state로 관리한다.
  const [todosByDate] = useState(dummyTodosByDate);
  const [remainingByDate] = useState(dummyRemainingByDate);

  const latestSong = useMemo(() => {
    // savedSongs가 배열이 아니거나 비어 있으면 표시할 노래가 없으므로 null을 반환한다.
    if (!Array.isArray(savedSongs) || savedSongs.length === 0) return null;

    // 저장한 노래 중 첫 번째 곡을 화면 오른쪽 상단에 보여준다.
    return savedSongs[0];
  }, [savedSongs]);

  const todos = useMemo(() => {
    // 선택된 날짜를 YYYY-MM-DD key로 변환한다.
    const key = toDateKey(selectedDate);

    // 선택된 날짜에 해당하는 todo 배열을 가져온다.
    // selectedDate가 바뀌면 이 값도 다시 계산되고 FriendTodo에 전달된다.
    return todosByDate[key] ?? [];
  }, [selectedDate, todosByDate]);

  return (
    <div className="friend-detail-page">
      <div className="friend-detail-page__inner">
        <div className="friend-detail-page__top">
          {/* 뒤로가기 버튼이다.
              클릭하면 navigate(-1)이 실행되어 이전 페이지로 돌아간다. */}
          <button
            type="button"
            className="friend-detail-page__back"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
          >
            ‹
          </button>

          <div className="friend-detail-page__profile">
            <div className="friend-detail-page__avatar" aria-hidden="true">
              {/* 친구 프로필 이미지가 있으면 이미지를 보여주고,
                  없으면 기본 사용자 아이콘을 보여준다. */}
              {friend?.profileImage ? (
                <img
                  src={friend.profileImage}
                  alt="profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <UserIcon />
              )}
            </div>

            <div className="friend-detail-page__profile-info">
              <div className="friend-detail-page__name-line">
                {/* friend state에 저장된 친구 이름을 표시한다. */}
                <span className="friend-detail-page__name">
                  {friend?.name || " "}
                </span>
              </div>
              <div className="friend-detail-page__bio">
                {/* 소개글이 있으면 소개글을 보여주고, 없으면 기본 문구를 보여준다. */}
                {friend?.bio || "한 줄 소개"}
              </div>
            </div>
          </div>

          <div className="friend-detail-page__songs-inline">
            {/* latestSong이 있으면 노래 정보를 보여주고,
                없으면 저장한 곡이 없다는 문구를 보여준다. */}
            {latestSong ? (
              <div className="friend-detail-page__song-inline-item">
                <div className="friend-detail-page__song-inline-cover">
                  {/* 노래 이미지가 있으면 앨범 이미지를 표시하고,
                      없으면 빈 커버 영역만 남긴다. */}
                  {latestSong?.imageUrl ? (
                    <img
                      src={latestSong.imageUrl}
                      alt={latestSong.title || "album"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ) : null}
                </div>

                <div className="friend-detail-page__song-inline-info">
                  {/* 노래 제목과 아티스트명을 표시한다. 값이 없으면 기본 문구를 보여준다. */}
                  <div className="friend-detail-page__song-inline-title">
                    {latestSong?.title || "제목 없음"}
                  </div>
                  <div className="friend-detail-page__song-inline-artist">
                    {latestSong?.artist || "아티스트 정보 없음"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="friend-detail-page__songs-inline-empty">
                저장한 곡이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="friend-detail-page__grid">
          <div className="friend-detail-page__calendar">
            {/* FriendCalendar 컴포넌트에 선택 날짜와 날짜 변경 함수를 props로 전달한다.
                날짜가 바뀌면 selectedDate가 변경되고, 그 날짜에 맞는 todo 목록이 다시 계산된다. */}
            <FriendCalendar
              initialDate={selectedDate}
              onDateChange={(date) => date && setSelectedDate(date)}
              onMonthChange={(date) => {
                if (!date) return;
                setViewDate(date);
              }}
              todosByDate={todosByDate}
              remainingByDate={remainingByDate}
            />
          </div>

          <div className="friend-detail-page__todo">
            {/* 선택된 날짜에 해당하는 todos와 카테고리 스타일 정보를 FriendTodo에 전달한다. */}
            <FriendTodo
              title="To do List"
              todos={todos}
              categories={Categories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 프로필 이미지가 없는 친구에게 보여줄 기본 사용자 아이콘 컴포넌트이다.
function UserIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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

export default FriendDetailPage;