export type ConferenceControlsItemType = {
    type: "audio" | "video" | "screen" | "participants" | "chat" | "hand" | "other" | "leave",
    isEnabled?: boolean
};