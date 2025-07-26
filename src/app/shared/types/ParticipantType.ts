export type ParticipantType = {
    id: string,
    isAudioEnabled: boolean,
    isVideoEnabled: boolean,
    audioStream?: MediaStream,
    videoStream?: MediaStream,
    isMoved?: boolean
}