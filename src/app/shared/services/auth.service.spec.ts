import { TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { AuthService } from "./auth.service";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("AuthService", () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
