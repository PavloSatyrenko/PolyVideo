import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Signup } from "./signup";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Signup", () => {
    let component: Signup;
    let fixture: ComponentFixture<Signup>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Signup],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);

        fixture = TestBed.createComponent(Signup);
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
