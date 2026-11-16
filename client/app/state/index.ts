export const LoadingStatusEnum = {
  fulfilled: "fulfilled",
  pending: "pending",
  rejected: "rejected",
};

export interface BackendValidationErrorInterface {
  field: string;
  msg: string;
}

export interface UserRecievedInterface {
  id: number;
  uid: string;
  full_name: string;
  image_file?: string;
  image_path?: string;
  email?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenRecievedInterface {
  access_token: string;
  token_type: string;
}

export interface SessionStateInterface {
  websocket: WebSocket | null;
  currentUser: UserRecievedInterface | null;
  authStatus: string | null;
  userStatus: string | null;
}

export interface ErrorStateInterface {
  auth_field_errors: { [key: string]: string | undefined };
  board_add_field_errors: { [key: string]: string | undefined };
  board_member_add_field_errors: { [key: string]: string | undefined };
  board_list_add_field_errors: { [key: string]: string | undefined };
  board_card_add_field_errors: { [key: string]: string | undefined };
  server_error?: string;
  ws_error?: string;
}

export interface AuthFormErrorInterface {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm: string;
}

export interface BoardRecievedInterface {
  id: number;
  uid: string;
  user_id: number;
  name: string;
  updated_at: string;
  created_at: string;
  //   members: BoardMemberRecievedInterface[];
}

export interface BoardRecievedWithMembersInterface {
  id: number;
  uid: string;
  user_id: number;
  name: string;
  updated_at: string;
  created_at: string;
  members: BoardMemberRecievedInterface[];
}

export interface BoardMemberRecievedInterface {
  id: number;
  uid: string;
  email: string;
  full_name: string;
  image_file: string | null;
  image_path: string;
}

export interface ListRecievedInterface {
  id: number;
  uid: string;
  board_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CardRecievedInterface {
  id: number;
  uid: string;
  list_id: number;
  board_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RecievedSearchUsersInterface {
  id: number;
  uid: string;
  email: string;
  full_name: string;
  image_file?: string;
  image_path?: string;
}

export interface SearchStateInterface {
  userEmailSearchResults: RecievedSearchUsersInterface[];
  isLoading: boolean;
  query: string;
}

// -------------------------- WEBSOCKET --------------------------
// ---- WebSocket frame (outer) ----
export interface SocketFrameInterface {
  /** JSON-encoded string of `BoardChannelPayload` */
  message: string;
  timestamp: number;
}

export interface SocketErrorInterface {
  type: string;
  msg: string;
}

export const SocketConnectionStatusEnum = {
  open: "open",
  connecting: "connecting",
  close: "close",
} as const;

export type SocketConnectionStatusType =
  (typeof SocketConnectionStatusEnum)[keyof typeof SocketConnectionStatusEnum];

export interface SocketStateInterface {
  data: SocketFrameInterface | null;
  error: SocketErrorInterface | null;
  status: SocketConnectionStatusType | null;
}

// ---- Broadcast payload (inner) ----

export type BroadcastResType = "broadcast_channel";

export interface EventMemberAddedInterface {
  event: "member_added"; // ✅ literal
  // member_data: RecievedBoardMemberInterface;
  board_data: BoardRecievedInterface;
  member_data: BoardMemberRecievedInterface;
}

export interface EventMemberRemovedInterface {
  event: "member_removed"; // ✅ literal
  board_id: number;
  member_id: number;
  // member_data: RecievedBoardMemberInterface;
}

export interface EventBoardRemovedInterface {
  event: "board_removed"; // ✅ literal
  board_data: BoardRecievedWithMembersInterface;
  // member_data: RecievedBoardMemberInterface;
}

export interface EventBoardUpdatedInterface {
  event: "board_updated"; // ✅ literal
  // member_data: RecievedBoardMemberInterface;
  board_data: BoardRecievedInterface;
}

export interface EventListAddedInterface {
  event: "list_added"; // ✅ literal
  // member_data: RecievedBoardMemberInterface;
  list_data: ListRecievedInterface;
}

export interface EventListUpdatedInterface {
  event: "list_updated"; // ✅ literal
  // member_data: RecievedBoardMemberInterface;
  list_data: ListRecievedInterface;
}

export interface EventListRemovedInterface {
  event: "list_removed"; // ✅ literal
  // member_data: RecievedBoardMemberInterface;
  list_id: number;
}

export interface EventCardAddedInterface {
  event: "card_added"; // ✅ literal
  // member_data: RecievedBoardMemberInterface;
  card_data: CardRecievedInterface;
}

export interface EventCardUpdatedInterface {
  event: "card_updated"; // ✅ literal
  // member_data: RecievedBoardMemberInterface;
  card_data: CardRecievedInterface;
}

export interface EventCardRemovedInterface {
  event: "card_removed"; // ✅ literal
  // member_data: RecievedBoardMemberInterface;
  card_id: number;
  list_id: number;
}

// Add more variants as your backend adds them, e.g.
// export interface EventMemberRemovedInterface { event: "member_removed"; ... }
// export interface EventBoardUpdatedInterface  { event: "board_updated"; ... }

export type BoardChannelMessageType =
  | EventMemberAddedInterface
  | EventMemberRemovedInterface
  | EventBoardRemovedInterface
  | EventBoardUpdatedInterface
  | EventListAddedInterface
  | EventListUpdatedInterface
  | EventListRemovedInterface
  | EventCardAddedInterface
  | EventCardUpdatedInterface
  | EventCardRemovedInterface;

export interface BoardChannelPayloadInterface {
  res_type: BroadcastResType;
  channel: string;
  message: BoardChannelMessageType;
}
// -------------------------- WEBSOCKET --------------------------
