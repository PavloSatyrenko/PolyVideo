export type MeetingType = {
    id: string;
    code: string;
    title: string;
    isPlanned: boolean;
    isStarted: boolean;
    startTime: Date;
    endTime: Date | null;
    ownerId: string;
}