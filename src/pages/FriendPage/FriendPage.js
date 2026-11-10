import React, { useEffect, useRef, useState } from "react";
import FriendList from "./FriendList";
import FriendSearch from "./FriendSearch";
import FriendUnfollowModal from "./FriendUnfollowModal";
import api from "../../Api";
import config from "../../Config";
import { toFriendModel } from "./friendModel";
import "../../styles/FriendPage.css";

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
    const followingRef = useRef(false);
    const [followingId, setFollowingId] = useState(null);
    const [followError, setFollowError] = useState("");
    const [searchRefreshKey, setSearchRefreshKey] = useState(0);

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

    const handleFollow = async (user) => {
        if (
            !user ||
            user.userId == null ||
            loading ||
            loadError ||
            isModalOpen ||
            followingRef.current ||
            removingRef.current ||
            followList.some((friend) => friend.id === user.id)
        ) {
            return;
        }

        followingRef.current = true;
        setFollowingId(user.id);
        setFollowError("");

        try {
            const { data } = await api.post(config.FOLLOW.CREATE, {
                toUserId: user.userId,
            });

            if (
                data?.isSuccess === false ||
                data?.result?.userId == null ||
                String(data.result.userId) !== user.id
            ) {
                throw new Error("팔로우 응답을 확인해 주세요.");
            }

            const newFriend = toFriendModel(data.result);
            setFollowList((prev) =>
                prev.some((friend) => friend.id === newFriend.id)
                    ? prev
                    : [...prev, newFriend]
            );
            setSearchRefreshKey((value) => value + 1);
        } catch {
            setFollowError("팔로우에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            followingRef.current = false;
            setFollowingId(null);
        }
    };

    const handleClickRemove = (friend) => {
        if (removingRef.current || followingRef.current) return;

        setSelectedFriend(friend);
        setRemoveError("");
        setIsModalOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!selectedFriend || removingRef.current || followingRef.current) return;

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
            setSearchRefreshKey((value) => value + 1);
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
                        followingId={followingId}
                        followError={followError}
                        followDisabled={
                            loading ||
                            Boolean(loadError) ||
                            isModalOpen ||
                            isRemoving
                        }
                        refreshKey={searchRefreshKey}
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
