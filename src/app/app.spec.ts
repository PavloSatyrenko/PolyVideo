import { TestBed } from "@angular/core/testing";
import { App } from "./app";
import { appConfig } from "app.config";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

describe("App", () => {
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App],
            providers: [...appConfig.providers, provideHttpClientTesting()],
            teardown: { destroyAfterEach: false }
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should create the app", () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });
});
