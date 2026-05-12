import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import React, { useState } from "react";
import "../../styles/Calendar.css";

// Date 객체를 YYYY-MM-DD 형태의 문자열로 변환한다.
// 이 문자열을 key로 사용해 날짜별 todo 데이터를 찾는다.
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 날짜별 todo 임시 데이터이다.
// 각 날짜 key에 해당하는 배열을 통해 해당 날짜의 할 일 목록을 확인한다.
const dummyTodosByDate = {
  "2026-05-04": [
    { id: 1, title: "프론트 보충자료 읽기", completed: true },
    { id: 2, title: "FriendCalendar 주석 달기", completed: false },
  ],
  "2026-05-06": [
    { id: 3, title: "친구 페이지 과제 제출", completed: true },
  ],
  "2026-05-10": [
    { id: 4, title: "React 복습하기", completed: false },
    { id: 5, title: "props 정리하기", completed: false },
    { id: 6, title: "useState 정리하기", completed: true },
  ],
};

export default function FriendCalendar() {
  // 현재 선택된 날짜를 selectedDate state로 관리한다.
  // 사용자가 달력에서 날짜를 클릭하면 이 값이 바뀌고, Calendar의 value도 함께 바뀐다.
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (value) => {
    // react-calendar의 onChange 값은 Date이거나 날짜 범위 배열일 수 있다.
    // 현재 코드는 단일 날짜를 사용하기 위해 Date 객체 또는 배열의 첫 번째 값을 꺼낸다.
    const next = value instanceof Date ? value : value?.[0];

    // 선택된 날짜가 없으면 상태를 변경하지 않는다.
    if (!next) return;

    // 선택된 날짜를 state에 저장한다.
    // state가 바뀌면 Calendar의 선택 날짜 표시도 새 값으로 갱신된다.
    setSelectedDate(next);
  };

  const getDayMeta = (date) => {
    // 날짜를 YYYY-MM-DD key로 바꾼 뒤 해당 날짜의 todo 목록을 가져온다.
    const key = toDateKey(date);
    const list = dummyTodosByDate[key] ?? [];

    // 해당 날짜에 todo가 없으면 달력 칸에 별도 표시를 하지 않도록 정보를 반환한다.
    if (list.length === 0) {
      return { hasTodos: false, remaining: 0, allDone: false };
    }

    // 완료되지 않은 todo의 개수를 계산한다.
    const remaining = list.filter((todo) => !todo.completed).length;

    // todo가 있는지, 남은 개수가 몇 개인지, 모두 완료되었는지 반환한다.
    // 이 값은 tileContent와 tileClassName에서 달력 칸 표시를 결정하는 데 사용된다.
    return {
      hasTodos: true,
      remaining,
      allDone: remaining === 0,
    };
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        calendarType="gregory"
        view="month"
        prev2Label={null}
        next2Label={null}
        showNeighboringMonth={true}
        formatDay={(locale, date) => String(date.getDate())}
        tileContent={({ date, view }) => {
          // 월 단위 화면이 아닐 때는 날짜 칸 안에 추가 내용을 표시하지 않는다.
          if (view !== "month") return null;

          const { hasTodos, remaining, allDone } = getDayMeta(date);

          // todo가 없는 날짜에는 숫자나 별표를 표시하지 않는다.
          if (!hasTodos) return null;

          // 모든 todo가 완료된 날짜는 별표를 보여주고,
          // 아직 완료되지 않은 todo가 있으면 남은 todo 개수를 보여준다.
          return <div className="tile-meta">{allDone ? "★" : remaining}</div>;
        }}
        tileClassName={({ date, view }) => {
          // 월 단위 화면이 아닐 때는 추가 className을 적용하지 않는다.
          if (view !== "month") return "";

          const { hasTodos, allDone } = getDayMeta(date);

          // todo가 없는 날짜는 기본 스타일을 유지한다.
          if (!hasTodos) return "";

          // todo가 모두 완료된 날짜와 아직 남은 todo가 있는 날짜에 서로 다른 className을 적용한다.
          return allDone ? "tile-done" : "tile-has";
        }}
      />
    </div>
  );
}