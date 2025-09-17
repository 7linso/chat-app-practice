import { formatMessageTime } from "../../lib/formatMessageTime";

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

type User = {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
  password: string;
  createdAt: string;
  updatedAt: string;
};

type MessageBubbleProps = {
  message: Message;
  authUser: User;
  selectedUser: User;
  showMeta: boolean;
  onRightClick: (m: Message, e: React.MouseEvent) => void;
};

export default function MessageBubble({
  message,
  authUser,
  selectedUser,
  showMeta,
  onRightClick,
}: MessageBubbleProps) {
  const isMine = message.senderId === authUser._id;
  const avatarUrl = isMine
    ? authUser.profilePic || "/avatar.png"
    : selectedUser.profilePic || "/avatar.png";

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick?.(message, e);
  };

  return (
    <div
      key={message._id}
      className={`chat ${isMine ? "chat-end" : "chat-start"}
            ${!showMeta && "mx-10"}`}
    >
      {showMeta && (
        <>
          <div className=" chat-image avatar">
            <div className="size-10 rounded-full border">
              <img src={avatarUrl} alt="profile pic" />
            </div>
          </div>

          <div className="chat-footer mt-1">
            <time className="text-xs opacity-50 ml-1">
              {formatMessageTime(message.createdAt)}
            </time>
          </div>
        </>
      )}
      <div
        className={`chat-bubble flex flex-col`}
        onContextMenu={handleContextMenu}
      >
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        )}
        {message.text && <p>{message.text}</p>}
      </div>
    </div>
  );
}
