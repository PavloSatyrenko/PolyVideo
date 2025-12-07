export type ConferenceControlsItemType = {
    type: "audio" | "video" | "screen" | "participants" | "chat" | "hand" | "options" | "menu" | "leave";
    isEnabled?: boolean;
};