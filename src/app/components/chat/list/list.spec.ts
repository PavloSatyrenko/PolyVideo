import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { List } from "./list";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("List", () => {
    let component: List;
    let fixture: ComponentFixture<List>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [List],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        fixture = TestBed.createComponent(List);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.componentRef.setInput("chats", []);
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
