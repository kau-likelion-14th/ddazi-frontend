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

export default function FriendCalendar({
  initialDate,
  onDateChange,
  onMonthChange,
  remainingByDate = {},
}) {
  const getDayMeta = (date) => {
    const day = remainingByDate[toDateKey(date)];

    return {
      hasTodos: day?.hasTodos === true,
      remaining: day?.remaining ?? 0,
      allDone: day?.hasTodo === true && day.remaining
    };
};


  return (
    <div className="calendar-container">
      <Calendar
        onChange={(value) => onDateChange?.(value instanceof Date ? value : value?.[0])}
        onActiveStartDateChange={({ activeStartDate }) => onMonthChange?.(activeStartDate)}
        value={initialDate}
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