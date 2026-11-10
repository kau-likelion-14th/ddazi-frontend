import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import api from "../../Api";
import config from "../../Config";
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

function useFriendResource(url, params, validate, retry) {
  const [state, setState] = useState({ loading: true, error: "", value: null });
  const query = JSON.stringify(params);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setState({ loading: true, error: "", value: null });

    api.get(url, { params: JSON.parse(query), signal: controller.signal })
      .then((response) => {
        const data = response?.data ?? response;

      if (data?.isSuccess === false || !validate(data?.result)) {
        throw new Error("잘못된 응답");
      }

      if (active) {
        setState({
          loading: false,
          error: "",
          value: data.result
        });
      }
    })
    .catch(() => {
            if (active) {
              setState({ loading: false, error: "데이터를 불러오지 못했습니다.", value: null });
            }
          });

        return () => {
          active = false;
          controller.abort();
        };
      }, [url, query, validate, retry]);

      return state;
    }

const validProfile = (value) => typeof value?.username === "string";
const validTodos = (value) =>
  Array.isArray(value) &&
  value.every((todo) =>
  typeof todo.description == "string" &&
  typeof todo.completed == "boolean");
const validCalendar = (value) =>
  Array.isArray(value?.days) &&
  value.days.every((day) =>
  typeof day?.date === "string" &&
  typeof day?.hasTodo === "boolean" &&
  Number.isFinite(day.remaining));;

function ResourceState({ resource, onRetry }) {
  if (resource.loading) {
    return <p role="status">불러오는 중...</p>;
  }
  if (resource.error) {
    return (
      <div>
        <p role = "alert">
          {resource.error}
          </p>
        <button onClick={onRetry}>다시 시도</button>
      </div>
    );
  }
  return null;
}

function FriendDetailPage() {
  // useNavigate는 뒤로가기 버튼을 눌렀을 때 이전 페이지로 이동하기 위해 사용한다.
  const navigate = useNavigate();

  const {id} = useParams();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(() => new Date());
  const [retries, setRetries] = useState({profile: 0, todos: 0, calendar: 0});
  const retry = (key) => setRetries((prev) => ({ ...prev, [key]: prev[key] + 1 }));

  const base = config.FOLLOW.PROFILE(id);
  const profile = useFriendResource(base, {}, validProfile, retries.profile);
  const todoResource = useFriendResource(
    config.FOLLOW.TODOS(id),
    { date: toDateKey(selectedDate)},
    validTodos,
    retries.todos
  );
  const calendar = useFriendResource(
    config.FOLLOW.CALENDAR(id),
    {year : viewDate.getFullYear(), month: viewDate.getMonth() + 1},
    validCalendar,
    retries.calendar
  );

  const friend = profile.value ? {
    name: profile.value.username.split("#")[0],
    bio: profile.value.introduction,
    profileImage: profile.value.profileImageUrl,
  }: null;

  const todos = (todoResource.value || []).map ((todo) => ({
  id: todo.todoId,
  text: todo.description,
  category: todo.categoryName,
  completed: todo.completed,
}));

const remainingByDate = Object.fromEntries(
  (calendar.value?.days || []).map((day) => [day.date, day])
);

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
                  {friend?.name || "이름 없음"}
                </span>
              </div>
              <div className="friend-detail-page__bio">
                {/* 소개글이 있으면 소개글을 보여주고, 없으면 기본 문구를 보여준다. */}
                {friend?.bio || "한 줄 소개"}
              </div>
            </div>
          </div>
          <ResourceState resource={profile} onRetry={() => retry("profile")} />
        </div>

        <div className="friend-detail-page__grid">
          <div className="friend-detail-page__calendar">
            <ResourceState resource={calendar} onRetry={() => retry("calendar")} />
            {/* FriendCalendar 컴포넌트에 선택 날짜와 날짜 변경 함수를 props로 전달한다.
                날짜가 바뀌면 selectedDate가 변경되고, 그 날짜에 맞는 todo 목록이 다시 계산된다. */}
            <FriendCalendar
              initialDate={selectedDate}
              onDateChange={(date) => date && setSelectedDate(date)}
              onMonthChange={(date) => {
                if (!date) return;
                setViewDate(date);
              }}
              remainingByDate={remainingByDate}
            />
          </div>

          <div className="friend-detail-page__todo">
            <ResourceState resource={todoResource} onRetry={() => retry("todos")} />
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