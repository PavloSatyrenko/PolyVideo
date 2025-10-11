import { CommonModule } from "@angular/common";
import { Component, input, InputSignal } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
    selector: "app-workspace-sidebar-item",
    imports: [RouterModule, CommonModule],
    templateUrl: "./sidebar-item.html",
    styleUrl: "./sidebar-item.css"
})
export class SidebarItem {
    public link: InputSignal<string> = input.required<string>();
    public label: InputSignal<string> = input.required<string>();
    public icon: InputSignal<string> = input.required<string>();
    public isNotified: InputSignal<boolean> = input.required<boolean>();
    public isExpanded: InputSignal<boolean> = input.required<boolean>();
}
