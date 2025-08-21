import { Component, computed, inject, OnInit, output, OutputEmitterRef, Signal } from "@angular/core";
import { MeetingWebSocketService } from "@shared/services/meeting-websocket";
import { MeetingControlsItem } from "../meeting-controls-item/meeting-controls-item";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";

@Component({
    selector: "app-meeting-waiting-room",
    imports: [MeetingControlsItem, Title, Button],
    templateUrl: "./meeting-waiting-room.html",
    styleUrl: "./meeting-waiting-room.css"
})
export class MeetingWaitingRoom implements OnInit {
    protected localVideoStream: Signal<MediaStream> = computed<MediaStream>(() => this.meetingWebSocketService.localVideoStream());
    protected localAudioStream: Signal<MediaStream> = computed<MediaStream>(() => this.meetingWebSocketService.localAudioStream());

    public onJoinMeeting: OutputEmitterRef<void> = output<void>();

    private meetingWebSocketService: MeetingWebSocketService = inject(MeetingWebSocketService);

    async ngOnInit(): Promise<void> {
        await this.meetingWebSocketService.getUserMedia();
    }

    joinMeeting(): void {
        this.onJoinMeeting.emit();
    }
}