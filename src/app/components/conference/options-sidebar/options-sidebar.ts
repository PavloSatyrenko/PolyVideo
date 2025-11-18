import { Component, effect, inject, input, InputSignal, OnInit, signal, WritableSignal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { Checkbox } from "@shared/components/checkbox/checkbox";
import { Input } from "@shared/components/input/input";
import { Button } from "@shared/components/button/button";
import { MeetingsService } from "@shared/services/meetings.service";
import { MeetingType } from "@shared/types/MeetingType";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";

@Component({
    selector: "app-conference-options-sidebar",
    imports: [Title, Checkbox, Input, Button],
    templateUrl: "./options-sidebar.html",
    styleUrl: "./options-sidebar.css",
})
export class OptionsSidebar {
    public meeting: InputSignal<MeetingType | null> = input.required<MeetingType | null>();

    protected meetingTitle: WritableSignal<string> = signal<string>("");
    protected isWaitingRoomEnabled: WritableSignal<boolean> = signal<boolean>(true);
    protected isScreenSharingAllowed: WritableSignal<boolean> = signal<boolean>(true);
    protected isGuestAccessEnabled: WritableSignal<boolean> = signal<boolean>(true);

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
