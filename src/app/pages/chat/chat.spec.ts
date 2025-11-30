import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Chat } from "./chat";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Chat", () => {
    let component: Chat;
    let fixture: ComponentFixture<Chat>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Chat],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);

        fixture = TestBed.createComponent(Chat);
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
