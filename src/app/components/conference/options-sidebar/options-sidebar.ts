import { Component, computed, effect, inject, input, InputSignal, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { Checkbox } from "@shared/components/checkbox/checkbox";
import { Input } from "@shared/components/input/input";
import { Button } from "@shared/components/button/button";
import { MeetingsService } from "@shared/services/meetings.service";
import { MeetingType } from "@shared/types/MeetingType";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { Select } from "@shared/components/select/select";
import { DeviceLabelPipe } from "@shared/pipes/device-label-pipe";

@Component({
    selector: "app-conference-options-sidebar",
    imports: [Title, Checkbox, Input, Button, Select, DeviceLabelPipe],
    templateUrl: "./options-sidebar.html",
    styleUrl: "./options-sidebar.css",
})
export class OptionsSidebar {
    public meeting: InputSignal<MeetingType | null> = input.required<MeetingType | null>();

    protected meetingTitle: WritableSignal<string> = signal<string>("");
    protected isWaitingRoomEnabled: WritableSignal<boolean> = signal<boolean>(true);
    protected isScreenSharingAllowed: WritableSignal<boolean> = signal<boolean>(true);
    protected isGuestAccessEnabled: WritableSignal<boolean> = signal<boolean>(true);

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

    private meetingsService: MeetingsService = inject(MeetingsService);
    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);

    constructor() {
        effect(() => {
            const meeting: MeetingType | null = this.meeting();

            if (meeting) {
                this.meetingTitle.set(meeting.title);
                this.isWaitingRoomEnabled.set(meeting.isWaitingRoom);
                this.isScreenSharingAllowed.set(meeting.isScreenSharing);
                this.isGuestAccessEnabled.set(meeting.isGuestAllowed);
            }
        });
    }

    protected changeVideoDevice(deviceId: string): void {
        this.conferenceWebSocket.changeVideoDevice(deviceId);
    }

    protected changeAudioDevice(deviceId: string): void {
        this.conferenceWebSocket.changeAudioDevice(deviceId);
    }

    protected saveOptions(): void {
        this.meetingsService.updateMeetingOptions(
            this.meeting()?.code ?? "",
            this.meetingTitle(),
            this.isWaitingRoomEnabled(),
            this.isScreenSharingAllowed(),
            this.isGuestAccessEnabled()
        ).then(() => {
            this.conferenceWebSocket.refreshMeetingInfo(
                this.meetingTitle(),
                this.isWaitingRoomEnabled(),
                this.isScreenSharingAllowed(),
                this.isGuestAccessEnabled()
            );
        }).catch((error: any) => {
            console.error("Failed to save meeting options:", error);
        });
    }
}
