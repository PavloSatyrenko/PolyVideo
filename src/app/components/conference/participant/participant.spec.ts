import { ComponentFixture, TestBed } from "@angular/core/testing";
import { appConfig } from "app.config";

import { Participant } from "./participant";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("Participant", () => {
    let component: Participant;
    let fixture: ComponentFixture<Participant>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Participant],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        })
            .compileComponents();

        fixture = TestBed.createComponent(Participant);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        fixture.componentRef.setInput("participant", {
            id: "test-participant-id",
            userId: "test-user-id",
            name: "Test User",
            isAudioEnabled: true,
            isVideoEnabled: true,
            audioStream: new MediaStream(),
            videoStream: new MediaStream(),
            isLocal: true,
            isHandUp: false,
            isScreen: false
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
