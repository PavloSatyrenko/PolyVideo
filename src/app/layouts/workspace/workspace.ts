import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Topbar } from "./components/topbar/topbar";
import { Sidebar } from "./components/sidebar/sidebar";

@Component({
    selector: "app-workspace",
    imports: [RouterOutlet, Topbar, Sidebar],
    templateUrl: "./workspace.html",
    styleUrl: "./workspace.css"
})
export class Workspace { }
