export type MeetingType = {
    id: string;
    code: string | null;
    title: string;
    isPlanned: boolean;
    isStarted: boolean;
    startTime: Date | null;
    endTime: Date | null;
    ownerId: string;
}