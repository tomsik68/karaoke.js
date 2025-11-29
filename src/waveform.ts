import { DomRegistry } from "./dom_registry";
import { AppEvent, AudioFileChange, AudioPlaybackEvent, EventBus, EventType, UserSeekRequest } from "./event_bus";

export class Waveform {
    private eventBus: EventBus;
    private waveToggleWrap: HTMLDivElement;
    private waveToggle: HTMLInputElement;
    private waveCanvas: HTMLCanvasElement;
    private waveWrap: HTMLDivElement;
    private waveformLoading: HTMLDivElement;
    private waveformSrc: string | null;
    private waveformData: Float32Array<ArrayBuffer> | null;

    private waveformFill: string;
    private progressFill: string;

    constructor(eventBus: EventBus, domRegistry: DomRegistry) {
        this.eventBus = eventBus;
        this.waveToggleWrap = domRegistry.waveToggleWrap;
        this.waveToggle = domRegistry.waveToggle;
        this.waveWrap = domRegistry.waveformWrap;
        this.waveCanvas = domRegistry.waveCanvas;
        this.waveformSrc = null;
        this.waveformData = null;
        this.waveformLoading = domRegistry.waveformLoading;
        
        this.waveformFill = "#039";
        this.progressFill = "#af0";

        eventBus.register(EventType.AudioFileChange, (e: AppEvent) => {
            const event = e as AudioFileChange;
            this.waveToggleWrap.style.display = 'block';
            (async () => await this.updateWaveform(event.newAudioFile))();
        });
        
        eventBus.register(EventType.AudioPlayback, (param: AppEvent) => {
            const e = param as AudioPlaybackEvent;
            // update progress indicator, re-render waveform canvas
            this.drawWave();
            this.drawPlaybackIndicator(e.currentTime / e.duration);
        });

        this.waveToggle.addEventListener("change", () => {
            this.syncWaveVisibility();
        });
        // initial setting in case there is a remembered value
        this.syncWaveVisibility();

        this.waveCanvas.addEventListener("click", (ev) => {
            const cssW = this.waveCanvas.clientWidth;
            this.eventBus.emit(new UserSeekRequest(ev.offsetX / cssW));
        });

        this.waveCanvas.addEventListener("mousemove", (ev) => {
            if (ev.buttons & 1) {
                const cssW = this.waveCanvas.clientWidth;
                this.eventBus.emit(new UserSeekRequest(ev.offsetX / cssW));
            }
        });
    }

    private syncWaveVisibility() {
        this.waveWrap.style.display = (this.waveToggle.checked) ? "block" : "none";
    }

    private drawPlaybackIndicator(progressPercentage: number) {
        const dpr = window.devicePixelRatio || 1;
        const cssW = this.waveCanvas.clientWidth;
        const cssH = this.waveCanvas.clientHeight;
        const ctx = this.waveCanvas.getContext("2d") as CanvasRenderingContext2D;

        const x = progressPercentage * cssW;
        ctx.fillStyle = this.progressFill;

        ctx.fillRect(x, 0, 2, cssH);
    }

    private async updateWaveform(newAudioFile: string) {
        if (this.waveformSrc === newAudioFile && this.waveformData) return;
        this.setWaveformLoading();

        this.waveformData = null;
        this.waveformSrc = null;

        const SAMPLE_COUNT = 320;
        if (!AudioContext) throw new Error("No Web Audio API support.");
        const ctx = new AudioContext({
            sampleRate: 44100,
        });
        try {
            const res = await fetch(newAudioFile);
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
                    for (let j = start; j < end; j++) { const v = Math.abs(data[j]); max = Math.max(max, v); }
                }
                samples[i] = max;
            }
            this.waveformData = samples;
            this.waveformSrc = newAudioFile;

        } finally { try { ctx.close(); } catch (e) { console.log(e) } }

        this.drawWave();
        this.setWaveformLoadingDone();
    }

    private setWaveformLoadingDone() {
        this.waveformLoading.style.display = 'none';
        this.waveCanvas.style.display = 'block';
    }

    private setWaveformLoading() {
        console.log('loading wave');
        this.waveformLoading.style.display = 'inline-flex';
        this.waveCanvas.style.display = 'none';
    }

    private drawWave() {
        if (!this.waveformData) return;
        const dpr = window.devicePixelRatio || 1;
        this.waveCanvas.style = '';
        this.waveWrap.style.display = this.waveToggle.checked ? '' : 'none';
        const cssW = this.waveCanvas.clientWidth;
        const cssH = this.waveCanvas.clientHeight;
        this.waveCanvas.width = Math.max(1, Math.floor(cssW * dpr));
        this.waveCanvas.height = Math.max(1, Math.floor(cssH * dpr));
        this.waveCanvas.style.width = cssW + 'px'; 
        this.waveCanvas.style.height = cssH + 'px';
        const ctx = this.waveCanvas.getContext("2d") as CanvasRenderingContext2D;

        ctx.clearRect(0, 0, this.waveCanvas.width, this.waveCanvas.height);
        ctx.fillStyle = this.waveformFill;
        ctx.beginPath();
        const N = this.waveformData.length;
        for (let i = 0; i < N; i++) {
            const x = (i / (N - 1)) * this.waveCanvas.width;
            const y = (1 - this.waveformData[i]) * (this.waveCanvas.height * 0.9 * 0.95);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineTo(this.waveCanvas.width, this.waveCanvas.height);
        ctx.lineTo(0, this.waveCanvas.height);
        ctx.closePath(); ctx.fill();
    }

}