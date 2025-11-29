import { ControllablePlayback } from "./controllable_playback";
import { DomRegistry } from "./dom_registry";
import { AppEvent, AudioFileChange, AudioPlaybackEvent, EventBus, EventType, UserSeekRequest } from "./event_bus";
import { Waveform } from "./waveform";

export class AudioPlayer {
    private eventBus: EventBus;

    private fileUpload: HTMLInputElement;

    private waveform: Waveform;
    private controllablePlayback: ControllablePlayback;

    constructor(eventBus: EventBus, domRegistry: DomRegistry) {
        this.eventBus = eventBus;
        this.fileUpload = domRegistry.audioFile;
        this.waveform = new Waveform(eventBus, domRegistry);
        this.controllablePlayback = new ControllablePlayback(eventBus, domRegistry);
        
        this.attachToDom(domRegistry);
    }

    attachToDom(domRegistry: DomRegistry) {
        const document = window.document;
        const player = this;

        this.fileUpload.addEventListener("change", function () {
            player.fileChange();
        });
        
        // ensure we register the last selected file if any is present
        player.fileChange();
    }

    private fileChange() {
        if (!this.fileUpload || !this.fileUpload.files) return;

        const file = this.fileUpload.files[0];
        if (!file) return;

        this.fileChosen(file);

    }

    private fileChosen(file: File) {
        const src = URL.createObjectURL(file);
        this.eventBus.emit(new AudioFileChange(src));
    }

    getCurrentTime(): number {
        return this.controllablePlayback.getCurrentTime();
    }

    getDuration(): number {
        return this.controllablePlayback.getDuration();
    }
}