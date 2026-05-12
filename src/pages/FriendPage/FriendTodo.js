import React, { useMemo } from "react";

import "../../styles/Todo.css";
import "../../styles/FriendTodo.css";

// 친구 상세 페이지에서 보여줄 임시 todo 데이터이다.
// 현재 코드는 이 배열을 기준으로 todo 목록을 렌더링한다.
const dummyTodos = [
  { id: 1, text: "프론트 보충자료 읽기", category: "공부", completed: true },
  { id: 2, text: "FriendTodo 구현하기", category: "공부", completed: false },
  { id: 3, text: "동아리 회의", category: "동아리", completed: false },
];

// todo 카테고리별 스타일 정보이다.
// todo의 category 값과 같은 key를 찾아 카테고리 뱃지 색상을 적용한다.
const dummyCategories = {
  공부: { backgroundColor: "#E5F8F1", color: "#333" },
  일상: { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

const FriendTodo = ({ title = "To do List" }) => {
  // 현재 컴포넌트는 dummyTodos를 todo 목록 데이터로 사용한다.
  const todos = dummyTodos;

  // 현재 컴포넌트는 dummyCategories를 카테고리 스타일 정보로 사용한다.
  const categories = dummyCategories;

  const counts = useMemo(() => {
    // 전체 todo 개수를 계산한다.
    const total = todos.length;

    // completed가 true인 todo만 골라 완료된 todo 개수를 계산한다.
    const done = todos.filter((t) => t.completed).length;

    // 전체 개수와 완료 개수를 객체로 반환한다.
    return { total, done };
  }, [todos]);

  return (
    <div className="friend-todo">
      <div className="todo-container">
        <div className="todo-header">
          {/* 부모 컴포넌트에서 전달받은 title 값을 todo 목록 제목으로 보여준다. */}
          <div className="todo-title">{title}</div>
        </div>

        <div className="todo-list">
          {/* todos 배열이 비어 있으면 빈 상태 문구를 보여주고,
              데이터가 있으면 map으로 todo 항목을 반복 렌더링한다. */}
          {todos.length === 0 ? (
            <div className="friend-todo__empty">등록된 투두가 없습니다.</div>
          ) : (
            todos.map((t) => (
              <div key={t.id} className={`todo-item ${t.completed ? "done" : ""}`}>
                {/* 완료된 todo라면 checked class가 추가되어 체크된 상태로 보인다. */}
                <div className={`checkbox ${t.completed ? "checked" : ""}`} />

                {/* todo의 실제 내용을 화면에 표시한다. */}
                <div className="todo-text">{t.text}</div>

                <div
                  className="todo-category"
                  style={categories[t.category] ?? undefined}
                >
                  {/* todo의 category 값을 화면에 표시한다. */}
                  {t.category}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendTodo;