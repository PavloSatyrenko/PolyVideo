import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Room } from "./room";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Room", () => {
    let component: Room;
    let fixture: ComponentFixture<Room>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Room],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);

        fixture = TestBed.createComponent(Room);
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
