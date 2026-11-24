import React, {useEffect, useState} from "react";
import "../../styles/Todo.css";
import "../../styles/TodoModal.css";
import RoutineModal from "./RoutineModal";

const TodoModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    onDelete, 
    initialTodo,
    categories = {},
    busy = false,
}) => {
    const isEditMode = Boolean(initialTodo); 

    const [category, setCategory] = useState("공부"); 
    const [text, setText] = useState("");
    const [routine, setRoutine] = useState(null);

    const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setCategory(initialTodo?.category || Object.keys(categories)[0] || "");
        setText(initialTodo?.text || "");
        setRoutine(initialTodo?.routine || null);
    }, [isOpen, initialTodo, categories]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!text.trim() || busy) return;

        if (
            routine &&
            (!routine.startDate || !routine.endDate || !routine.week || routine.startDate > routine.endDate)
        ) {
            alert("루틴의 시작일, 종료일, 반복 요일을 확인해 주세요.");
            return;
        }

        onSave({ 
            text: text.trim(), 
            category,
            routine,
        });
    };

    const categoryKeys = Object.keys(categories);

    return (
        <div className="modal-overlay" onClick={onClose}> 
            <div 
                className="modal-container" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-title">
                    {isEditMode ? "할 일 수정하기" : "할 일 추가하기"}
                </div>
                <div className="modal-section">
                    <div className="modal-label">카테고리</div>
                    <div className="modal-categories">
                        {categoryKeys.map((c) => (
                            <label
                                key={c}
                                className={`modal-categoryitem ${category === c ? 'selected' : ''}`}
                            >
                                <span style={categories[c]}>{c}</span> 
                                <input
                                    type="radio"
                                    name="category"
                                    value={c}
                                    checked={category === c}
                                    onChange={() => setCategory(c)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
                <div className="modal-section">
                    <div className="modal-label">내용</div>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            className="text-input"
                            placeholder="내용을 입력해주세요"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>
                </div>
                <div className="modal-section">
                    <button
                        type="button"
                        className="routine-row"
                        onClick={() => setIsRoutineModalOpen(true)}
                        disabled={busy || (isEditMode && !initialTodo?.routineEnabled)}
                    >
                        <div className="routine-label">
                            {isEditMode && !initialTodo?.routineEnabled
                                ? "일반 Todo는 루틴으로 변경할 수 없어요"
                                : routine
                                  ? "루틴 설정됨 · 수정하기"
                                  : "루틴 등록하기"}
                        </div>
                        <div className="routine-button">{"›"}</div>
                    </button>
                </div>
                <div className="modal-actions">
                    <button
                        className={`leftbutton ${isEditMode ? '' : 'disabled'}`}
                        onClick={onDelete}
                        disabled={!isEditMode || busy}
                    >
                        삭제
                    </button>
                    <button
                        className={`rightbutton ${text.trim() ? '' : 'disabled'}`}
                        onClick={handleSave}
                        disabled={!text.trim() || busy}
                    >
                        {busy ? "처리 중..." : "저장"}
                    </button>
                </div>
                <RoutineModal
                    isOpen={isRoutineModalOpen}
                    initialRoutine={routine}
                    onClose={() => setIsRoutineModalOpen(false)}
                    onSave={(newRoutine) => {
                        setRoutine(newRoutine);
                        setIsRoutineModalOpen(false);
                    }} 
                />
            </div>
        </div>
    );
};

export default TodoModal;
