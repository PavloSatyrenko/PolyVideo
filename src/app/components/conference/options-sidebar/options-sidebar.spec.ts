import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { OptionsSidebar } from "./options-sidebar";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("OptionsSidebar", () => {
    let component: OptionsSidebar;
    let fixture: ComponentFixture<OptionsSidebar>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OptionsSidebar],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        fixture = TestBed.createComponent(OptionsSidebar);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.componentRef.setInput("meeting", {
            id: "test-meeting-id",
            code: "TEST123",
            title: "Test Meeting",
            isPlanned: false,
            isStarted: true,
            startTime: new Date(),
            endTime: null,
            isWaitingRoom: true,
            isScreenSharing: true,
            isGuestAllowed: true,
            ownerId: "test-owner-id"
        });
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
