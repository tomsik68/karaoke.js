import { DomRegistry } from "./dom_registry";
import { AudioTimeChangeEvent, EventBus } from "./event_bus";

export class AudioPlayer {
    private eventBus: EventBus;
    private hasFile: boolean;

    private fileUpload: HTMLInputElement | null;
    private audio: HTMLAudioElement | null;
    private speedSelect: HTMLSelectElement | null;
    private waveToggle: HTMLInputElement | null;
    private waveCanvas: HTMLCanvasElement | null;
    private waveWrap: HTMLDivElement | null;
    private waveformLoading: HTMLDivElement | null;

    private waveformSrc: string | null;
    private waveformData: any;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;

        this.hasFile = false;

        this.fileUpload = null;
        this.audio = null;
        this.speedSelect = null;
        this.waveToggle = null;
        this.waveWrap = null;
        this.waveCanvas = null;
        this.waveformSrc = null;
        this.waveformData = null;
        this.waveformLoading = null;
    }

    attachToDom(domRegistry: DomRegistry) {
        const document = window.document;

        this.audio = domRegistry.audio;
        this.speedSelect = domRegistry.speedSelect;
        this.waveToggle = domRegistry.waveToggle;
        this.fileUpload = domRegistry.audioFile;
        this.waveCanvas = domRegistry.waveCanvas;
        this.waveWrap = domRegistry.waveformWrap;
        this.waveformLoading = domRegistry.waveformLoading;

        const player = this;
        this.fileUpload.addEventListener("change", async function () {
            await player.fileChange();
        });

        this.speedSelect.addEventListener("change", () => {
            player.applyPlaybackSpeed();
        });

        document.addEventListener("keydown", e => {
            if (e.code === "ArrowLeft") {
                e.preventDefault();
                player.performSeek(-0.5);
            }
            if (e.code === "ArrowRight") {
                e.preventDefault();
                player.performSeek(0.5);
            }
            if (e.code === "Space") {
                e.preventDefault();
                player.togglePause();
            }
        });

        this.audio.addEventListener("timeupdate", () => {
            player.onAudioTimeChanged();
        });
        
        this.waveToggle.addEventListener("change", () => {
            if (!player.waveToggle || !player.waveWrap) return;
            player.waveWrap.style.display = (player.waveToggle.checked) ? "block" : "none";
            player.updateWaveform();
        });
        
        this.waveCanvas.addEventListener("click", (ev) => {
            if (!player.audio || !player.waveCanvas) return;

            const cssW = player.waveCanvas.clientWidth;
            player.audio.currentTime = ev.offsetX / cssW * player.audio.duration;
        });
        this.waveCanvas.addEventListener("mousemove", (ev) => {
            if (!player.audio || !player.waveCanvas) return;

            if (ev.buttons & 1) {
                const cssW = player.waveCanvas.clientWidth;
                player.audio.currentTime = ev.offsetX / cssW * player.audio.duration;
            }
        });


        this.updateElementVisibility();

    }
    
    private togglePause() {
        if (!this.audio) return;
        if (this.audio.paused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }

    private onAudioTimeChanged() {
        if (!this.audio) return;

        let currentTime = this.audio.currentTime;
        this.eventBus.emit(new AudioTimeChangeEvent(currentTime));
        
        if (!this.waveCanvas || !this.waveformData) return;
        drawWave(this.waveformData, this.waveCanvas);

        const dpr = window.devicePixelRatio || 1;
        const cssW = this.waveCanvas.clientWidth;
        const cssH = this.waveCanvas.clientHeight;
        const ctx = this.waveCanvas.getContext("2d") as CanvasRenderingContext2D;
        
        const x = this.audio.currentTime / this.audio.duration * cssW;
        ctx.fillStyle = "#0f0";
        
        ctx.fillRect(x, 0, 1, cssH);
    }

    performSeek(delta: number) {
        if (!this.audio) return;
        this.audio.currentTime = clamp(this.audio.currentTime + delta, 0, this.audio.duration || Infinity);
    }

    private applyPlaybackSpeed() {
        if (!this.audio || !this.speedSelect) return;
        this.audio.playbackRate = parseFloat(this.speedSelect.value) || 1;
    }

    private async fileChange() {
        if (!this.fileUpload || !this.fileUpload.files) return;

        const file = this.fileUpload.files[0];
        if (!file) return;

        await this.fileChosen(file);

    }

    private async fileChosen(file: File) {
        if (!this.audio || !this.speedSelect) return;

        this.hasFile = true;
        this.audio.src = URL.createObjectURL(file);
        this.applyPlaybackSpeed();
        this.updateElementVisibility();
        await this.updateWaveform();
    }

    private setWaveformLoading() {
        if (!this.audio || !this.waveCanvas || !this.waveformLoading) return;
        const dpr = window.devicePixelRatio || 1;
        this.waveCanvas.style = '';
        const cssW = this.waveCanvas.clientWidth;
        const cssH = this.waveCanvas.clientHeight;
        this.waveCanvas.width = Math.max(1, Math.floor(cssW * dpr));
        this.waveCanvas.height = Math.max(1, Math.floor(cssH * dpr));
        this.waveCanvas.style.width = cssW + 'px'; this.waveCanvas.style.height = cssH + 'px';
        const ctx = this.waveCanvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, this.waveCanvas.width, this.waveCanvas.height);
        ctx.fillStyle = "#bfbfbf";
        
        this.waveformLoading.style.display = 'inline-flex';
        this.waveCanvas.style.display = 'none';
    }

    private setWaveformLoadingDone() {
        if (!this.waveformLoading || !this.waveCanvas) return;

        this.waveformLoading.style.display = 'none';
        this.waveCanvas.style.display = 'block';
    }

    private async updateWaveform() {
        if (!this.audio || !this.waveCanvas || !this.waveformLoading) return;

        if (this.waveformSrc === this.audio.src && this.waveformData) return;
        this.setWaveformLoading();

        this.waveformData = null;
        this.waveformSrc = null;

        const SAMPLE_COUNT = 320;
        if (!AudioContext) throw new Error("No Web Audio API support.");
        const ctx = new AudioContext({
            sampleRate: 44100,
        });
        try {
            const res = await fetch(this.audio.src);
            const ab = await res.arrayBuffer();
            const audioBuf = await ctx.decodeAudioData(ab.slice(0));
            if (!audioBuf) throw new Error("decodeAudioData returned null");
            const channels = audioBuf.numberOfChannels;
            const len = audioBuf.length;
            const block = Math.max(1, Math.floor(len / SAMPLE_COUNT));
            const samples = new Float32Array(SAMPLE_COUNT);
            for (let i = 0; i < SAMPLE_COUNT; i++) {
                const start = i * block, end = Math.min(len, start + block);
                let max = 0;
                for (let ch = 0; ch < channels; ch++) {
                    const data = audioBuf.getChannelData(ch);
                    for (let j = start; j < end; j++) { const v = Math.abs(data[j]); if (v > max) max = v; }
                }
                samples[i] = max;
            }
            this.waveformData = samples;
            this.waveformSrc = this.audio.src;

        } finally { try { ctx.close(); } catch (e) { console.log(e) } }
        
        drawWave(this.waveformData, this.waveCanvas);
        this.setWaveformLoadingDone();
    }

    private updateElementVisibility() {
        const hide = !this.hasFile;

        const elementsToHide = [this.audio, this.speedSelect, this.waveToggle];

        if (hide) {
            for (let element of elementsToHide) {
                if (!element) continue;

                element.style.display = 'none';
            }
        } else {
            for (let element of elementsToHide) {
                if (!element) continue;

                element.style.display = '';
            }
        }
    }
    
    getCurrentTime(): number {
        if (!this.audio) return 0;
        return this.audio.currentTime;
    }
}

function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(min, num), max)
}

function drawWave(waveformData: any, waveCanvas: HTMLCanvasElement) {
    if (!waveformData) return;
    const dpr = window.devicePixelRatio || 1;
    // reset inline style
    waveCanvas.style = '';
    const cssW = waveCanvas.clientWidth;
    const cssH = waveCanvas.clientHeight;
    waveCanvas.width = Math.max(1, Math.floor(cssW * dpr));
    waveCanvas.height = Math.max(1, Math.floor(cssH * dpr));
    waveCanvas.style.width = cssW + 'px'; waveCanvas.style.height = cssH + 'px';
    const ctx = waveCanvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    ctx.fillStyle = "#bfbfbf";
    ctx.beginPath();
    const N = waveformData.length;
    for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * waveCanvas.width;
        const y = (1 - waveformData[i]) * (waveCanvas.height * 0.9 * 0.95);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineTo(waveCanvas.width, waveCanvas.height);
    ctx.lineTo(0, waveCanvas.height);
    ctx.closePath(); ctx.fill();
}
