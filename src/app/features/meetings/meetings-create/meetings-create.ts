import { Component, computed, Signal, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";
import { Checkbox } from "@shared/components/checkbox/checkbox";
import { Select } from "@shared/components/select/select";

@Component({
    selector: "app-meetings-create",
    imports: [Title, Input, Button, Checkbox, Select],
    templateUrl: "./meetings-create.html",
    styleUrl: "./meetings-create.css"
})
export class MeetingsCreate {
    protected meetingName: WritableSignal<string> = signal<string>("");
    protected isPlanned: WritableSignal<boolean> = signal<boolean>(false);
    protected recurringOption: WritableSignal<string> = signal<string>("none");

    protected submitButtonText: Signal<string> = computed(() => this.isPlanned() ? "Schedule the meeting" : "Start the meeting");

    protected onPlannedChange(): void {
        if (!this.isPlanned()) {
            this.recurringOption.set("none");
        }
    }

    protected createMeeting(): void {

    }
}