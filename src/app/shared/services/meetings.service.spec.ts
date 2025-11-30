import { TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { MeetingsService } from "./meetings.service";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("MeetingsService", () => {
    let service: MeetingsService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        });
        service = TestBed.inject(MeetingsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
