import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Window } from "./window";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Window", () => {
    let component: Window;
    let fixture: ComponentFixture<Window>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Window],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        fixture = TestBed.createComponent(Window);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.componentRef.setInput("chatUserId", "test-user-id");
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
