import React, { useEffect, useMemo, useState } from "react";
import { del, get, patch, post, put } from "../../Api";
import config from "../../Config";
import "../../styles/Todo.css";
import "../../styles/TodoModal.css";
import TodoModal from "./TodoModal";

const categoryStyles = {
    공부: { backgroundColor: '#E5F8F1', color: '#333' },
    운동: { backgroundColor: '#FFC8BE', color: '#333' },
    동아리: { backgroundColor: '#B6DAFF', color: '#333' },
};
const categoryPalette = Object.values(categoryStyles);

const toDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const Todo = ({ selectedDate, todosByDate, onTodoUpdated }) => {
    const dateKey = toDateKey(selectedDate);
    const [serverCategories, setServerCategories] = useState([]);
    const [pendingTodoId, setPendingTodoId] = useState(null);
    const [loadingTodoId, setLoadingTodoId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await get(config.CATEGORIES.GET);

                if (response?.isSuccess === false) {
                    throw new Error(response.message || "카테고리 조회 실패");
                }

                setServerCategories(Array.isArray(response?.result) ? response.result : []);
            } catch (error) {
                console.error("카테고리 조회 실패:", error);
            }
        };

        fetchCategories();
    }, []);

    const Categories = useMemo(
        () => Object.fromEntries(
            serverCategories.map(({ categoryName }, index) => [
                categoryName,
                categoryStyles[categoryName] || categoryPalette[index % categoryPalette.length],
            ])
        ),
        [serverCategories]
    );

    const todos = todosByDate[dateKey] ?? [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const isBusy = isSaving || isDeleting;

    const openModal = () => {
        setEditingTodo(null);
        setIsModalOpen(true);
    };

    const openEditModal = async (todo) => {
        if (loadingTodoId !== null || isBusy) return;

        setLoadingTodoId(todo.id);
        try {
            const response = await get(config.TODOS.DETAIL(todo.id));
            const detail = response?.result;

            if (
                response?.isSuccess === false ||
                detail?.todoId == null ||
                typeof detail.description !== "string" ||
                typeof detail.categoryName !== "string"
            ) {
                throw new Error(response?.message || "Todo 상세 정보가 올바르지 않습니다.");
            }

            setEditingTodo({
                id: detail.todoId,
                text: detail.description,
                category: detail.categoryName,
                completed: todo.completed,
                routineEnabled: detail.routineEnabled === true,
                routine: detail.routineEnabled
                    ? {
                        startDate: detail.startDate || "",
                        endDate: detail.endDate || "",
                        week: detail.week || "",
                    }
                    : null,
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error("Todo 상세 조회 실패:", error);
            alert("Todo 상세 정보를 불러오지 못했어요.");
        } finally {
            setLoadingTodoId(null);
        }
    };

    const handleTodoCompleted = async (todo) => {
        if (pendingTodoId !== null || isBusy) return;
        setPendingTodoId(todo.id);

        try {
            const response = await patch(
                config.TODOS.TOGGLE_COMPLETE(todo.id, dateKey),
                { completed: !todo.completed }
            );

            if (response?.isSuccess === false) {
                throw new Error(response.message || "Todo 완료 상태 변경 실패");
            }

            onTodoUpdated?.();
        } catch (error) {
            console.error("Todo 완료 상태 변경 실패:", error);
            alert("완료 상태를 변경하지 못했어요.");
        } finally {
            setPendingTodoId(null);
        }
    };

    const handleSaveTodo = async ({ text, category, routine }) => {
        if (!text.trim() || isBusy) return;

        const routineEnabled = Boolean(routine);
        const payload = {
            description: text.trim(),
            categoryName: category,
            routineEnabled,
            ...(routineEnabled
                ? {
                    startDate: routine.startDate,
                    endDate: routine.endDate,
                    week: routine.week,
                }
                : {}),
        };

        if (
            editingTodo &&
            editingTodo.routineEnabled !== routineEnabled
        ) {
            alert("일반 Todo와 루틴 Todo 간 유형 변경은 지원되지 않아요.");
            return;
        }

        setIsSaving(true);
        try {
            const response = editingTodo
                ? await put(config.TODOS.UPDATE(editingTodo.id), payload)
                : await post(
                    config.TODOS.CREATE,
                    payload,
                    routineEnabled ? {} : { params: { date: dateKey } }
                );

            if (response?.isSuccess === false) {
                throw new Error(response.message || "Todo 저장 실패");
            }

            setIsModalOpen(false);
            setEditingTodo(null);
            onTodoUpdated?.();
        } catch (error) {
            console.error("Todo 저장 실패:", error);
            alert("Todo를 저장하지 못했어요. 입력한 내용을 확인하고 다시 시도해 주세요.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTodo = async () => {
        if (!editingTodo || isBusy) return;

        setIsDeleting(true);
        try {
            const response = await del(
                config.TODOS.DELETE(editingTodo.id, dateKey)
            );

            if (response?.isSuccess === false) {
                throw new Error(response.message || "Todo 삭제 실패");
            }

            setIsModalOpen(false);
            setEditingTodo(null);
            onTodoUpdated?.();
        } catch (error) {
            console.error("Todo 삭제 실패:", error);
            alert("Todo를 삭제하지 못했어요.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="todo-container">
            <div className="todo-header">
                <div className="todo-title">To do List</div>
                <button className="todo-add" onClick={openModal} disabled={isBusy}>+</button>
            </div>
            <div className="todo-list">
                {todos.map((todo) => (
                    <div
                        key={todo.id}
                        className={`todo-item ${todo.completed ? 'done' : ''}`}
                        onClick={() => openEditModal(todo)}
                        aria-busy={loadingTodoId === todo.id}
                    >
                        <button
                            className={`checkbox ${todo.completed ? 'checked' : ''}`}
                            disabled={pendingTodoId === todo.id || isBusy}
                            aria-label={todo.completed ? "완료 취소" : "Todo 완료"}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleTodoCompleted(todo);
                            }}
                        />
                        <div className="todo-text">
                            {loadingTodoId === todo.id ? "불러오는 중..." : todo.text}
                        </div>
                        <div
                            className="todo-category"
                            style={Categories[todo.category]}
                        >
                            {todo.category}
                        </div>
                    </div>
                ))}
            </div>
            <TodoModal
                isOpen={isModalOpen}
                onClose={() => {
                    if (isBusy) return;
                    setIsModalOpen(false);
                    setEditingTodo(null);
                }}
                onSave={handleSaveTodo}
                onDelete={handleDeleteTodo}
                initialTodo={editingTodo}
                categories={Categories}
                busy={isBusy}
            />
        </div>
    );
};

export default Todo;
