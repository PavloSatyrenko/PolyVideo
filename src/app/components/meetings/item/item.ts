import { Component, computed, input, InputSignal, Signal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import dayjs from "dayjs/esm";
import relativeTime from "dayjs/esm/plugin/relativeTime";

dayjs.extend(relativeTime);

@Component({
    selector: "app-meetings-item",
    imports: [Button, Title],
    templateUrl: "./item.html",
    styleUrl: "./item.css"
})
export class Item {
    public name: InputSignal<string> = input.required<string>();
    public lastTimeJoined: InputSignal<Date> = input.required<Date>();

    protected computedLastTimeJoined: Signal<string> = computed(() => dayjs(this.lastTimeJoined()).toNow(true) || "1 minute");
}