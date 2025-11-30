import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Create } from "./create";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Create", () => {
    let component: Create;
    let fixture: ComponentFixture<Create>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Create],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        })
            .compileComponents();

        fixture = TestBed.createComponent(Create);
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
