import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ControlsItem } from "./controls-item";

describe("ControlsItem", () => {
    let component: ControlsItem;
    let fixture: ComponentFixture<ControlsItem>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ControlsItem]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ControlsItem);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
