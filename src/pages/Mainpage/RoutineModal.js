import React, { useEffect, useState } from "react";
import "../../styles/Todo.css";
import "../../styles/TodoModal.css";

const Days = [
    { label: "월", value: "MON" },
    { label: "화", value: "TUE" },
    { label: "수", value: "WED" },
    { label: "목", value: "THU" },
    { label: "금", value: "FRI" },
    { label: "토", value: "SAT" },
    { label: "일", value: "SUN" },
];

const RoutineModal = ({
    isOpen,
    onClose,
    onSave,
    initialRoutine,
}) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [week, setWeek] = useState("");
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        setStartDate(initialRoutine?.startDate || "");
        setEndDate(initialRoutine?.endDate || "");
        setWeek(initialRoutine?.week || "");
        setValidationError("");
    }, [isOpen, initialRoutine]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!startDate || !endDate || !week || startDate > endDate) {
            setValidationError("시작일, 종료일, 반복 요일을 확인해 주세요.");
            return;
        }

        onSave({
            startDate,
            endDate,
            week,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="routine-header">
                    <div className="routine-close" onClick={onClose}>{"‹"}</div>
                    <div className="routine-title">루틴 등록하기</div>
                </div>

                <div className="modal-section">
                    <div className="modal-label">시작 날짜</div>
                    <div className="date-wrapper">
                        <input
                            type="date"
                            className="date-input"
                            value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setValidationError("");
                                }}
                        />
                        <div className="date-initial">{startDate || "없음"}</div>
                    </div>
                </div>

                <div className="modal-section">
                    <div className="modal-label">종료 날짜</div>
                    <div className="date-wrapper">
                        <input
                            type="date"
                            className="date-input"
                            value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setValidationError("");
                                }}
                        />
                        <div className="date-initial">{endDate || "없음"}</div>
                    </div>
                </div>

                <div className="modal-section">
                    <div className="modal-label">반복</div>
                    <div className="modal-categories">
                        {Days.map((day) => (
                            <label
                                key={day.value}
                                className={`modal-categoryitem ${week === day.value ? "on" : ""}`}
                            >
                                <span>{day.label}</span>
                                <input
                                    type="radio"
                                    name="routineWeek"
                                    value={day.value}
                                    checked={week === day.value}
                                    onChange={() => {
                                        setWeek(day.value);
                                        setValidationError("");
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {validationError && (
                    <p className="routine-error" role="alert">{validationError}</p>
                )}

                <div className="modal-actions">
                    <button className="leftbutton2" onClick={onClose}>취소</button>
                    <button
                        className="rightbutton"
                        onClick={handleSave}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoutineModal;
