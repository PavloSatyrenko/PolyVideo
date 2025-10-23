import { Component, computed, Signal, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";
import { Checkbox } from "@shared/components/checkbox/checkbox";

@Component({
    selector: "app-meetings-create",
    imports: [Title, Input, Button, Checkbox],
    templateUrl: "./create.html",
    styleUrl: "./create.css"
})
export class Create {
    protected meetingName: WritableSignal<string> = signal<string>("");
    protected isPlanned: WritableSignal<boolean> = signal<boolean>(false);

    protected submitButtonText: Signal<string> = computed(() => this.isPlanned() ? "Schedule the meeting" : "Start the meeting");

    protected createMeeting(): void {

    }
}