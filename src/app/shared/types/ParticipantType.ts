export type ParticipantType = {
    id: string;
    userId: string;
    name: string;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    audioStream: MediaStream;
    videoStream: MediaStream;
    isLocal: boolean;
    isHandUp: boolean;
    isScreen: boolean;
}