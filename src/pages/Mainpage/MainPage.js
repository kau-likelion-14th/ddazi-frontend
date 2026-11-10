import React, { useEffect, useState } from "react";
import { get } from "../../Api";
import config from "../../Config";
import CustomCalendar from "./Calendar";
import Todo from "./Todo";
import "../../styles/MainPage.css";

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const MainPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [todosByDate, setTodosByDate] = useState({});
  const [calendarByDate, setCalendarByDate] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const dateKey = toDateKey(selectedDate);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await get(config.CALENDAR.GET, {
          year: viewDate.getFullYear(),
          month: viewDate.getMonth() + 1,
        });

        if (response?.isSuccess === false) {
          throw new Error(response.message || "캘린더 조회 실패");
        }

        const days = Array.isArray(response?.result?.days)
          ? response.result.days
          : [];
        setCalendarByDate(Object.fromEntries(days.map((day) => [day.date, day])));
      } catch (error) {
        console.error("캘린더 조회 실패:", error);
        setCalendarByDate({});
      }
    };

    fetchCalendar();
  }, [viewDate, refreshKey]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await get(config.TODOS.LIST, { date: dateKey });

        if (response?.isSuccess === false) {
          throw new Error(response.message || "Todo 목록 조회 실패");
        }

        const todos = Array.isArray(response?.result)
          ? response.result.map((todo) => ({
              id: todo.todoId,
              text: todo.description,
              category: todo.categoryName,
              completed: todo.completed,
            }))
          : [];

        setTodosByDate((prev) => ({ ...prev, [dateKey]: todos }));
      } catch (error) {
        console.error("Todo 목록 조회 실패:", error);
        setTodosByDate((prev) => ({ ...prev, [dateKey]: [] }));
      }
    };

    fetchTodos();
  }, [dateKey, refreshKey]);

  return (
    <div className="mainpage-container">
      <CustomCalendar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        viewDate={viewDate}
        onViewDateChange={setViewDate}
        calendarByDate={calendarByDate}
      />
      <Todo
        selectedDate={selectedDate}
        todosByDate={todosByDate}
        setTodosByDate={setTodosByDate}
        onTodoUpdated={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
};

export default MainPage;
