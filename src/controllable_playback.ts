import { DomRegistry } from "./dom_registry";
import { AudioFileChange, AudioPlaybackEvent, EventBus, UserSeekRequest } from "./event_bus";

export class ControllablePlayback {
    private eventBus: EventBus;
    private audio: HTMLAudioElement;
    private speedSelect: HTMLSelectElement ;

    constructor(eventBus: EventBus, domRegistry: DomRegistry) {
        this.eventBus = eventBus;
        
        this.audio = domRegistry.audio;
        this.speedSelect = domRegistry.speedSelect;

        this.speedSelect.addEventListener("change", () => {
            this.applyPlaybackSpeed();
        });
        
        document.addEventListener("keydown", e => {
            if (e.code === "ArrowLeft") {
                e.preventDefault();
                this.performRelativeSeek(-0.5);
            }
            if (e.code === "ArrowRight") {
                e.preventDefault();
                this.performRelativeSeek(0.5);
            }
            if (e.code === "Space") {
                e.preventDefault();
                this.togglePause();
            }
        });

        this.audio.addEventListener("timeupdate", () => {
            this.onAudioTimeChanged();
        });
        
        this.eventBus.register(AudioFileChange.prototype, (e: AudioFileChange) => {
            this.audio.src = e.newAudioFile;
            this.applyPlaybackSpeed();
        });

        this.eventBus.register(UserSeekRequest.prototype, (e: UserSeekRequest) => {
            this.audio.currentTime = e.seekPercentage * this.audio.duration;
        });
    }

    getDuration(): number {
        return this.audio.duration;
    }
    getCurrentTime(): number {
        return this.audio.currentTime;
    }

    private onAudioTimeChanged() {
        this.eventBus.emit(new AudioPlaybackEvent(this.audio.currentTime, this.audio.duration));
    }

    private performRelativeSeek(delta: number) {
        this.audio.currentTime = clamp(this.audio.currentTime + delta, 0, this.audio.duration || Infinity);
    }

    private applyPlaybackSpeed() {
        if (!this.audio || !this.speedSelect) return;
        this.audio.playbackRate = parseFloat(this.speedSelect.value) || 1;
    }

    private togglePause() {
        if (!this.audio) return;
        if (this.audio.paused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }
}

function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(min, num), max)
}