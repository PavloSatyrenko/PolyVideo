import { Component, computed, input, InputSignal, Signal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import moment from "moment";
import { Title } from "@shared/components/title/title";

@Component({
    selector: "app-meetings-item",
    imports: [Button, Title],
    templateUrl: "./meetings-item.html",
    styleUrl: "./meetings-item.css"
})
export class MeetingsItem {
    public readonly name: InputSignal<string> = input.required<string>();
    public readonly lastTimeJoined: InputSignal<Date> = input.required<Date>();

    protected computedLastTimeJoined: Signal<string> = computed(() => moment.duration(moment().diff(this.lastTimeJoined())).humanize() || "1 minute");
}