import { useEffect } from "react";

import { useChatStore } from "../store/useChatStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";

export default function ChatContainer() {
  const { messages, getMessages, isMessagesLoading, selectedUser } =
    useChatStore();

  const userId = selectedUser?._id;
  console.log(messages);

  useEffect(() => {
    if (userId) {
      getMessages(userId);
    }
  }, [userId, getMessages]);

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
      <p>messages</p>
      <MessageInput />
    </div>
  );
}
