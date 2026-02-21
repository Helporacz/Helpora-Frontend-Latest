import { useEffect, useRef, useState } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { FaClockRotateLeft } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";
import { icons } from "utils/constants";
import { useTranslation } from "react-i18next";

const ChatArea = ({
    selectedChat,
    messages,
    sendMessage,
    input,
    handleTyping,
    userId,
    setShowChatList,
    bookingDate
}) => {
  const { t, i18n } = useTranslation();
    const [linkScans, setLinkScans] = useState({});


    // const messagesEndRef = useRef();

    // useEffect(() => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [messages]);
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (dateStr) =>
        new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const getDateLabel = (dateStr) => {
        const msgDate = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (
            msgDate.getFullYear() === today.getFullYear() &&
            msgDate.getMonth() === today.getMonth() &&
            msgDate.getDate() === today.getDate()
        ) {
            return "Today";
        } else if (
            msgDate.getFullYear() === yesterday.getFullYear() &&
            msgDate.getMonth() === yesterday.getMonth() &&
            msgDate.getDate() === yesterday.getDate()
        ) {
            return "Yesterday";
        } else {
            return msgDate.toLocaleDateString();
        }
    };
    const groupedMessages = [];
    let lastDate = null;

    messages.forEach((msg) => {
        const msgDate = new Date(msg.createdAt);
        const dateLabel = getDateLabel(msg.createdAt);

        if (lastDate !== dateLabel) {
            groupedMessages.push({ type: "date", label: dateLabel });
            lastDate = dateLabel;
        }

        groupedMessages.push({ type: "message", ...msg });
    });

    function formatBookingDate(dateString) {
        if (!dateString) return "";

        const bookingDate = new Date(dateString);
        const today = new Date();

        bookingDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = today - bookingDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Booking Today";
        }

        if (diffDays > 0) {
            if (diffDays <= 10) {
                return `Booking ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
            }

            const months =
                (today.getFullYear() - bookingDate.getFullYear()) * 12 +
                (today.getMonth() - bookingDate.getMonth());

            if (months >= 1) {
                return months === 1
                    ? "Booking 1 month ago"
                    : `Booking ${months} months ago`;
            }

            return bookingDate.toLocaleDateString();
        } else {
            return `Booking scheduled for ${bookingDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
        }
    }

    const urlRegex = /https?:\/\/[^\s]+/gi;

    const sanitizeUrl = (value) => {
        if (!value) return null;
        try {
            const parsed = new URL(value);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                return null;
            }
            return parsed.toString();
        } catch (error) {
            return null;
        }
    };

    const extractLinks = (text) => {
        if (!text) return [];
        const matches = String(text).match(urlRegex);
        return matches ? matches : [];
    };

    const maskUrl = (safeUrl) => {
        if (!safeUrl) return "";
        try {
            const urlObj = new URL(safeUrl);
            const host = urlObj.hostname.replace(/^www\./, "");
            const maskedPath = urlObj.pathname && urlObj.pathname !== "/" ? "/•••" : "";
            return `${urlObj.protocol}//${host}${maskedPath}`;
        } catch (error) {
            return "link";
        }
    };

    const renderMessageParts = (text) => {
        const inputText = String(text || "");
        const matches = Array.from(inputText.matchAll(urlRegex));
        if (matches.length === 0) {
            return inputText;
        }

        const parts = [];
        let lastIndex = 0;

        matches.forEach((match, index) => {
            const rawUrl = match[0];
            const start = match.index ?? 0;

            if (start > lastIndex) {
                parts.push(
                    <span key={`text-${index}`}>{inputText.slice(lastIndex, start)}</span>
                );
            }

            const safeUrl = sanitizeUrl(rawUrl);
            const maskedLabel = safeUrl
                ? maskUrl(safeUrl)
                : t("chat.linkHidden", "Link hidden");
            parts.push(
                <span key={`link-${index}`} className="chat-link-masked">
                    {maskedLabel}
                </span>
            );

            lastIndex = start + rawUrl.length;
        });

        if (lastIndex < inputText.length) {
            parts.push(
                <span key="text-last">{inputText.slice(lastIndex)}</span>
            );
        }

        return parts;
    };

    const getLinkPreview = (text) => {
        const links = extractLinks(text);
        for (const link of links) {
            const safeUrl = sanitizeUrl(link);
            if (!safeUrl) continue;
            try {
                const urlObj = new URL(safeUrl);
                const domain = urlObj.hostname.replace(/^www\./, "");
                const displayUrl = safeUrl.length > 70 ? `${safeUrl.slice(0, 67)}...` : safeUrl;
                const maskedUrl = maskUrl(safeUrl);
                return { url: safeUrl, domain, displayUrl, maskedUrl };
            } catch (error) {
                continue;
            }
        }
        return null;
    };

    const getMessageKey = (item, idx) =>
        item._id ||
        `msg-${item.senderId || "u"}-${item.receiverId || "r"}-${item.createdAt || idx}-${idx}`;

    const handleScanLink = (messageKey, url) => {
        if (!messageKey || !url) return;
        setLinkScans((prev) => {
            const current = prev[messageKey];
            if (current?.status === "scanning") return prev;
            return { ...prev, [messageKey]: { status: "scanning", url } };
        });

        setTimeout(() => {
            setLinkScans((prev) => ({
                ...prev,
                [messageKey]: { status: "safe", url },
            }));
        }, 1200);
    };

    useEffect(() => {
        if (!messages || messages.length === 0) return;
        const pending = [];

        messages.forEach((item, idx) => {
            if (!item?.message) return;
            const preview = getLinkPreview(item.message);
            if (!preview) return;
            const key = getMessageKey(item, idx);
            const state = linkScans[key];
            if (!state || state.status === "idle") {
                pending.push({ key, url: preview.url });
            }
        });

        if (pending.length === 0) return;
        pending.forEach(({ key, url }) => handleScanLink(key, url));
    }, [messages, linkScans]);

    return (
        <div className="chatarea-container">

            {window.innerWidth < 768 && selectedChat && (
                <button
                    className="btn btn-light m-2"
                    onClick={() => setShowChatList(true)}
                >
                    ← {t("section33.text1")}
                </button>
            )}

            {selectedChat && (
                <div className="chat-header">
                    <div className="ms-2">
                        <div className="fw-bold" style={{ fontSize: "24px" }}>{selectedChat.partnerId.name}</div>
                        <div className="d-flex gap-2 align-items-center">
                            <FaClockRotateLeft style={{ color: "#a4b0b7" }} />
                            <div style={{ fontSize: "18px" }}>{formatBookingDate(bookingDate?.bookingDate)}</div>
                        </div>
                    </div>
                    <div>
                        <BsThreeDots size={24} />
                    </div>
                </div>
            )}

            <div className={`chat-messages ${!selectedChat? "d-flex justify-content-center align-items-center" :""}`}>
                {selectedChat ? (
                    groupedMessages.map((item, idx) => {
                        if (item.type === "date") {
    return (
                                <div key={idx} className="text-center my-3 text-muted" style={{ fontSize: 12 }}>
                                    {item.label}
                                </div>
                            );
                        }

                        const isMe = item.senderId === userId;
                        const messageKey = getMessageKey(item, idx);
                        const linkPreview = getLinkPreview(item.message);
                        const scanState = linkScans[messageKey] || { status: "idle" };
                        const isScanning = scanState.status === "scanning";
                        const isSafe = scanState.status === "safe";
    return (
                            <>
                                <div
                                    // ref={messagesEndRef}
                                    key={idx}
                                    className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}
                                >
                                    {!isMe ?
                                        <div>
                                            <img
                                                src={selectedChat.partnerId.profileImage || icons.profileAvtar}
                                                width={70}
                                                height={45}
                                                className="rounded-circle me-3"
                                                alt=""
                                            />
                                        </div>
                                        : ""
                                    }
                                    <div
                                        className="py-2 px-3"
                                        style={{ wordBreak: "break-word", maxWidth: "60%", background: isMe ? "#f7f7f7" : "white", border: isMe ? "" : "1px solid #dde0e1", borderRadius: "12px" }}
                                    >
                                        <div>{renderMessageParts(item.message)}</div>
                                        {linkPreview && (
                                            <div className="link-preview-card">
                                                <div className="link-preview-media">
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${linkPreview.domain}&sz=64`}
                                                        alt={linkPreview.domain}
                                                    />
                                                </div>
                                                <div className="link-preview-content">
                                                    <div className="link-preview-title">
                                                        {t("chat.linkDetected", "Link detected")}
                                                    </div>
                                                    <div className="link-preview-url">
                                                        {linkPreview.maskedUrl ||
                                                            t("chat.linkHidden", "Link hidden")}
                                                    </div>
                                                    <div className="link-preview-status">
                                                        <span
                                                            className={`status-dot ${
                                                                isSafe
                                                                    ? "safe"
                                                                    : isScanning
                                                                    ? "scanning"
                                                                    : "pending"
                                                            }`}
                                                        ></span>
                                                        <span>
                                                            {isSafe
                                                                ? t(
                                                                      "chat.scanComplete",
                                                                      "Scan complete"
                                                                  )
                                                                : t(
                                                                      "chat.scanning",
                                                                      "Scanning..."
                                                                  )}
                                                        </span>
                                                    </div>
                                                    <div className="link-preview-actions">
                                                        {isSafe ? (
                                                            <a
                                                                className="link-preview-btn open"
                                                                href={linkPreview.url}
                                                                target="_blank"
                                                                rel="noreferrer noopener"
                                                            >
                                                                {t(
                                                                    "chat.openLink",
                                                                    "Open link"
                                                                )}
                                                            </a>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="link-preview-btn scan"
                                                                disabled
                                                            >
                                                                {t(
                                                                    "chat.scanning",
                                                                    "Scanning..."
                                                                )}
                                                            </button>
                                                        )}
                                                        <span className="link-preview-badge">
                                                            {t(
                                                                "chat.externalLink",
                                                                "External link"
                                                            )}
                                                        </span>
                                                    </div>
                                                    {isSafe && (
                                                        <div className="link-preview-result">
                                                            {t(
                                                                "chat.scanResultSafe",
                                                                "No threats detected"
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className="text-muted"
                                    style={{ fontSize: 12, marginTop: 3, marginLeft: isMe ? "" : "8px", textAlign: isMe ? "right" : "left", marginRight: isMe ? "10px" : "" }}
                                >
                                    {formatTime(item.createdAt)}
                                </div>
                            </>
                        );
                    })
                ) : (
                    <div className="text-muted text-center mt-5">
                        {t("section33.text2")}
                    </div>
                )}
            </div>

            {selectedChat && (
                <div className="chat-input-bar">
                    <textarea
                        className="form-control"
                        placeholder="Type a message..."
                        value={input}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        style={{ resize: "none", overflow: "hidden" }}
                    />
                    <button
                        style={{
                            padding: "10px",
                            color: "white",
                            backgroundColor: "#51b836",
                            border: "none",
                            borderRadius: "50%",
                        }}
                        onClick={sendMessage}
                        disabled={!input.trim()}
                    >
                        <BsFillSendFill />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatArea;
