export type RemotePeerType = {
    userId: string,
    name: string,
    videoStream: MediaStream,
    audioStream: MediaStream,
    screenShareStream: MediaStream,
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    isScreenSharing: boolean,
    isHandUp: boolean
}