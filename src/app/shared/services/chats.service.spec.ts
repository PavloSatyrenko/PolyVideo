import { TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { ChatsService } from "./chats.service";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("ChatsService", () => {
    let service: ChatsService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        });
        service = TestBed.inject(ChatsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
