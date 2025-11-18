export type MeetingType = {
    id: string;
    code: string;
    title: string;
    isPlanned: boolean;
    isStarted: boolean;
    startTime: Date;
    endTime: Date | null;
    isWaitingRoom: boolean;
    isScreenSharing: boolean;
    isGuestAllowed: boolean;
    ownerId: string;
}