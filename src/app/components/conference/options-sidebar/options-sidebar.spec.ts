import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OptionsSidebar } from "./options-sidebar";

describe("OptionsSidebar", () => {
    let component: OptionsSidebar;
    let fixture: ComponentFixture<OptionsSidebar>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OptionsSidebar],
        }).compileComponents();

        fixture = TestBed.createComponent(OptionsSidebar);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
