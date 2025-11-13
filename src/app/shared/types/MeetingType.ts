export type MeetingType = {
    id: string;
    title: string;
    isPlanned: boolean;
    isStarted: boolean;
    startTime: Date | null;
    endTime: Date | null;
    ownerId: string;
}