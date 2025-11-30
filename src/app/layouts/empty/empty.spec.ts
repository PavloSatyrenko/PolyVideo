import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Empty } from "./empty";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Empty", () => {
    let component: Empty;
    let fixture: ComponentFixture<Empty>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Empty],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        fixture = TestBed.createComponent(Empty);
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
