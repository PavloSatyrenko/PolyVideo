import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Item } from "./item";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Item", () => {
    let component: Item;
    let fixture: ComponentFixture<Item>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Item],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        })
            .compileComponents();

        fixture = TestBed.createComponent(Item);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.componentRef.setInput("name", "Test Meeting");
        fixture.componentRef.setInput("code", "TEST123");
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
