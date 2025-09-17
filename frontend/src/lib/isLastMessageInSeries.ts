type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

const GAP_MS = 5 * 60 * 1000;
const ms = (d: string) => Date.parse(d);

export const isLastInSeries = (arr: Message[], i: number) => {
  const cur = arr[i];
  const next = arr[i + 1];
  if (!next) return true;
  const sameUser = cur.senderId === next.senderId;
  const closeInTime = Math.abs(ms(cur.createdAt) - ms(next.createdAt)) < GAP_MS;
  return !(sameUser && closeInTime);
};
