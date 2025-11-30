import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { ControlsItem } from "./controls-item";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("ControlsItem", () => {
    let component: ControlsItem;
    let fixture: ComponentFixture<ControlsItem>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ControlsItem],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        })
            .compileComponents();

        fixture = TestBed.createComponent(ControlsItem);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.componentRef.setInput("item", {
            type: "test-type",
            isEnabled: true
        });
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
