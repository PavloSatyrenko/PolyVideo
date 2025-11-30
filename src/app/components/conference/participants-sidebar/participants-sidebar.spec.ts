import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { ParticipantsSidebar } from "./participants-sidebar";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("ParticipantsSidebar", () => {
    let component: ParticipantsSidebar;
    let fixture: ComponentFixture<ParticipantsSidebar>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ParticipantsSidebar],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);

        fixture = TestBed.createComponent(ParticipantsSidebar);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
