import { TestBed } from "@angular/core/testing";
import { CanActivateFn } from "@angular/router";

import { mainRouteGuard } from "./main-route-guard";

describe("mainRouteGuard", () => {
    const executeGuard: CanActivateFn = (...guardParameters) =>
        TestBed.runInInjectionContext(() => mainRouteGuard(...guardParameters));

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it("should be created", () => {
        expect(executeGuard).toBeTruthy();
    });
});
