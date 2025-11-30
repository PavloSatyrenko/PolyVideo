import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { SidebarItem } from "./sidebar-item";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("SidebarItem", () => {
    let component: SidebarItem;
    let fixture: ComponentFixture<SidebarItem>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SidebarItem],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        })
            .compileComponents();

        fixture = TestBed.createComponent(SidebarItem);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.componentRef.setInput("link", "/test");
        fixture.componentRef.setInput("label", "Test Label");
        fixture.componentRef.setInput("icon", "test-icon");
        fixture.componentRef.setInput("isNotified", false);
        fixture.componentRef.setInput("isExpanded", false);
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
