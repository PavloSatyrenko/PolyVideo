import { CommonModule } from "@angular/common";
import { Component, input, InputSignal } from "@angular/core";
import { ParticipantType } from "@shared/types/ParticipantType";

@Component({
    selector: "app-meeting-participant",
    imports: [CommonModule],
    templateUrl: "./meeting-participant.html",
    styleUrl: "./meeting-participant.css"
})
export class MeetingParticipant {
    public readonly participant: InputSignal<ParticipantType | undefined> = input<ParticipantType>();
}