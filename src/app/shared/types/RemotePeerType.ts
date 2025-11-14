export type RemotePeerType = {
    name: string,
    videoStream: MediaStream,
    audioStream: MediaStream,
    screenShareStream: MediaStream,
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    isScreenSharing: boolean,
}