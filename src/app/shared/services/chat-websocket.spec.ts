import { TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { ChatWebsocket } from "./chat-websocket";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("ChatWebsocket", () => {
    let service: ChatWebsocket;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        });
        service = TestBed.inject(ChatWebsocket);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
