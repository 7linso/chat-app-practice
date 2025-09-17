import { Pencil, Trash, Copy, Reply, Save } from "lucide-react";
import { useEffect, useRef } from "react";

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

type MessageOptionsProps = {
  open: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onReply: (message: Message) => void;
  onCopy: (message: string | null) => Promise<void>;
  onCopyImage: (message: string | null) => Promise<void>;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onDownload: (message: string | null) => void;
  isMine: boolean;
  message: Message | null;
};

export default function MessageOptions({
  open,
  x,
  y,
  onClose,
  onReply,
  onCopy,
  onCopyImage,
  onEdit,
  onDelete,
  onDownload,
  isMine,
  message,
}: MessageOptionsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      onClose();
    };

    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open || !message) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  const W = 100,
    H = 200;
  const left = Math.min(x, Math.max(8, vw - W - 8));
  const top = Math.min(y, Math.max(8, vh - H - 8));

  const Item = ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      className="w-full text-left px-3 py-1 text-sm hover:bg-base-100 focus:bg-base-100 outline-none flex items-center gap-1"
      onClick={() => {
        onClick();
        onClose();
      }}
      role="menuitem"
    >
      {children}
    </button>
  );

  return (
    <div
      ref={ref}
      className="fixed z-50 max-h-[200px] overflow-auto rounded-md border border-neutural bg-base-100 text-base-content shadow-lg"
      style={{ left, top }}
      role="menu"
    >
      <Item onClick={() => onReply(message)}>
        <Reply size={14} />
        Reply
      </Item>
      <Item onClick={() => onCopy(message.text)}>
        <Copy size={14} />
        Copy
      </Item>
      {message.image && (
        <>
          <Item onClick={() => onCopyImage(message.image)}>
            <Copy size={14} />
            Copy Image
          </Item>
          <Item onClick={() => onDownload(message.image)}>
            <Save size={14} />
            Save Image
          </Item>
        </>
      )}
      {isMine && (
        <>
          <Item onClick={() => onEdit(message)}>
            <Pencil size={14} />
            Edit
          </Item>
          <Item onClick={() => onDelete(message)}>
            <Trash size={14} />
            Delete
          </Item>
        </>
      )}
    </div>
  );
}
