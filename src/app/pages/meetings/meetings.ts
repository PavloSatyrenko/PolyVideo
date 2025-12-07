import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { RecentMeetingType } from "@shared/types/RecentMeetingType";
import { ActivatedRoute, Router } from "@angular/router";
import { Item } from "@components/meetings/item/item";
import { MeetingsService } from "@shared/services/meetings.service";
import { MeetingType } from "@shared/types/MeetingType";
import { SizeService } from "@shared/services/size.service";

@Component({
    selector: "app-page-meetings",
    imports: [Title, Button, Input, Item],
    templateUrl: "./meetings.html",
    styleUrl: "./meetings.css"
})
export class Meetings implements OnInit {
    protected recentMeetings: WritableSignal<RecentMeetingType[]> = signal<RecentMeetingType[]>([]);
    protected ownedMeetings: WritableSignal<MeetingType[]> = signal<MeetingType[]>([]);

    protected recentVisibleMeetings: Signal<RecentMeetingType[]> = computed<RecentMeetingType[]>(() => this.recentMeetings().slice(0, 3));
    protected ownedVisibleMeetings: Signal<MeetingType[]> = computed<MeetingType[]>(() => this.ownedMeetings().slice(0, 3));

    protected isRecentMeetingsVisible: Signal<boolean> = computed<boolean>(() => this.recentMeetings().length > 0);
    protected isOwnedMeetingsVisible: Signal<boolean> = computed<boolean>(() => this.ownedMeetings().length > 0);

    protected meetingCodeValue: WritableSignal<string> = signal<string>("");

    private router: Router = inject(Router);
    private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private meetingsService: MeetingsService = inject(MeetingsService);
    protected sizeService: SizeService = inject(SizeService);

    ngOnInit(): void {
        this.loadRecentMeetings();
        this.loadOwnedMeetings();
    }

    protected async loadRecentMeetings(): Promise<void> {
        this.meetingsService.getRecentMeetings()
            .then((meetings: RecentMeetingType[]) => {
                this.recentMeetings.set(meetings);
            });
    }

    protected async loadOwnedMeetings(): Promise<void> {
        this.meetingsService.getOwnedMeetings()
            .then((meetings: MeetingType[]) => {
                this.ownedMeetings.set(meetings);
            });
    }

    protected createMeeting(): void {
        this.router.navigate(["create"], { relativeTo: this.activatedRoute });
    }

    protected joinMeeting(): void {
        if (this.meetingCodeValue().trim().length === 0) {
            return;
        }

        this.router.navigate(["/conference", this.meetingCodeValue()])
    }
}
