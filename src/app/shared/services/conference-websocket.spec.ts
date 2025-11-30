import { TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { ConferenceWebsocket } from "./conference-websocket";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("ConferenceWebsocket", () => {
    let service: ConferenceWebsocket;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        });
        service = TestBed.inject(ConferenceWebsocket);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
