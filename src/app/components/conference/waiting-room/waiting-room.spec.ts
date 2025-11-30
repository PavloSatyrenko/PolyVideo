import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { WaitingRoom } from "./waiting-room";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("WaitingRoom", () => {
    let component: WaitingRoom;
    let fixture: ComponentFixture<WaitingRoom>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WaitingRoom],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        })
            .compileComponents();

        fixture = TestBed.createComponent(WaitingRoom);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
