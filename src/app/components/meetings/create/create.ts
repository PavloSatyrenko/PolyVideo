import { Component, computed, inject, Signal, signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { Title } from "@shared/components/title/title";
import { Checkbox } from "@shared/components/checkbox/checkbox";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { MeetingsService } from "@shared/services/meetings.service";
import { Router } from "@angular/router";
import { MeetingType } from "@shared/types/MeetingType";

dayjs.extend(customParseFormat);

@Component({
    selector: "app-meetings-create",
    imports: [Title, Input, Button, Checkbox],
    templateUrl: "./create.html",
    styleUrl: "./create.css",
})
export class Create {
    protected meetingName: WritableSignal<string> = signal<string>("");
    protected isPlanned: WritableSignal<boolean> = signal<boolean>(false);

    protected isWaitingRoom: WritableSignal<boolean> = signal<boolean>(true);
    protected isScreenSharing: WritableSignal<boolean> = signal<boolean>(true);
    protected isGuestAllowed: WritableSignal<boolean> = signal<boolean>(true);

    protected scheduledDay: WritableSignal<string> = signal<string>("");
    protected scheduledMonth: WritableSignal<string> = signal<string>("");
    protected scheduledYear: WritableSignal<string> = signal<string>("");
    protected scheduledHour: WritableSignal<string> = signal<string>("");
    protected scheduledMinute: WritableSignal<string> = signal<string>("");

    private scheduledDate: Signal<Date> = computed<Date>(() => {
        const year = Number(this.scheduledYear()) || 0;
        const month = Number(this.scheduledMonth()) ? Number(this.scheduledMonth()) - 1 : 0;
        const day = Number(this.scheduledDay()) || 1;
        const hour = Number(this.scheduledHour()) || 0;
        const minute = Number(this.scheduledMinute()) || 0;
        return new Date(year, month, day, hour, minute);
    });

    protected hasSubmitted: WritableSignal<boolean> = signal<boolean>(false);
    protected isAllFieldsValid: Signal<boolean> = computed(() => {
        if (!this.hasSubmitted()) {
            return true;
        }

        if (!this.isFieldValid("day") ||
            !this.isFieldValid("month") ||
            !this.isFieldValid("year") ||
            !this.isFieldValid("hour") ||
            !this.isFieldValid("minute")) {
            return true;
        }

        return dayjs(("0" + this.scheduledDay()).slice(-2) + "-" +
            ("0" + this.scheduledMonth()).slice(-2) + "-" +
            this.scheduledYear() + " " +
            ("0" + this.scheduledHour()).slice(-2) + ":" +
            ("0" + this.scheduledMinute()).slice(-2), "DD-MM-YYYY HH:mm", true).isValid() &&
            this.scheduledDate() > new Date();
    });

    protected submitButtonText: Signal<string> = computed(() => this.isPlanned() ? "Schedule the meeting" : "Start the meeting");

    private meetingsService: MeetingsService = inject(MeetingsService);
    private router: Router = inject(Router);

    protected isFieldValid(field: string): boolean {
        if (!this.hasSubmitted()) {
            return true;
        }

        switch (field) {
            case "day":
                return /^(0[1-9]|[12][0-9]|3[01]|[1-9])$/.test(this.scheduledDay());
            case "month":
                return /^(0[1-9]|1[0-2]|[1-9])$/.test(this.scheduledMonth());
            case "year":
                return /^(20\d{2})$/.test(this.scheduledYear());
            case "hour":
                return /^(0[0-9]|1[0-9]|2[0-3]|[0-9])$/.test(this.scheduledHour());
            case "minute":
                return /^([0-5][0-9]|[0-9])$/.test(this.scheduledMinute());
        }

        return false;
    }

    protected createMeeting(): void {
        this.hasSubmitted.set(true);

        if (this.isPlanned()) {
            const fields: string[] = ["day", "month", "year", "hour", "minute"];
            for (const field of fields) {
                if (!this.isFieldValid(field)) {
                    return;
                }
            }

            if (!this.isAllFieldsValid()) {
                return;
            }

            this.meetingsService.createMeeting(
                this.meetingName(),
                this.isGuestAllowed(),
                this.isWaitingRoom(),
                this.isScreenSharing(),
                this.isPlanned(),
                this.scheduledDate(),
            ).then(() => {
                this.router.navigate(["/workspace", "meetings"]);
            }).catch((error: any) => {
                console.error("Error creating meeting:", error);
            });
        }
        else {
            this.meetingsService.createMeeting(
                this.meetingName(),
                this.isGuestAllowed(),
                this.isWaitingRoom(),
                this.isScreenSharing(),
                this.isPlanned(),
            ).then((meeting: MeetingType) => {
                this.router.navigate(["/conference", meeting.code]);
            }).catch((error: any) => {
                console.error("Error creating meeting:", error);
            });
        }
    }
}