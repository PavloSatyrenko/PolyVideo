import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { RecentMeeting } from "@shared/types/RecentMeeting";
import { MeetingsItem } from "./meetings-item/meetings-item";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-meetings",
    imports: [Title, Button, Input, MeetingsItem, FormsModule],
    templateUrl: "./meetings.html",
    styleUrl: "./meetings.css"
})
export class Meetings implements OnInit {
    protected recentMeetings: WritableSignal<RecentMeeting[]> = signal<RecentMeeting[]>([]);

    protected meetingCodeValue: string = "";

    private router: Router = inject(Router);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

    ngOnInit(): void {
        this.recentMeetings.set([
            {
                id: "1",
                name: "Meeting 1",
                lastTimeJoined: new Date(new Date().setDate(new Date().getDate() - 7))
            },
            {
                id: "2",
                name: "Meeting 2",
                lastTimeJoined: new Date(new Date().setHours(new Date().getHours() - 14))
            },
            {
                id: "3",
                name: "Meeting 3",
                lastTimeJoined: new Date(new Date().setMinutes(new Date().getMinutes() - 39))
            }
        ]);
    }

    createMeeting(): void {
        this.router.navigate(["create"], { relativeTo: this.activatedRoute });
    }

    joinMeeting(): void {
        this.router.navigate(["/meeting", this.meetingCodeValue])
    }
}
