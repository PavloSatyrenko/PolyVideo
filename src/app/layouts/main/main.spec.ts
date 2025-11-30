import { appConfig } from "app.config";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Main } from "./main";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Main", () => {
    let component: Main;
    let fixture: ComponentFixture<Main>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Main],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        fixture = TestBed.createComponent(Main);
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
