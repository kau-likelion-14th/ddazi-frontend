import React, { useMemo } from "react";

import "../../styles/Todo.css";
import "../../styles/FriendTodo.css";

const FriendTodo = ({ title = "To do List", todos = [], categories = {} }) => {

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