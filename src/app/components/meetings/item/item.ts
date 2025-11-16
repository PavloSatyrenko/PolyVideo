import { Component, computed, inject, input, InputSignal, Signal } from "@angular/core";
import { Router } from "@angular/router";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { MeetingsService } from "@shared/services/meetings.service";
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
    public code: InputSignal<string> = input.required<string>();
    public lastTimeJoined: InputSignal<Date | null> = input<Date | null>(null);
    public scheduleDate: InputSignal<Date | null> = input<Date | null>(null);
    public isStarted: InputSignal<boolean> = input<boolean>(false);

    protected computedLastTimeJoined: Signal<string> = computed(() => {
        const lastTimeJoined: Date | null = this.lastTimeJoined();

        if (!lastTimeJoined) {
            return "";
        }

        return dayjs(lastTimeJoined).fromNow();
    });

    protected computedScheduleDate: Signal<string> = computed(() => {
        const scheduleDate: Date | null = this.scheduleDate();

        if (!scheduleDate) {
            return "";
        }

        return dayjs(scheduleDate).fromNow();
    });

    protected isScheduledBeforeNow: Signal<boolean> = computed(() => {
        const scheduleDate: Date | null = this.scheduleDate();

        if (!scheduleDate) {
            return false;
        }

        return dayjs(scheduleDate).isBefore(dayjs());
    });

    private router: Router = inject(Router);
    private meetingsService: MeetingsService = inject(MeetingsService);

    protected joinMeeting(): void {
        this.router.navigate(["/conference", this.code()]);
    }

    protected startMeeting(): void {
        this.meetingsService.startMeeting(this.code())
            .then(() => {
                this.router.navigate(["/conference", this.code()]);
            });
    }
}