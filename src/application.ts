// Complete application aggregate

import { AudioPlayer } from "./audio_player";
import { DomRegistry } from "./dom_registry";
import { EventBus } from "./event_bus";
import { LyricsEditor } from "./lyrics_editor";

export class Application {
    private eventBus: EventBus;

    private audioPlayer: AudioPlayer;
    private lyricsEditor: LyricsEditor;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
        this.audioPlayer = new AudioPlayer(eventBus);
        this.lyricsEditor = new LyricsEditor(eventBus);
    }

    attachToDom(domRegistry: DomRegistry) {
        this.audioPlayer.attachToDom(domRegistry);
        this.lyricsEditor.attachToDom(domRegistry);
    }
}