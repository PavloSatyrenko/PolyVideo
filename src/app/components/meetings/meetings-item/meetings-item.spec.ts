import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MeetingsItem } from "./meetings-item";

describe("MeetingsItem", () => {
    let component: MeetingsItem;
    let fixture: ComponentFixture<MeetingsItem>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MeetingsItem]
        })
            .compileComponents();

        fixture = TestBed.createComponent(MeetingsItem);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
