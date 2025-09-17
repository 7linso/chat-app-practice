import { useEffect, useRef, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import { isLastInSeries } from "../../lib/isLastMessageInSeries";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import MessageSkeleton from "../skeletons/MessageSkeleton";

import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import MessageOptions from "./MessageOptions";

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [menuMsg, setMenuMsg] = useState<Message | null>(null);
  const [copyStatus, setCopyStatus] = useState<null | "ok" | "err">(null);

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

  const handleRightClick = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuMsg(message);
    setMenuOpen(true);
  };

  const handleOnCopy = async (text: string | null) => {
    try {
      const value = text?.trim();
      if (!value) return;

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("Fallback copy failed");
      }
      setCopyStatus("ok");
    } catch (e) {
      console.error(e);
      setCopyStatus("err");
    } finally {
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handleOnCopyImage = async (imageURL: string | null) => {
    try {
      if (!imageURL) return;

      // Draw onto a canvas to get PNG
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageURL;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Failed to convert to PNG");

      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);
      setCopyStatus("ok");
    } catch (err) {
      console.error(err);
      setCopyStatus("err");
    } finally {
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handleOnDownload = async (imageURL: string | null) => {
    try {
      if (!imageURL) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageURL;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Failed to convert to PNG");

      const blobURL = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobURL;
      a.download = `${uuidv4()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobURL);
    } catch (e) {
      toast.error("Failed to save image!");
      console.error("Download failed:", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4">
        {sortedMessages.map((message, index) => {
          const showMeta = isLastInSeries(sortedMessages, index);

          return (
            <>
              <MessageBubble
                key={message._id}
                message={message}
                authUser={authUser}
                selectedUser={selectedUser}
                showMeta={showMeta}
                onRightClick={(message, e) => {
                  handleRightClick(e, message);
                }}
              />
            </>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {copyStatus && (
        <div
          className={`bottom-10 flex justify-center
           px-3 py-1 rounded bg-base-200 text-base-content shadow`}
        >
          {copyStatus === "ok" ? "Copied!" : "Couldn't copy"}
        </div>
      )}
      <MessageInput />

      <MessageOptions
        open={menuOpen}
        x={menuPos.x}
        y={menuPos.y}
        onClose={() => setMenuOpen(false)}
        message={menuMsg}
        isMine={menuMsg?.senderId === authUser._id}
        onReply={() => {
          /* ... */
        }}
        onCopy={(message) => handleOnCopy(message)}
        onCopyImage={(messageImage) => handleOnCopyImage(messageImage)}
        onEdit={() => {
          /* ... */
        }}
        onDelete={() => {
          /* ... */
        }}
        onDownload={(messageImage) => handleOnDownload(messageImage)}
      />
    </div>
  );
}
