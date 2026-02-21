import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegStar } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";
import { icons } from "utils/constants";

const Sidebar = ({
    chatList,
    selectedChat,
    setSelectedChat,
    searchQuery,
    setSearchQuery,
    typingUsers,
    onlineUsers,
    lastSeenData,
    userId,
}) => {
      const { t, i18n } = useTranslation();
    
    const [starredChats, setStarredChats] = useState({});

    const getUnreadCount = (chat) => chat.unreadCount || 0;

    const filteredChatList = chatList.filter((chat) =>
        chat.partnerId.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleStar = (chatId) => {
        setStarredChats((prev) => ({
            ...prev,
            [chatId]: !prev[chatId],
        }));
    };

    const previewMessage = (message, limit = 15) => {
        if (!message) return t("section34.text5");

        const words = message.split(" ");

        if (words.length <= limit) return message;

        return words.slice(0, limit).join(" ") + "...";
    }

// {t("section33.text2")}
    return (
        <div className="chat-sidebar py-3 px-2" style={{ width: 280, overflowY: "auto" }}>
            <div className="p-2">
                <input
                    type="text"
                    className="form-control"
                    placeholder={t("chatSidebar.inputPlaceHolder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredChatList.length === 0 && <div className="text-muted">{t("section34.text1")}</div>}

            {filteredChatList.map((chat, idx) => {
                const partner = chat.partnerId;
                const partnerId = partner._id || partner;
                const unreadCount = getUnreadCount(chat);
                const isTyping = typingUsers[partnerId];
                const isOnline = onlineUsers[partnerId];
                const lastSeen = lastSeenData[partnerId];

                return (
                    <div
                        key={idx}
                        onClick={() => setSelectedChat(chat)}
                        className="d-flex align-items-center justify-content-between p-2 rounded hover-bg mb-2"
                        style={{
                            cursor: "pointer",
                            background:
                                (selectedChat?.partnerId._id || selectedChat?.partnerId) === partnerId
                                    ? "#f5f5f5"
                                    : "",
                        }}
                    >
                        <div className="d-flex align-items-center">
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStar(partnerId);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {starredChats[partnerId] ? (
                                    <FaStar style={{ width: 20, height: 20, marginRight: "8px", color: "rgb(252, 196, 12)" }} />
                                ) : (
                                    <FaRegStar style={{ width: 20, height: 20, marginRight: "8px", color: "gray" }} />
                                )}
                            </div>

                            <img
                                src={partner.profileImage || icons.profileAvtar}
                                alt="profile"
                                className="rounded-circle"
                                style={{ width: 45, height: 45, objectFit: "cover" }}
                            />
                            <div className="d-flex justify-content-between align-items-center" style={{ width: "185px" }}>
                                <div className="ms-2">
                                    <div className="">{partner.name}</div>

                                    <div className="text-muted">
                                        {isTyping ? (
                                            <span style={{ color: "#0d6efd" }}>{t("section34.text2")}</span>
                                        ) : (
                                            chat.lastMessage
                                                ? chat.lastMessage.split("").slice(0, 15).join("") + (chat.lastMessage.split("").length > 15 ? "..." : "")
                                                : ""
                                        )}
                                    </div>

                                    {isOnline ? (
                                        <span className="text-success">● {t("section34.text3")}</span>
                                    ) : lastSeen ? (
                                        <span className="text-muted">
                                            {t("section34.text4")}: {new Date(lastSeen).toLocaleString()}
                                        </span>
                                    ) : null}
                                </div>


                                {/* {unreadCount > 0 && (
                                    <div
                                        style={{
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            borderRadius: "50%",
                                            width: 22,
                                            height: 22,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 12,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </div>
                                )} */}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Sidebar;
