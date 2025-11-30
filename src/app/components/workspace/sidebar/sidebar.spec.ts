import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Sidebar } from "./sidebar";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Sidebar", () => {
    let component: Sidebar;
    let fixture: ComponentFixture<Sidebar>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Sidebar],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        })
            .compileComponents();

        fixture = TestBed.createComponent(Sidebar);
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
