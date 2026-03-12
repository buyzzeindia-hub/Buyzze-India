export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
};

export type TypingState = {
  buyerTyping: boolean;
  sellerTyping: boolean;
};

export type SellerStatus = "online" | "offline";
