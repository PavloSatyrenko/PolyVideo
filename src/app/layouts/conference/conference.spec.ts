import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Conference } from "./conference";

describe("Conference", () => {
    let component: Conference;
    let fixture: ComponentFixture<Conference>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Conference]
        })
            .compileComponents();

        fixture = TestBed.createComponent(Conference);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
