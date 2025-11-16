import { Component, computed, input, InputSignal, Signal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { ParticipantType } from "@shared/types/ParticipantType";

@Component({
    selector: "app-conference-participants-sidebar",
    imports: [Title],
    templateUrl: "./participants-sidebar.html",
    styleUrl: "./participants-sidebar.css",
})
export class ParticipantsSidebar {
    public participants: InputSignal<ParticipantType[]> = input<ParticipantType[]>([]);

    protected visibleParticipants: Signal<ParticipantType[]> = computed<ParticipantType[]>(() => this.participants()
        .filter((participant: ParticipantType) => !participant.isScreen));
}
