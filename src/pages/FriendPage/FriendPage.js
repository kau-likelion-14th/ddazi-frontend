import React, { useEffect, useRef, useState } from "react";
import FriendList from "./FriendList";
import FriendSearch from "./FriendSearch";
import FriendUnfollowModal from "./FriendUnfollowModal";
import api from "../../Api";
import config from "../../Config";
import "../../styles/FriendPage.css";

function toFriendModel(user) {
    const [name, tag = ""] = (user.userName || "").split("#");

    return {
        id: String(user.userId),
        userId: user.userId,
        name: name || "이름 없음",
        tag,
        bio: user.introduction || "",
        profileImageUrl: user.profileImageUrl || null,
    };
}

function FriendPage() {
    const [followList, setFollowList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [reloadCount, setReloadCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);
    const [removeError, setRemoveError] = useState("");
    const removingRef = useRef(false);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        const fetchFollowings = async () => {
            setLoading(true);
            setLoadError("");

            try {
                const { data } = await api.get(config.FOLLOW.FOLLOWINGS, {
                    signal: controller.signal,
                });

                if (
                    data?.isSuccess === false ||
                    !Array.isArray(data?.result) ||
                    data.result.some((user) => user?.userId == null)
                ) {
                    throw new Error("잘못된 팔로우 목록 응답");
                }

                if (active) {
                    setFollowList(data.result.map(toFriendModel));
                }
            } catch {
                if (active) {
                    setLoadError("팔로우 목록을 불러오지 못했습니다.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchFollowings();

        return () => {
            active = false;
            controller.abort();
        };
    }, [reloadCount]);

    const handleFollow = () => {
        alert("팔로우 기능은 준비 중입니다.");
    };

    const handleClickRemove = (friend) => {
        if (removingRef.current) return;

        setSelectedFriend(friend);
        setRemoveError("");
        setIsModalOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!selectedFriend || removingRef.current) return;

        removingRef.current = true;
        setIsRemoving(true);
        setRemoveError("");

        try {
            const { data } = await api.delete(config.FOLLOW.DELETE, {
                data: { toUserId: selectedFriend.userId },
            });

            if (data?.isSuccess === false) {
                throw new Error("언팔로우 실패");
            }

            setFollowList((prev) =>
                prev.filter((friend) => friend.id !== selectedFriend.id)
            );
            setIsModalOpen(false);
            setSelectedFriend(null);
        } catch {
            setRemoveError("언팔로우에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            removingRef.current = false;
            setIsRemoving(false);
        }
    };

    const handleCloseModal = () => {
        if (removingRef.current) return;

        setIsModalOpen(false);
        setSelectedFriend(null);
        setRemoveError("");
    };

    return (
        <div className="friend-page">
            <div className="friend-page__inner">
                <div className="friend-page__grid">
                    <FriendList
                        friends={followList}
                        onClickRemove={handleClickRemove}
                        loading={loading}
                        error={loadError}
                        onRetry={() => setReloadCount((count) => count + 1)}
                        emptyText="팔로우하는 친구가 없습니다."
                    />

                    <FriendSearch
                        onFollow={handleFollow}
                        followingList={followList}
                    />
                </div>
            </div>

            <FriendUnfollowModal
                isOpen={isModalOpen}
                friend={selectedFriend}
                onConfirm={handleConfirmRemove}
                onClose={handleCloseModal}
                isSubmitting={isRemoving}
                error={removeError}
            />
        </div>
    );
}

export default FriendPage;
