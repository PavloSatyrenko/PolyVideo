import { TestBed } from "@angular/core/testing";
import { CanActivateFn } from "@angular/router";
import { appConfig } from "app.config";

import { mainRouteGuard } from "./main-route-guard";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("mainRouteGuard", () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
        TestBed.runInInjectionContext(() => mainRouteGuard(...guardParameters));

    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        });
        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", () => {
        expect(executeGuard).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
