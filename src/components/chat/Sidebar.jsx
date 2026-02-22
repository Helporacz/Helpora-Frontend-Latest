import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaRegStar, FaStar, FaUserCircle } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const resolvePartnerId = (chat) => {
  const partner = chat?.partnerId;
  if (!partner) return "";
  if (typeof partner === "string") return partner;
  return partner?._id || partner?.id || "";
};

const resolvePartnerName = (chat, fallbackLabel) => {
  const partner = chat?.partnerId;
  if (!partner) return fallbackLabel;
  if (typeof partner === "string") return fallbackLabel;
  return String(partner?.name || fallbackLabel);
};

const previewMessage = (message, limit = 44) => {
  const text = String(message || "").trim();
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const formatLastSeen = (lastSeen, t) => {
  if (!lastSeen) return "";
  const date = new Date(lastSeen);
  if (Number.isNaN(date.getTime())) return "";
  return `${t("chat.lastSeen", "Last seen")} ${date.toLocaleString()}`;
};

const SidebarSkeleton = () => (
  <div className="tw-space-y-3 tw-px-4 tw-pb-4">
    {Array.from({ length: 7 }).map((_, idx) => (
      <div
        key={`chat-row-skeleton-${idx}`}
        className="tw-flex tw-animate-pulse tw-items-center tw-gap-3 tw-rounded-3xl tw-border tw-border-slate-200 tw-bg-white tw-p-4"
      >
        <div className="tw-h-11 tw-w-11 tw-rounded-full tw-bg-slate-200" />
        <div className="tw-min-w-0 tw-flex-1 tw-space-y-2">
          <div className="tw-h-3 tw-w-1/3 tw-rounded tw-bg-slate-200" />
          <div className="tw-h-2.5 tw-w-3/4 tw-rounded tw-bg-slate-200" />
          <div className="tw-h-2 tw-w-1/2 tw-rounded tw-bg-slate-200" />
        </div>
      </div>
    ))}
  </div>
);

const Sidebar = ({
  chatList,
  selectedChat,
  setSelectedChat,
  searchQuery,
  setSearchQuery,
  typingUsers,
  onlineUsers,
  lastSeenData,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [starredChats, setStarredChats] = useState({});

  const unknownUserLabel = t("chat.unknownUser", "Unknown user");
  const selectedPartnerId = resolvePartnerId(selectedChat);

  const filteredChats = useMemo(() => {
    const query = String(searchQuery || "").trim().toLowerCase();
    if (!query) return chatList;
    return chatList.filter((chat) =>
      resolvePartnerName(chat, unknownUserLabel).toLowerCase().includes(query)
    );
  }, [chatList, searchQuery, unknownUserLabel]);

  const toggleStar = (chatId) => {
    setStarredChats((prev) => ({
      ...prev,
      [chatId]: !prev[chatId],
    }));
  };

  return (
    <div className="tw-flex tw-h-full tw-flex-col tw-bg-white">
      <div className="tw-p-6 tw-pb-4">
        <h2 className="tw-text-[38px] tw-font-semibold tw-leading-tight tw-text-slate-900 md:tw-text-[32px]">
          {t("chat.inboxTitle", "Messages")}
        </h2>
        <p className="tw-mt-2 tw-text-sm tw-text-slate-600">
          {t("chat.inboxSubtitle", "Stay connected with clients and providers")}
        </p>
        <div className="tw-relative tw-mt-4">
          <FiSearch className="tw-pointer-events-none tw-absolute tw-left-4 tw-top-1/2 tw-h-4 tw-w-4 tw--translate-y-1/2 tw-text-slate-400" />
          <input
            type="text"
            className="tw-h-11 tw-w-full tw-rounded-full tw-border tw-border-transparent tw-bg-[#f1f4f9] tw-pl-10 tw-pr-4 tw-text-sm tw-text-slate-800 focus:tw-border-[#cad6ea] focus:tw-bg-white focus:tw-outline-none"
            placeholder={t("chatSidebar.inputPlaceHolder", "Search...")}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="tw-flex-1 tw-overflow-y-auto tw-pb-4">
        {loading ? (
          <SidebarSkeleton />
        ) : filteredChats.length === 0 ? (
          <div className="tw-flex tw-h-full tw-items-center tw-justify-center tw-px-6 tw-text-center">
            <p className="tw-text-sm tw-text-slate-500">
              {t("section34.text1", "No chats found")}
            </p>
          </div>
        ) : (
          <div className="tw-space-y-3 tw-px-4">
            {filteredChats.map((chat, idx) => {
              const partnerId = resolvePartnerId(chat);
              const partner = chat?.partnerId;
              const partnerName = resolvePartnerName(chat, unknownUserLabel);
              const avatarUrl =
                partner && typeof partner === "object" ? partner.profileImage : "";
              const isSelected = selectedPartnerId === partnerId;
              const isTyping = Boolean(typingUsers?.[partnerId]);
              const isOnline = Boolean(onlineUsers?.[partnerId]);
              const unreadCount = Number(chat?.unreadCount || 0);
              const lastSeen = formatLastSeen(lastSeenData?.[partnerId], t);

              const messagePreview = isTyping
                ? t("section34.text2", "Typing...")
                : previewMessage(
                    chat?.lastMessage || t("section34.text5", "No messages yet")
                  );

              return (
                <div
                  key={`chat-item-${partnerId || idx}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedChat(chat)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedChat(chat);
                    }
                  }}
                  className={`tw-flex tw-cursor-pointer tw-items-start tw-gap-3 tw-rounded-3xl tw-border tw-p-4 tw-transition focus:tw-outline-none ${
                    isSelected
                      ? "tw-border-[#cad9f5] tw-bg-white tw-shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                      : "tw-border-[#edf0f5] tw-bg-white hover:tw-border-[#dce3ee] hover:tw-shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                  }`}
                >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleStar(partnerId || String(idx));
                  }}
                  className="tw-mt-1 tw-inline-flex tw-h-5 tw-w-5 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full tw-border-0 tw-text-slate-400 hover:tw-bg-slate-100 hover:tw-text-[#e0b112]"
                  aria-label={t("chat.toggleStar", "Toggle star")}
                >
                    {starredChats[partnerId || String(idx)] ? (
                      <FaStar className="tw-h-3.5 tw-w-3.5 tw-text-[#e0b112]" />
                    ) : (
                      <FaRegStar className="tw-h-3.5 tw-w-3.5" />
                    )}
                  </button>

                  <div className="tw-relative tw-h-11 tw-w-11 tw-shrink-0 tw-overflow-hidden tw-rounded-full tw-bg-slate-100">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={partnerName}
                        className="tw-h-full tw-w-full tw-object-cover"
                      />
                    ) : (
                      <div className="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-bg-slate-200 tw-text-slate-500">
                        <FaUserCircle className="tw-h-7 tw-w-7" />
                      </div>
                    )}
                    <span
                      className={`tw-absolute tw-bottom-0.5 tw-right-0.5 tw-h-2.5 tw-w-2.5 tw-rounded-full tw-border tw-border-white ${
                        isOnline ? "tw-bg-brand-green" : "tw-bg-slate-300"
                      }`}
                    />
                  </div>

                  <div className="tw-min-w-0 tw-flex-1">
                    <div className="tw-flex tw-items-start tw-justify-between tw-gap-2">
                      <p className="tw-truncate tw-text-[20px] tw-font-medium tw-leading-tight tw-text-slate-900 md:tw-text-lg">
                        {partnerName}
                      </p>
                      {unreadCount > 0 ? (
                        <span className="tw-inline-flex tw-h-5 tw-min-w-[20px] tw-items-center tw-justify-center tw-rounded-full tw-bg-[#112d58] tw-px-1.5 tw-text-[11px] tw-font-semibold tw-leading-none tw-text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      ) : null}
                    </div>

                    <p
                      className={`tw-mt-1 tw-truncate tw-text-sm ${
                        isTyping ? "tw-text-brand-green" : "tw-text-slate-700"
                      }`}
                    >
                      {messagePreview}
                    </p>

                    <p className="tw-mt-2 tw-truncate tw-text-xs tw-text-slate-500">
                      {isOnline
                        ? t("section34.text3", "Online")
                        : lastSeen || t("chat.offline", "Offline")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
