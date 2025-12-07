import { TestBed } from "@angular/core/testing";

import { SizeService } from "./size.service";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { appConfig } from "app.config";

describe("SizeService", () => {
    let service: SizeService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        });
        service = TestBed.inject(SizeService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
