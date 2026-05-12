import { useNavigate } from "react-router-dom";
import deleteIcon from "../../assets/icon/delete.png";
import "../../styles/FriendList.css";

function FriendList(
  {
    title = "팔로우 목록",
    friends = [],
    onClickRemove,
    emptyText = "팔로우하는 친구가 없습니다.",
  }
) {
  // useNavigate는 코드 안에서 특정 주소로 페이지를 이동시키기 위해 사용한다.
  const navigate = useNavigate();

  // 친구 정보 영역을 클릭했을 때 실행되는 함수이다.
  // 클릭한 friend의 id를 주소에 포함해 각 친구별 상세 페이지로 이동하고,
  // state를 통해 상세 페이지에서도 해당 friend 정보를 사용할 수 있게 전달한다.
  const goFriendDetail = (friend) => {
    navigate(`/friends/${friend.id}`, { state: { friend } });
  };

  return (
    <section className="friend-list">
      {/* 부모 컴포넌트에서 전달받은 title 값을 친구 목록 제목으로 출력한다. */}
      <h2 className="friend-list__title">{title}</h2>

      {/* friends 배열이 비어 있으면 emptyText를 보여주고,
          배열에 친구 데이터가 있으면 map으로 친구 수만큼 목록을 반복해서 만든다. */}
      {friends.length === 0 ? (
        <div className="friend-list__empty">{emptyText}</div>
      ) : (
        <ul className="friend-list__items">
          {friends.map((friend) => (
            <li key={friend.id} className="friend-list__item">
              {/* 친구 정보 영역이다.
                  이 영역을 클릭하면 goFriendDetail(friend)가 실행되어 상세 페이지로 이동한다. */}
              <div
                className="friend-list__left"
                role="button"
                tabIndex={0}
                onClick={() => {
                  goFriendDetail(friend);
                }}
                >

                <div className="friend-avatar" aria-hidden="true">
                  {/* profileImageUrl이 있으면 프로필 이미지를 보여주고,
                      없으면 기본 사용자 아이콘을 보여준다. */}
                  {friend.profileImageUrl ? (
                    <img
                      className="friend-avatar__img"
                      src={friend.profileImageUrl}
                      alt="프로필 사진"
                      />
                  ) : (
                    <UserIcon/>
                  )}
                </div>

                <div className="friend-info">
                  <div className = "friend-info__top">
                    {/* 친구의 이름과 태그를 화면에 표시한다. */}
                    <span className="friend-info__name">{friend.name}</span>
                    <span className="friend-info__tag">#{friend.tag}</span>
                  </div>

                  {/* 소개글이 있으면 소개글을 보여주고,
                      없으면 "소개글이 없습니다." 문구를 보여준다. */}
                  {friend.bio ?(
                    <div className="friend-info__bio">{friend.bio}</div>
                  ) : (
                    <div className="friend-info__empty">소개글이 없습니다.</div>
                  )}
                </div>
              </div>

              {/* 삭제 버튼은 친구 정보 영역 안의 상세 페이지 이동 클릭과 별도로 동작한다. */}
              <button
                className="friend-remove-btn"
                type="button"
                aria-label="삭제"
                onClick={(e)=>{
                  // 삭제 버튼 클릭이 부모 요소의 클릭 이벤트로 전달되면 상세 페이지로 이동할 수 있으므로 전파를 막는다.
                  e.stopPropagation();

                  // 부모 컴포넌트에서 onClickRemove를 전달한 경우에만 실행하고,
                  // 삭제할 친구 정보를 인자로 넘긴다.
                  onClickRemove?.(friend);
                }}
                >
                  <img className="friend-remove-icon" src={deleteIcon} alt="삭제 아이콘" />
                </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// 프로필 이미지가 없는 친구에게 보여줄 기본 사용자 아이콘 컴포넌트이다.
function UserIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

export default FriendList;