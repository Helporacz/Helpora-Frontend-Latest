import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  deleteChatConversation,
  getChatList,
  getMessages,
  markMessagesRead,
  throwError,
  throwSuccess,
} from "store/globalSlice";
import { useTranslation } from "react-i18next";
import { getDataFromLocalStorage } from "utils/helpers";
import ChatArea from "./ChatArea";
import Sidebar from "./Sidebar";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
  transports: ["websocket"],
});

const getChatId = (u1, u2) => (u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`);

const resolvePartnerId = (chat) => {
  const partner = chat?.partnerId;
  if (!partner) return "";
  if (typeof partner === "string") return partner;
  return partner?._id || partner?.id || "";
};

const ChatBox = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [bookingDate, setBookingDate] = useState({});
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [lastSeenData, setLastSeenData] = useState({});
  const [showChatList, setShowChatList] = useState(true);
  const [loadingChatList, setLoadingChatList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deletingChat, setDeletingChat] = useState(false);

  const typingTimeoutRef = useRef(null);

  const token = getDataFromLocalStorage("token");
  const userId = localStorage.getItem("userId");
  const quickPartnerId = String(searchParams.get("partnerId") || "").trim();
  const quickPartnerName = String(searchParams.get("partnerName") || "").trim();
  const quickPartnerImage = String(searchParams.get("partnerImage") || "").trim();
  const selectedPartnerId = resolvePartnerId(selectedChat);

  const fetchChatList = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        setLoadingChatList(false);
        return;
      }

      if (!silent) {
        setLoadingChatList(true);
      }

      try {
        const res = await dispatch(getChatList());
        if (res?.success) {
          setChatList(Array.isArray(res.chatList) ? res.chatList : []);
        } else if (!silent) {
          setChatList([]);
        }
      } catch (error) {
        if (!silent) {
          setChatList([]);
        }
      } finally {
        if (!silent) {
          setLoadingChatList(false);
        }
      }
    },
    [dispatch, token]
  );

  const clearSelectedChat = useCallback(() => {
    setSelectedChat(null);
    setMessages([]);
    setBookingDate({});
    setInput("");
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const handleConnect = () => {
      socket.emit("join", String(userId));
    };

    const handleDisconnect = () => {};
    const handleConnectError = () => {};

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (socket.connected) {
      socket.emit("join", String(userId));
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    socket.on("userOnline", ({ userId: onlineUserId }) =>
      setOnlineUsers((prev) => ({ ...prev, [onlineUserId]: true }))
    );

    socket.on("userOffline", ({ userId: offlineUserId, lastSeen }) => {
      setOnlineUsers((prev) => ({ ...prev, [offlineUserId]: false }));
      setLastSeenData((prev) => ({ ...prev, [offlineUserId]: lastSeen }));
    });

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [userId]);

  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  useEffect(() => {
    if (!quickPartnerId || !userId) return;

    if (String(quickPartnerId) === String(userId)) {
      navigate(location.pathname, { replace: true });
      return;
    }

    const existingChat = chatList.find(
      (chat) => resolvePartnerId(chat) === String(quickPartnerId)
    );

    if (existingChat) {
      setSelectedChat(existingChat);
    } else {
      setSelectedChat({
        partnerId: {
          _id: quickPartnerId,
          name: quickPartnerName || t("chat.unknownUser", "Unknown user"),
          profileImage: quickPartnerImage || "",
        },
        lastMessage: "",
        updatedAt: new Date().toISOString(),
      });
    }

    if (window.matchMedia("(max-width: 767px)").matches) {
      setShowChatList(false);
    }

    navigate(location.pathname, { replace: true });
  }, [
    quickPartnerId,
    quickPartnerName,
    quickPartnerImage,
    userId,
    chatList,
    t,
    navigate,
    location.pathname,
  ]);

  useEffect(() => {
    if (!selectedChat) return;
    const activePartnerId = resolvePartnerId(selectedChat);
    if (!activePartnerId) return;

    const existingChat = chatList.find(
      (chat) => resolvePartnerId(chat) === String(activePartnerId)
    );

    if (existingChat && selectedChat !== existingChat) {
      setSelectedChat(existingChat);
    }
  }, [chatList, selectedChat]);

  useEffect(() => {
    if (!selectedPartnerId || !userId) {
      setMessages([]);
      setBookingDate({});
      setLoadingMessages(false);
      return;
    }

    const chatId = getChatId(String(userId), String(selectedPartnerId));
    let isMounted = true;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      socket.emit("joinChat", chatId);

      try {
        const res = await dispatch(getMessages(chatId));
        if (!isMounted) return;
        if (res?.success) {
          setMessages(Array.isArray(res.messages) ? res.messages : []);
          setBookingDate(res.bookingDate || {});
        } else {
          setMessages([]);
          setBookingDate({});
        }
      } catch (error) {
        if (isMounted) {
          setMessages([]);
          setBookingDate({});
        }
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }

      socket.emit("markRead", {
        chatId,
        readerId: userId,
        otherUserId: selectedPartnerId,
      });

      dispatch(markMessagesRead(chatId));
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedPartnerId, userId, dispatch]);

  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (!userId || !msg) return;

      const userIdStr = String(userId);
      const msgSenderId = String(msg.senderId || "");
      const msgReceiverId = String(msg.receiverId || "");

      if (msgSenderId !== userIdStr && msgReceiverId !== userIdStr) {
        fetchChatList({ silent: true });
        return;
      }

      const currentChatId = selectedPartnerId
        ? getChatId(String(userId), String(selectedPartnerId))
        : null;

      if (selectedPartnerId && currentChatId && msg.chatId === currentChatId) {
        setMessages((prev) => {
          const filtered = prev.filter(
            (message) => !String(message?._id || "").startsWith("temp-")
          );
          const exists = filtered.some((message) => message._id === msg._id);
          if (exists) return filtered;
          return [...filtered, msg];
        });
      }

      fetchChatList({ silent: true });
    };

    const handleMessageError = () => {
      setMessages((prev) =>
        prev.filter((message) => !String(message?._id || "").startsWith("temp-"))
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageError", handleMessageError);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageError", handleMessageError);
    };
  }, [selectedPartnerId, userId, fetchChatList]);

  useEffect(() => {
    const handleChatDeleted = ({ chatId }) => {
      const activeChatId =
        userId && selectedPartnerId
          ? getChatId(String(userId), String(selectedPartnerId))
          : "";

      if (chatId && activeChatId && chatId === activeChatId) {
        clearSelectedChat();
        setShowChatList(true);
      }

      fetchChatList({ silent: true });
    };

    socket.on("chatDeleted", handleChatDeleted);
    return () => socket.off("chatDeleted", handleChatDeleted);
  }, [selectedPartnerId, userId, fetchChatList, clearSelectedChat]);

  useEffect(() => {
    socket.on("messagesRead", ({ readerId }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          const receiverId =
            typeof msg.receiverId === "object"
              ? msg.receiverId?._id || msg.receiverId?.id
              : msg.receiverId;
          if (String(receiverId || "") === String(readerId || "")) {
            return { ...msg, isRead: true };
          }
          return msg;
        })
      );
    });

    return () => socket.off("messagesRead");
  }, []);

  useEffect(() => {
    const currentChatId =
      selectedPartnerId && userId
        ? getChatId(String(userId), String(selectedPartnerId))
        : null;

    socket.on("typing", ({ senderId, chatId }) => {
      if (chatId === currentChatId) {
        setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
      }
    });

    socket.on("stopTyping", ({ senderId }) =>
      setTypingUsers((prev) => ({ ...prev, [senderId]: false }))
    );

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [selectedPartnerId, userId]);

  const sendMessage = () => {
    if (!input.trim() || !selectedPartnerId || !userId) return;

    const messageText = input.trim();
    const senderIdStr = String(userId);
    const receiverIdStr = String(selectedPartnerId);

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      chatId: getChatId(senderIdStr, receiverIdStr),
      senderId: senderIdStr,
      receiverId: receiverIdStr,
      message: messageText,
      isRead: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInput("");

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("sendMessage", {
      senderId: senderIdStr,
      receiverId: receiverIdStr,
      message: messageText,
    });

    setTimeout(() => {
      fetchChatList({ silent: true });
    }, 400);
  };

  const handleDeleteChat = async () => {
    if (deletingChat || !selectedChat || !userId) return false;
    if (!selectedPartnerId) return false;

    const chatId = getChatId(String(userId), String(selectedPartnerId));
    setDeletingChat(true);

    try {
      const response = await dispatch(deleteChatConversation(chatId));
      if (response?.success) {
        dispatch(
          throwSuccess(response?.message || "Conversation deleted successfully.")
        );
        clearSelectedChat();
        setShowChatList(true);
        fetchChatList({ silent: true });
        return true;
      }

      dispatch(throwError(response?.message || "Failed to delete conversation."));
      return false;
    } catch (error) {
      dispatch(throwError("Failed to delete conversation."));
      return false;
    } finally {
      setDeletingChat(false);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    if (window.matchMedia("(max-width: 767px)").matches) {
      setShowChatList(false);
    }
  };

  const handleTyping = (event) => {
    setInput(event.target.value);

    if (!selectedPartnerId || !userId) return;

    const chatId = getChatId(String(userId), String(selectedPartnerId));

    socket.emit("typing", {
      senderId: userId,
      receiverId: selectedPartnerId,
      chatId,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: userId,
        receiverId: selectedPartnerId,
        chatId,
      });
    }, 1200);
  };

  const showSidebarOnMobile = !selectedChat || showChatList;
  const showChatOnMobile = !!selectedChat && !showChatList;

  return (
    <div className="tw-mx-auto tw-h-[calc(100vh-140px)] tw-min-h-[560px] tw-w-full tw-max-w-[1420px] tw-overflow-hidden tw-rounded-[26px] tw-border tw-border-[#e4eaf4] tw-bg-gradient-to-br tw-from-[#f9fbff] tw-to-[#eef3fb] tw-shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
      <div className="tw-flex tw-h-full tw-w-full">
        <div
          className={`tw-h-full tw-bg-white md:tw-w-[340px] md:tw-min-w-[320px] md:tw-max-w-[360px] md:tw-border-r md:tw-border-[#e4eaf4] ${
            showSidebarOnMobile ? "tw-block tw-w-full" : "tw-hidden md:tw-block"
          }`}
        >
          <Sidebar
            chatList={chatList}
            selectedChat={selectedChat}
            setSelectedChat={handleSelectChat}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            typingUsers={typingUsers}
            onlineUsers={onlineUsers}
            lastSeenData={lastSeenData}
            loading={loadingChatList}
          />
        </div>

        <div
          className={`tw-h-full tw-flex-1 tw-bg-[#f6f8fd] ${
            showChatOnMobile ? "tw-flex" : "tw-hidden"
          } md:tw-flex`}
        >
          <ChatArea
            selectedChat={selectedChat}
            messages={messages}
            sendMessage={sendMessage}
            input={input}
            handleTyping={handleTyping}
            userId={userId}
            bookingDate={bookingDate}
            loadingMessages={loadingMessages}
            deletingChat={deletingChat}
            onDeleteChat={handleDeleteChat}
            onBackToList={() => setShowChatList(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
