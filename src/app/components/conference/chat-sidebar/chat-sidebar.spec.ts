import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { ChatSidebar } from "./chat-sidebar";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("ChatSidebar", () => {
    let component: ChatSidebar;
    let fixture: ComponentFixture<ChatSidebar>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChatSidebar],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        fixture = TestBed.createComponent(ChatSidebar);
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
