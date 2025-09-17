import { useEffect, useRef, useMemo } from "react";

import { isLastInSeries } from "../../lib/isLastMessageInSeries";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import MessageSkeleton from "../skeletons/MessageSkeleton";

import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatContainer() {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const ms = (d: string) => Date.parse(d);

  const userId = selectedUser?._id;

  useEffect(() => {
    if (!userId) return;
    getMessages(userId);
    const unsubscribe = subscribeToMessages();
    return unsubscribe;
  }, [userId, getMessages, subscribeToMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, userId]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => ms(a.createdAt) - ms(b.createdAt)),
    [messages],
  );

  if (!authUser) return;
  if (!selectedUser) return;

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4">
        {sortedMessages.map((message, index) => {
          const showMeta = isLastInSeries(messages, index);

          return (
            <MessageBubble
              key={message._id}
              message={message}
              authUser={authUser}
              selectedUser={selectedUser}
              showMeta={showMeta}
            />
          );
        })}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
}
