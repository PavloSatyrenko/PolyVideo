import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Conference } from "./conference";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Conference", () => {
    let component: Conference;
    let fixture: ComponentFixture<Conference>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Conference],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        fixture = TestBed.createComponent(Conference);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.detectChanges();

        const userReqs = httpMock.match((req) => req.url.includes("/auth/user"));
        if (userReqs.length) {
            userReqs.forEach((r) => r.flush({}));
        }
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        const remaining = httpMock.match((req) => req.url.includes("/auth/user"));
        if (remaining.length) {
            remaining.forEach((r) => r.flush({}));
        }
        httpMock.verify();
    });
});
