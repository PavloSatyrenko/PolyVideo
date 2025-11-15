import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { RecentMeetingType } from "@shared/types/RecentMeetingType";
import { ActivatedRoute, Router } from "@angular/router";
import { Item } from "@components/meetings/item/item";
import { MeetingsService } from "@shared/services/meetings.service";

@Component({
    selector: "app-page-meetings",
    imports: [Title, Button, Input, Item],
    templateUrl: "./meetings.html",
    styleUrl: "./meetings.css"
})
export class Meetings implements OnInit {
    protected recentMeetings: WritableSignal<RecentMeetingType[]> = signal<RecentMeetingType[]>([]);

    protected meetingCodeValue: string = "";

    private router: Router = inject(Router);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private meetingsService: MeetingsService = inject(MeetingsService);

    ngOnInit(): void {
        this.loadRecentMeetings();
    }

    protected async loadRecentMeetings(): Promise<void> {
        this.meetingsService.getRecentMeetings()
            .then((meetings: RecentMeetingType[]) => {
                this.recentMeetings.set(meetings);
            });
    }

    createMeeting(): void {
        this.router.navigate(["create"], { relativeTo: this.activatedRoute });
    }

    joinMeeting(): void {
        if (this.meetingCodeValue.trim().length === 0) {
            return;
        }

        this.router.navigate(["/conference", this.meetingCodeValue])
    }
}
