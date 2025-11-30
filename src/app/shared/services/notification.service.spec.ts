import { TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { NotificationService } from "./notification.service";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("NotificationService", () => {
    let service: NotificationService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        });
        service = TestBed.inject(NotificationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
