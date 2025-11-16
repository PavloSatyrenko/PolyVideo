import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ParticipantsSidebar } from "./participants-sidebar";

describe("ParticipantsSidebar", () => {
    let component: ParticipantsSidebar;
    let fixture: ComponentFixture<ParticipantsSidebar>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ParticipantsSidebar],
        }).compileComponents();

        fixture = TestBed.createComponent(ParticipantsSidebar);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
