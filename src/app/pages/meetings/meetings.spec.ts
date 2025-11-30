import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Meetings } from "./meetings";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Meetings", () => {
    let component: Meetings;
    let fixture: ComponentFixture<Meetings>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Meetings],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        fixture = TestBed.createComponent(Meetings);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.detectChanges();

        try {
            const recentReq = httpMock.expectOne((req) => req.url.includes("/meetings/recent"));
            recentReq.flush([]);
        } catch {
            console.warn("No recent meetings request made");
        }

        try {
            const ownedReq = httpMock.expectOne((req) => req.url.includes("/meetings/owned"));
            ownedReq.flush([]);
        } catch {
            console.warn("No owned meetings request made");
        }
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
