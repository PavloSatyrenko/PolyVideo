import { CommonModule } from "@angular/common";
import { Component, effect, ElementRef, input, InputSignal, output, OutputEmitterRef, signal, Signal, viewChild, WritableSignal, AfterViewInit, OnDestroy } from "@angular/core";
import { ParticipantType } from "@shared/types/ParticipantType";

@Component({
    selector: "app-conference-participant",
    imports: [CommonModule],
    templateUrl: "./participant.html",
    styleUrl: "./participant.css"
})
export class Participant implements AfterViewInit, OnDestroy {
    public participant: InputSignal<ParticipantType> = input.required<ParticipantType>();

    public pinParticipant: OutputEmitterRef<string> = output<string>();

    protected imageWrapper: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement> | undefined>("imageWrapper");
    protected participantWrapper: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("participantWrapper");

    private imageWrapperSize: WritableSignal<number> = signal<number>(0);

    private resizeObserver!: ResizeObserver;

    constructor() {
        effect(() => {
            const size: number = this.imageWrapperSize();
            const wrapper: ElementRef<HTMLElement> | undefined = this.imageWrapper();

            if (wrapper) {
                wrapper.nativeElement.style.width = `${size}px`;
                wrapper.nativeElement.style.height = `${size}px`;
            }
        });
    }

    public ngAfterViewInit(): void {
        const participantWrapper: ElementRef<HTMLElement> = this.participantWrapper();

        const updateSize = () => {
            const size: number = Math.min(participantWrapper.nativeElement.clientWidth, participantWrapper.nativeElement.clientHeight, 500);
            this.imageWrapperSize.set(size - 32);
        };

        this.resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => updateSize());
        });

        this.resizeObserver.observe(participantWrapper.nativeElement);

        requestAnimationFrame(() => updateSize());
    }

    public ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    protected onPinParticipant(): void {
        this.pinParticipant.emit(this.participant().id);
    }
}
