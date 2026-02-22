import { useEffect, useMemo, useRef, useState } from "react";
import { BsFillSendFill, BsThreeDots } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const toIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value?._id || value?.id || "";
};

const MessagesSkeleton = () => (
  <div className="tw-space-y-4 tw-px-1">
    {Array.from({ length: 7 }).map((_, index) => (
      <div
        key={`chat-msg-skeleton-${index}`}
        className={`tw-flex ${
          index % 2 === 0 ? "tw-justify-start" : "tw-justify-end"
        }`}
      >
        <div className="tw-flex tw-max-w-[78%] tw-animate-pulse tw-items-end tw-gap-2">
          {index % 2 === 0 ? (
            <div className="tw-h-8 tw-w-8 tw-rounded-full tw-bg-slate-200" />
          ) : null}
          <div className="tw-rounded-2xl tw-bg-white tw-px-3 tw-py-2">
            <div className="tw-h-2.5 tw-w-32 tw-rounded tw-bg-slate-200" />
            <div className="tw-mt-2 tw-h-2.5 tw-w-20 tw-rounded tw-bg-slate-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ChatArea = ({
  selectedChat,
  messages,
  sendMessage,
  input,
  handleTyping,
  userId,
  bookingDate,
  loadingMessages = false,
  deletingChat = false,
  onDeleteChat,
  onBackToList,
}) => {
  const { t } = useTranslation();
  const [linkScans, setLinkScans] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const partner =
    selectedChat?.partnerId && typeof selectedChat.partnerId === "object"
      ? selectedChat.partnerId
      : null;
  const partnerName = partner?.name || t("chat.unknownUser", "Unknown user");
  const partnerAvatar = partner?.profileImage;

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

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
      return t("chat.today", "Today");
    }
    if (
      msgDate.getFullYear() === yesterday.getFullYear() &&
      msgDate.getMonth() === yesterday.getMonth() &&
      msgDate.getDate() === yesterday.getDate()
    ) {
      return t("chat.yesterday", "Yesterday");
    }
    return msgDate.toLocaleDateString();
  };

  const groupedMessages = useMemo(() => {
    const grouped = [];
    let lastDate = null;

    messages.forEach((msg) => {
      const label = getDateLabel(msg.createdAt);
      if (lastDate !== label) {
        grouped.push({ type: "date", label });
        lastDate = label;
      }
      grouped.push({ type: "message", ...msg });
    });

    return grouped;
  }, [messages, t]);

  const formatBookingDate = (dateString) => {
    if (!dateString) return "";

    const bookingDay = new Date(dateString);
    const today = new Date();
    bookingDay.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - bookingDay) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t("chat.bookingToday", "Booking today");
    if (diffDays > 0 && diffDays <= 10) {
      return t("chat.bookingDaysAgo", {
        count: diffDays,
        defaultValue: `Booking ${diffDays} day${diffDays > 1 ? "s" : ""} ago`,
      });
    }
    if (diffDays < 0) {
      return `${t("chat.bookingScheduled", "Booking scheduled for")} ${bookingDay.toLocaleDateString(
        undefined,
        { day: "numeric", month: "short" }
      )}`;
    }
    return bookingDay.toLocaleDateString();
  };

  const urlRegex = /https?:\/\/[^\s]+/gi;

  const sanitizeUrl = (value) => {
    if (!value) return null;
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
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
      parts.push(
        <span
          key={`link-${index}`}
          className="tw-inline-block tw-rounded-md tw-bg-slate-100 tw-px-2 tw-py-0.5 tw-text-xs tw-font-medium tw-text-slate-500"
        >
          {safeUrl ? maskUrl(safeUrl) : t("chat.linkHidden", "Link hidden")}
        </span>
      );

      lastIndex = start + rawUrl.length;
    });

    if (lastIndex < inputText.length) {
      parts.push(<span key="text-last">{inputText.slice(lastIndex)}</span>);
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
        return { url: safeUrl, domain, maskedUrl: maskUrl(safeUrl) };
      } catch (error) {
        continue;
      }
    }
    return null;
  };

  const getMessageKey = (item, idx) =>
    item._id ||
    `msg-${toIdString(item.senderId)}-${toIdString(item.receiverId)}-${
      item.createdAt || idx
    }-${idx}`;

  const handleScanLink = (messageKey, url) => {
    if (!messageKey || !url) return;
    setLinkScans((prev) => {
      const current = prev[messageKey];
      if (current?.status === "scanning" || current?.status === "safe") return prev;
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
    if (!messages?.length) return;
    messages.forEach((item, idx) => {
      const preview = getLinkPreview(item?.message);
      if (!preview) return;
      const key = getMessageKey(item, idx);
      const state = linkScans[key];
      if (!state || state.status === "idle") {
        handleScanLink(key, preview.url);
      }
    });
  }, [messages, linkScans]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [groupedMessages, loadingMessages, selectedChat]);

  useEffect(() => {
    if (!showMenu) return;

    const handleOutside = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showMenu]);

  useEffect(() => {
    setShowMenu(false);
    setShowDeleteConfirm(false);
  }, [selectedChat]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleBack = () => {
    if (typeof onBackToList === "function") {
      onBackToList();
    }
  };

  const handleDeleteChat = async () => {
    if (!onDeleteChat || deletingChat) return;
    const success = await onDeleteChat();
    if (success) {
      setShowDeleteConfirm(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="tw-relative tw-flex tw-h-full tw-w-full tw-flex-col tw-bg-[#f6f8fd]">
      {selectedChat ? (
        <div className="tw-flex tw-items-center tw-justify-between tw-border-b tw-border-[#e4eaf4] tw-bg-white tw-px-4 tw-py-3 md:tw-px-5">
          <div className="tw-flex tw-min-w-0 tw-items-center tw-gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-full tw-border tw-border-slate-300 tw-bg-white tw-text-slate-600 md:tw-hidden"
            >
              &#8592;
            </button>

            <div className="tw-h-11 tw-w-11 tw-overflow-hidden tw-rounded-full tw-bg-slate-100">
              {partnerAvatar ? (
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="tw-h-full tw-w-full tw-object-cover"
                />
              ) : (
                <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-bg-slate-200 tw-text-slate-500">
                  <FaUserCircle className="tw-h-7 tw-w-7" />
                </div>
              )}
            </div>

            <div className="tw-min-w-0">
              <p className="tw-truncate tw-text-lg tw-font-semibold tw-text-slate-900">
                {partnerName}
              </p>
              <div className="tw-mt-0.5 tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-text-slate-500 md:tw-text-sm">
                <FaClockRotateLeft className="tw-h-3 tw-w-3 tw-text-slate-400" />
                <span className="tw-truncate">
                  {formatBookingDate(bookingDate?.bookingDate) ||
                    t("chat.noBookingInfo", "No booking info")}
                </span>
              </div>
            </div>
          </div>

          <div ref={menuRef} className="tw-relative">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-full tw-border-0 tw-bg-[#f3f5f9] tw-text-slate-500 hover:tw-bg-[#e9eef6]"
            >
              <BsThreeDots className="tw-h-4 tw-w-4" />
            </button>

            {showMenu ? (
              <div className="tw-absolute tw-right-0 tw-top-11 tw-z-20 tw-w-48 tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-p-1.5 tw-shadow-[0_14px_30px_rgba(15,23,42,0.14)]">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="tw-flex tw-w-full tw-items-center tw-gap-2 tw-rounded-lg !tw-border-0 tw-px-3 tw-py-2 tw-text-left tw-text-sm tw-font-medium tw-text-red-600 tw-outline-none hover:tw-bg-red-50 focus:tw-outline-none focus:tw-ring-0"
                >
                  <FiTrash2 className="tw-h-4 tw-w-4" />
                  {t("chat.deleteConversation", "Delete conversation")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="tw-flex-1 tw-overflow-y-auto tw-p-4 md:tw-p-5">
        {!selectedChat ? (
          <div className="tw-flex tw-h-full tw-flex-col tw-items-center tw-justify-center tw-gap-3 tw-text-center">
            <div className="tw-flex tw-h-16 tw-w-16 tw-items-center tw-justify-center tw-rounded-full tw-bg-slate-100 tw-text-slate-400">
              <FaUserCircle className="tw-h-9 tw-w-9" />
            </div>
            <p className="tw-text-base tw-font-semibold tw-text-slate-700">
              {t("section33.text2", "Select a conversation to start chatting")}
            </p>
          </div>
        ) : loadingMessages ? (
          <MessagesSkeleton />
        ) : groupedMessages.length ? (
          groupedMessages.map((item, idx) => {
            if (item.type === "date") {
              return (
                <div key={`date-${item.label}-${idx}`} className="tw-my-4 tw-text-center">
                  <span className="tw-inline-flex tw-rounded-full tw-bg-[#eef1f6] tw-px-3 tw-py-1 tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-text-slate-500">
                    {item.label}
                  </span>
                </div>
              );
            }

            const isMe = toIdString(item.senderId) === String(userId || "");
            const messageKey = getMessageKey(item, idx);
            const linkPreview = getLinkPreview(item.message);
            const scanState = linkScans[messageKey] || { status: "idle" };
            const isSafe = scanState.status === "safe";
            const isScanning = scanState.status === "scanning";

            return (
              <div key={messageKey} className="tw-mb-4">
                <div
                  className={`tw-flex tw-gap-2.5 ${
                    isMe ? "tw-justify-end" : "tw-justify-start"
                  }`}
                >
                  {!isMe ? (
                    <div className="tw-h-8 tw-w-8 tw-shrink-0 tw-overflow-hidden tw-rounded-full tw-bg-slate-100">
                      {partnerAvatar ? (
                        <img
                          src={partnerAvatar}
                          alt={partnerName}
                          className="tw-h-full tw-w-full tw-object-cover"
                        />
                      ) : (
                        <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-bg-slate-200 tw-text-slate-500">
                          <FaUserCircle className="tw-h-5 tw-w-5" />
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div
                    className={`tw-max-w-[78%] tw-rounded-2xl tw-px-3 tw-py-2.5 tw-text-sm tw-leading-relaxed tw-shadow-sm ${
                      isMe
                        ? "tw-bg-[#153b77] tw-text-white"
                        : "tw-border tw-border-slate-200 tw-bg-white tw-text-slate-800"
                    }`}
                  >
                    <div className="tw-whitespace-pre-wrap tw-break-words">
                      {renderMessageParts(item.message)}
                    </div>

                    {linkPreview ? (
                      <div
                        className={`tw-mt-2 tw-rounded-xl tw-border tw-p-2.5 ${
                          isMe
                            ? "tw-border-white/20 tw-bg-white/10"
                            : "tw-border-slate-200 tw-bg-slate-50"
                        }`}
                      >
                        <div className="tw-flex tw-items-center tw-gap-2.5">
                          <div className="tw-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-slate-200 tw-bg-white">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${linkPreview.domain}&sz=64`}
                              alt={linkPreview.domain}
                              className="tw-h-4 tw-w-4"
                            />
                          </div>
                          <div className="tw-min-w-0 tw-flex-1">
                            <p
                              className={`tw-text-xs tw-font-semibold ${
                                isMe ? "tw-text-white" : "tw-text-slate-700"
                              }`}
                            >
                              {t("chat.linkDetected", "Link detected")}
                            </p>
                            <p
                              className={`tw-truncate tw-text-[11px] ${
                                isMe ? "tw-text-white/80" : "tw-text-slate-500"
                              }`}
                            >
                              {linkPreview.maskedUrl}
                            </p>
                          </div>
                        </div>

                        <div className="tw-mt-2 tw-flex tw-items-center tw-justify-between tw-gap-2">
                          <p
                            className={`tw-text-[11px] ${
                              isMe ? "tw-text-white/85" : "tw-text-slate-500"
                            }`}
                          >
                            {isSafe
                              ? t("chat.scanComplete", "Scan complete")
                              : t("chat.scanning", "Scanning...")}
                          </p>
                          {isSafe ? (
                            <a
                              href={linkPreview.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className={`tw-inline-flex tw-items-center tw-rounded-full tw-px-3 tw-py-1 tw-text-[11px] tw-font-semibold ${
                                isMe
                                  ? "tw-bg-white tw-text-[#112d58]"
                                  : "tw-bg-[#112d58] tw-text-white"
                              }`}
                            >
                              {t("chat.openLink", "Open link")}
                            </a>
                          ) : (
                            <span
                              className={`tw-inline-flex tw-items-center tw-rounded-full tw-px-3 tw-py-1 tw-text-[11px] tw-font-semibold ${
                                isMe
                                  ? "tw-bg-white/20 tw-text-white/90"
                                  : "tw-bg-slate-200 tw-text-slate-600"
                              }`}
                            >
                              {isScanning
                                ? t("chat.scanning", "Scanning...")
                                : t("chat.scanPending", "Pending")}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div
                  className={`tw-mt-1 tw-text-xs tw-text-slate-400 ${
                    isMe ? "tw-text-right" : "tw-pl-10 tw-text-left"
                  }`}
                >
                  {formatTime(item.createdAt)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="tw-flex tw-h-full tw-items-center tw-justify-center tw-text-sm tw-text-slate-500">
            {t("chat.noMessagesYet", "No messages yet. Say hello!")}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {selectedChat ? (
        <div className="tw-border-t tw-border-[#e4eaf4] tw-bg-white tw-p-3 md:tw-p-4">
          <div className="tw-flex tw-items-end tw-gap-2.5 tw-rounded-full tw-bg-[#f3f5f9] tw-p-1.5 tw-pl-4">
            <textarea
              className="tw-min-h-[42px] tw-flex-1 tw-rounded-full tw-border-0 tw-bg-transparent tw-px-0 tw-py-2 tw-text-base tw-text-slate-800 placeholder:tw-text-slate-500 focus:tw-outline-none"
              placeholder={t("chat.typeMessage", "Type a message...")}
              value={input}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ resize: "none", overflow: "hidden" }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim()}
              className="tw-inline-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full tw-bg-white tw-text-[#173f7e] tw-shadow-sm tw-transition hover:tw-bg-[#eef3fb] disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
              aria-label={t("chat.sendMessage", "Send message")}
            >
              <BsFillSendFill className="tw-h-4 tw-w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {showDeleteConfirm ? (
        <div className="tw-absolute tw-inset-0 tw-z-30 tw-flex tw-items-center tw-justify-center tw-bg-slate-900/35 tw-p-4">
          <div className="tw-w-full tw-max-w-sm tw-rounded-2xl tw-bg-white tw-p-5 tw-shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
            <h3 className="tw-text-lg tw-font-semibold tw-text-slate-900">
              {t("chat.deleteConversation", "Delete conversation")}
            </h3>
            <p className="tw-mt-2 tw-text-sm tw-text-slate-600">
              {t(
                "chat.deleteConversationConfirm",
                "This will remove all messages in this conversation for both users."
              )}
            </p>
            <div className="tw-mt-5 tw-flex tw-justify-end tw-gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingChat}
                className="tw-inline-flex tw-h-10 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-slate-300 tw-bg-white tw-px-4 tw-text-sm tw-font-semibold tw-text-slate-700 hover:tw-bg-slate-50 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteChat}
                disabled={deletingChat}
                className="tw-inline-flex tw-h-10 tw-items-center tw-justify-center tw-rounded-lg tw-bg-red-600 tw-px-4 tw-text-sm tw-font-semibold tw-text-white hover:tw-bg-red-700 disabled:tw-cursor-not-allowed disabled:tw-opacity-60"
              >
                {deletingChat ? (
                  <>
                    <span className="tw-mr-2 tw-inline-block tw-h-4 tw-w-4 tw-animate-spin tw-rounded-full tw-border-2 tw-border-white tw-border-t-transparent" />
                    {t("chat.deleting", "Deleting...")}
                  </>
                ) : (
                  t("chat.deleteNow", "Delete")
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ChatArea;
