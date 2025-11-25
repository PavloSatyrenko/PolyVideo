import { ChatMessageType } from "./ChatMessageType";
import { UserType } from "./UserType";

export type ChatType = Partial<ChatMessageType> & {
    user: UserType;
};