import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Sidebar } from "@components/workspace/sidebar/sidebar";
import { Topbar } from "@components/workspace/topbar/topbar";

@Component({
    selector: "app-layout-workspace",
    imports: [RouterOutlet, Topbar, Sidebar],
    templateUrl: "./workspace.html",
    styleUrl: "./workspace.css"
})
export class Workspace { }
