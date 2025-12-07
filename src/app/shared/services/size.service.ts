import { Injectable, signal, WritableSignal } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class SizeService {
    public width: WritableSignal<number> = signal<number>(window.innerWidth);
    public height: WritableSignal<number> = signal<number>(window.innerHeight);

    constructor() {
        window.addEventListener("resize", (event: Event) => {
            this.width.set((event.target as Window).innerWidth);
            this.height.set((event.target as Window).innerHeight);
        });
    }
}
