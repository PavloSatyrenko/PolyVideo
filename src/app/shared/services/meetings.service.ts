import { firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { MeetingType } from "@shared/types/MeetingType";
import { RecentMeetingType } from "@shared/types/RecentMeetingType";

@Injectable({
    providedIn: "root",
})
export class MeetingsService {
    private httpClient: HttpClient = inject(HttpClient);

    public async createMeeting(
        meetingName: string,
        isGuestAllowed: boolean,
        isWaitingRoom: boolean,
        isScreenSharing: boolean,
        isPlanned: boolean,
        scheduledDate?: Date
    ): Promise<MeetingType> {
        const payload: {
            title: string,
            isGuestAllowed: boolean,
            isWaitingRoom: boolean,
            isScreenSharing: boolean,
            isPlanned: boolean,
            startTime?: string
        } = {
            title: meetingName,
            isGuestAllowed: isGuestAllowed,
            isWaitingRoom: isWaitingRoom,
            isScreenSharing: isScreenSharing,
            isPlanned: isPlanned,
        };

        if (isPlanned && scheduledDate) {
            payload.startTime = scheduledDate.toISOString();
        }

        return await firstValueFrom(this.httpClient.post<MeetingType>(environment.serverURL + "/meetings", payload));
    }

    public async getMeetingByCode(meetingCode: string): Promise<MeetingType> {
        return await firstValueFrom(this.httpClient.get<MeetingType>(environment.serverURL + `/meetings/${meetingCode}`));
    }

    public async getRecentMeetings(): Promise<RecentMeetingType[]> {
        return await firstValueFrom(this.httpClient.get<RecentMeetingType[]>(environment.serverURL + "/meetings/recent"));
    }

    public async addMeetingToRecent(meetingCode: string): Promise<void> {
        await firstValueFrom(this.httpClient.post<void>(environment.serverURL + `/meetings/recent/${meetingCode}`, {}));
    }

    public async getOwnedMeetings(): Promise<MeetingType[]> {
        return await firstValueFrom(this.httpClient.get<MeetingType[]>(environment.serverURL + "/meetings/owned"));
    }

    public async startMeeting(meetingCode: string): Promise<void> {
        await firstValueFrom(this.httpClient.post<void>(environment.serverURL + `/meetings/start/${meetingCode}`, {}));
    }

    public async updateMeetingOptions(
        meetingCode: string,
        title: string,
        isWaitingRoom: boolean,
        isScreenSharing: boolean,
        isGuestAllowed: boolean
    ): Promise<void> {
        await firstValueFrom(this.httpClient.put<void>(environment.serverURL + `/meetings/${meetingCode}`, {
            title: title,
            isWaitingRoom: isWaitingRoom,
            isScreenSharing: isScreenSharing,
            isGuestAllowed: isGuestAllowed
        }));
    }
}
