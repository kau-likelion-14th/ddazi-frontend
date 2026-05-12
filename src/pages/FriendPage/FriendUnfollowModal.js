import React, { useEffect } from "react";
import "../../styles/FriendUnfollowModal.css";

function FriendUnfollowModal({ isOpen, friend, onConfirm, onClose }) {
  useEffect(() => {
    // 모달이 닫혀 있는 상태라면 키보드 이벤트를 등록할 필요가 없으므로 바로 종료한다.
    if (!isOpen) return;

    // 모달이 열린 상태에서 Escape 키를 누르면 onClose를 실행해 모달을 닫는다.
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    // 모달이 열리면 keydown 이벤트를 등록한다.
    document.addEventListener("keydown", handleKeyDown);

    // 모달이 닫히거나 컴포넌트가 사라질 때 등록했던 이벤트를 제거한다.
    // 이렇게 해야 같은 이벤트가 계속 중복 등록되는 문제를 막을 수 있다.
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // isOpen이 false이면 모달 자체를 화면에 렌더링하지 않는다.
  if (!isOpen) return null;

  // friend 값이 없을 수도 있으므로 optional chaining과 기본값을 사용해 안전하게 표시한다.
  const displayName = friend?.name ?? "";
  const displayTag = friend?.tag ? `#${friend.tag}` : "";

  const handleOverlayClick = (e) => {
    // 모달 바깥 overlay 영역을 클릭했을 때만 닫는다.
    // 모달 내부 content를 클릭한 경우에는 e.target과 e.currentTarget이 다르기 때문에 닫히지 않는다.
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="friend-unfollow-modal__overlay" onClick={handleOverlayClick}>
      <div
        className="friend-unfollow-modal__content"
        role="dialog"
        aria-modal="true"
      >
        <p className="friend-unfollow-modal__text">
          {/* 삭제 대상 친구의 이름과 태그를 표시한다. */}
          <span className="friend-unfollow-modal__name">{displayName}</span>{" "}
          <span className="friend-unfollow-modal__tag">{displayTag}</span>
          님을 팔로우 목록에서
          <br />
          삭제하시겠습니까?
        </p>

        <div className="friend-unfollow-modal__actions">
          {/* 예 버튼을 누르면 부모 컴포넌트에서 전달받은 onConfirm이 실행되어 삭제를 확정한다. */}
          <button
            type="button"
            className="friend-unfollow-modal__btn friend-unfollow-modal__btn--yes"
            onClick={onConfirm}
          >
            예
          </button>

          {/* 아니오 버튼을 누르면 onClose가 실행되어 삭제하지 않고 모달만 닫는다. */}
          <button
            type="button"
            className="friend-unfollow-modal__btn friend-unfollow-modal__btn--no"
            onClick={onClose}
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendUnfollowModal;