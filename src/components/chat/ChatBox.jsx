import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import {
  getChatList,
  getMessages,
  markMessagesRead
} from "store/globalSlice";
import { getDataFromLocalStorage } from "utils/helpers";
import "./Chat.css";
import ChatArea from "./ChatArea";
import Sidebar from "./Sidebar";

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket"],
});

const getChatId = (u1, u2) =>
  u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`;

const ChatBox = () => {
  const dispatch = useDispatch();

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

  const typingTimeoutRef = useRef(null);

  const token = getDataFromLocalStorage("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    const handleConnect = () => {
      socket.emit("join", String(userId));
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
    };

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

    socket.on("userOnline", ({ userId }) =>
      setOnlineUsers(prev => ({ ...prev, [userId]: true }))
    );

    socket.on("userOffline", ({ userId, lastSeen }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: false }));
      setLastSeenData(prev => ({ ...prev, [userId]: lastSeen }));
    });

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [userId]);

  useEffect(() => {
    if (!token) return;

    dispatch(getChatList()).then((res) => {
      if (res?.success) setChatList(res.chatList || []);
    });
  }, [dispatch, token]);


  useEffect(() => {
    if (!selectedChat) return;

    const partnerId =
      selectedChat.partnerId._id || selectedChat.partnerId;

    const chatId = getChatId(userId, partnerId);

    socket.emit("joinChat", chatId);

    dispatch(getMessages(chatId)).then((res) => {
      if (res.success) {
        setMessages(res.messages || []);
        setBookingDate(res.bookingDate || {});
      }
    });

    socket.emit("markRead", {
      chatId,
      readerId: userId,
      otherUserId: partnerId
    });

    dispatch(markMessagesRead(chatId));

  }, [selectedChat, userId, dispatch]);


  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (!userId || !msg) {
        console.log("Missing userId or msg:", { userId, msg });
        return;
      }

      const userIdStr = String(userId);
      const msgSenderId = String(msg.senderId);
      const msgReceiverId = String(msg.receiverId);

      const isForCurrentUser = msgSenderId === userIdStr || msgReceiverId === userIdStr;

      if (!isForCurrentUser) {
        dispatch(getChatList()).then(res => {
          if (res?.success) setChatList(res.chatList || []);
        });
        return;
      }

      const partnerId = selectedChat?.partnerId?._id || selectedChat?.partnerId;
      const partnerIdStr = partnerId ? String(partnerId) : null;
      const currentChatId = partnerIdStr ? getChatId(userIdStr, partnerIdStr) : null;

      if (partnerIdStr && currentChatId && msg.chatId === currentChatId) {
        const involvedUsers = [msgSenderId, msgReceiverId];

        if (
          involvedUsers.includes(partnerIdStr) &&
          involvedUsers.includes(userIdStr)
        ) {
          setMessages(prev => {
            const filtered = prev.filter(m => !m._id?.startsWith('temp-'));
            const exists = filtered.some(m => m._id === msg._id);
            if (exists) {
              console.log("Message already exists, skipping");
              return filtered;
            }
            return [...filtered, msg];
          });
        }
      } else if (!partnerIdStr) {
        console.log("No chat selected, but message received - updating chat list only");
      } else {
        console.log("Message not for current chat, but updating chat list");
      }

      dispatch(getChatList()).then(res => {
        if (res?.success) setChatList(res.chatList || []);
      });
    };

    const handleMessageError = (error) => {
      console.error("Message error:", error);
      setMessages(prev => prev.filter(m => !m._id?.startsWith('temp-')));
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageError", handleMessageError);
    
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageError", handleMessageError);
    };

  }, [selectedChat, userId, dispatch]);


  useEffect(() => {
    socket.on("messagesRead", ({ chatId, readerId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.receiverId === readerId
            ? { ...msg, isRead: true }
            : msg
        )
      );
    });

    return () => socket.off("messagesRead");
  }, []);


  useEffect(() => {
    const partnerId =
      selectedChat?.partnerId?._id || selectedChat?.partnerId;

    const currentChatId = partnerId
      ? getChatId(userId, partnerId)
      : null;

    socket.on("typing", ({ senderId, chatId }) => {
      if (chatId === currentChatId) {
        setTypingUsers(prev => ({ ...prev, [senderId]: true }));
      }
    });

    socket.on("stopTyping", ({ senderId }) =>
      setTypingUsers(prev => ({ ...prev, [senderId]: false }))
    );

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };

  }, [selectedChat, userId]);


  const sendMessage = () => {
    if (!input.trim() || !selectedChat || !userId) {
      console.log("Cannot send: missing input, chat, or userId");
      return;
    }

    const receiverId =
      selectedChat.partnerId._id || selectedChat.partnerId;

    if (!receiverId) {
      console.error("Receiver ID is missing");
      return;
    }

    const messageText = input.trim();
    const senderIdStr = String(userId);
    const receiverIdStr = String(receiverId);
    
    console.log("Sending message:", {
      senderId: senderIdStr,
      receiverId: receiverIdStr,
      message: messageText,
      socketConnected: socket.connected
    });
    
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      chatId: getChatId(senderIdStr, receiverIdStr),
      senderId: senderIdStr,
      receiverId: receiverIdStr,
      message: messageText,
      isRead: false,
      createdAt: new Date(),
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setInput("");

    if (!socket.connected) {
      console.error("Socket not connected, attempting to connect...");
      socket.connect();
    }

    socket.emit("sendMessage", {
      senderId: senderIdStr,
      receiverId: receiverIdStr,
      message: messageText,
    });

    console.log("Message emitted to socket");

    setTimeout(() => {
      dispatch(getChatList()).then(res => {
        if (res?.success) setChatList(res.chatList || []);
      });
    }, 500);
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);

    if (window.innerWidth < 768) {
      setShowChatList(false);
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);

    if (!selectedChat) return;

    const receiverId =
      selectedChat.partnerId._id || selectedChat.partnerId;

    const chatId = getChatId(userId, receiverId);

    socket.emit("typing", {
      senderId: userId,
      receiverId,
      chatId
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: userId,
        receiverId,
        chatId
      });
    }, 1200);
  };

  return (
    <div className="chat-wrapper container" style={{ padding: 0 }}>
      <div
        className={`sidebar-container ${
          showChatList ? "show-section" : "hide-section"
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
          userId={userId}
        />
      </div>

      <div
        className={`chatarea-container ${
          showChatList ? "hide-section" : "show-section"
        }`}
      >
        <ChatArea
          selectedChat={selectedChat}
          messages={messages}
          sendMessage={sendMessage}
          input={input}
          setInput={setInput}
          handleTyping={handleTyping}
          userId={userId}
          onlineUsers={onlineUsers}
          lastSeenData={lastSeenData}
          bookingDate={bookingDate}
          setShowChatList={setShowChatList}
        />
      </div>
    </div>
  );
};

export default ChatBox;
