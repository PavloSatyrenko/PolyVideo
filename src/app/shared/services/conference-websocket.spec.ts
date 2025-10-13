import { TestBed } from "@angular/core/testing";

import { ConferenceWebsocket } from "./conference-websocket";

describe("ConferenceWebsocket", () => {
    let service: ConferenceWebsocket;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ConferenceWebsocket);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
