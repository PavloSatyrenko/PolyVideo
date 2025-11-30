import { TestBed } from "@angular/core/testing";
import { HttpInterceptorFn } from "@angular/common/http";
import { appConfig } from "app.config";

import { authInterceptor } from "./auth-interceptor";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("authInterceptor", () => {
    const interceptor: HttpInterceptorFn = (req, next) =>
        TestBed.runInInjectionContext(() => authInterceptor(req, next));

    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        });

        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", () => {
        expect(interceptor).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
