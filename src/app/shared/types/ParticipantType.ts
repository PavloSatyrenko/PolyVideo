export type ParticipantType = {
    id: string,
    name: string,
    isAudioEnabled: boolean,
    isVideoEnabled: boolean,
    audioStream: MediaStream,
    videoStream: MediaStream,
    isMoved: boolean,
    isLocal: boolean
}