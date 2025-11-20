import { ChatMessageType } from "./ChatMessageType";
import { UserType } from "./UserType";

export type ChatType = ChatMessageType & {
    user: UserType;
};