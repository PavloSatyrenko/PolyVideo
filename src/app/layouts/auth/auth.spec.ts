import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Auth } from "./auth";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Auth", () => {
    let component: Auth;
    let fixture: ComponentFixture<Auth>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Auth],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        fixture = TestBed.createComponent(Auth);
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
