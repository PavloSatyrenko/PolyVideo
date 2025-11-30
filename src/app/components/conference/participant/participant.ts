import { CommonModule } from "@angular/common";
import { Component, input, InputSignal, output, OutputEmitterRef } from "@angular/core";
import { ParticipantType } from "@shared/types/ParticipantType";

@Component({
    selector: "app-conference-participant",
    imports: [CommonModule],
    templateUrl: "./participant.html",
    styleUrl: "./participant.css"
})
export class Participant {
    public participant: InputSignal<ParticipantType> = input.required<ParticipantType>();

    public pinParticipant: OutputEmitterRef<string> = output<string>();

    protected onPinParticipant(): void {
        this.pinParticipant.emit(this.participant().id);
    }
}
