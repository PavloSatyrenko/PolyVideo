import { Component, computed, effect, inject, output, OutputEmitterRef, signal, Signal, WritableSignal } from "@angular/core";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { ControlsItem } from "@components/conference/controls-item/controls-item";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";
import { ConferenceControlsItemType } from "@shared/types/ConferenceControlsItemType";
import { AuthService } from "@shared/services/auth.service";
import { UserType } from "@shared/types/UserType";
import { Router, RouterLink } from "@angular/router";
import { Select } from "@shared/components/select/select";
import { DeviceLabelPipe } from "@shared/pipes/device-label-pipe";
import { Input } from "@shared/components/input/input";

@Component({
    selector: "app-conference-waiting-room",
    imports: [ControlsItem, Title, Input, Button, Select, DeviceLabelPipe, RouterLink],
    templateUrl: "./waiting-room.html",
    styleUrl: "./waiting-room.css"
})
export class WaitingRoom {
    protected meetingCode: Signal<string> = computed<string>(() => this.conferenceWebSocket.meeting()?.code || "");

    protected localVideoStream: Signal<MediaStream> = computed(() => this.conferenceWebSocket.localVideoStream());

    protected isVideoEnabled: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isVideoEnabled());

    protected audioControlItem: Signal<ConferenceControlsItemType> = computed<ConferenceControlsItemType>(() => ({
        type: "audio",
        isEnabled: this.conferenceWebSocket.isAudioEnabled()
    }));

    protected videoControlItem: Signal<ConferenceControlsItemType> = computed<ConferenceControlsItemType>(() => ({
        type: "video",
        isEnabled: this.conferenceWebSocket.isVideoEnabled()
    }));

    protected isAuthorized: Signal<boolean> = computed<boolean>(() => !!this.authService.user());

    protected name: WritableSignal<string> = signal<string>("");

    protected availableVideoDevices: Signal<MediaDeviceInfo[]> = computed<MediaDeviceInfo[]>(() => {
        return this.conferenceWebSocket.devices()
            .filter((device: MediaDeviceInfo) => device.kind === "videoinput");
    });

    protected availableAudioDevices: Signal<MediaDeviceInfo[]> = computed<MediaDeviceInfo[]>(() => {
        return this.conferenceWebSocket.devices()
            .filter((device: MediaDeviceInfo) => device.kind === "audioinput");
    });

    protected selectedVideoDeviceId: Signal<string> = computed<string>(() => this.conferenceWebSocket.selectedVideoDeviceId());
    protected selectedAudioDeviceId: Signal<string> = computed<string>(() => this.conferenceWebSocket.selectedAudioDeviceId());

    protected isJoining: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.isJoining());
    protected hasHostJoined: Signal<boolean> = computed<boolean>(() => this.conferenceWebSocket.hasHostJoined());
    protected isClickToJoinDisabled: Signal<boolean> = computed<boolean>(() => this.isJoining() || !this.name().trim().length);

    public onJoinConference: OutputEmitterRef<void> = output<void>();

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);
    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);

    constructor() {
        effect(() => {
            const user: UserType | null = this.authService.user();

            if (user) {
                this.name.set(`${user.name} ${user.surname}`);
            }
            else {
                this.name.set(localStorage.getItem("polyVideoGuestName") || "Guest");
            }
        });
    }

    async ngOnInit(): Promise<void> {
        const user: UserType | null = this.authService.user();

        if (user) {
            this.name.set(`${user.name} ${user.surname}`);
        }
        else {
            this.name.set(localStorage.getItem("polyVideoGuestName") || "Guest");
        }

        await this.conferenceWebSocket.getUserMedia();
    }

    protected toggleAudio(): void {
        this.conferenceWebSocket.toggleAudio();
    }

    protected toggleVideo(): void {
        this.conferenceWebSocket.toggleVideo();
    }

    protected changeVideoDevice(deviceId: string): void {
        this.conferenceWebSocket.changeVideoDevice(deviceId);
    }

    protected changeAudioDevice(deviceId: string): void {
        this.conferenceWebSocket.changeAudioDevice(deviceId);
    }

    protected cancelJoining(): void {
        this.conferenceWebSocket.closeConnection();
        this.router.navigate(["/workspace", "meetings"]);
    }

    protected joinConference(): void {
        if (!this.authService.user()) {
            localStorage.setItem("polyVideoGuestName", this.name());
        }

        this.conferenceWebSocket.localName.set(this.name());
        this.onJoinConference.emit();
    }
}
