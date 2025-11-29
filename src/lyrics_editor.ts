import { DomRegistry } from "./dom_registry";
import { EventBus } from "./event_bus";

export class LyricsEditor {
    private eventBus: EventBus;
    
    private mode: LyricsMode;
    
    private lyricsTextbox: HTMLTextAreaElement | null;
    private lyricsWordBoxesContainer: HTMLElement | null;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
        this.mode = LyricsMode.EditingText;
        
        this.lyricsTextbox = null;
        this.lyricsWordBoxesContainer = null;
    }

    attachToDom(domRegistry: DomRegistry) {
        const document = window.document;
        
        let discardButton = domRegistry.lyricsTextDiscard;
    }
}

export enum LyricsMode {
    EditingText,
    DisplayingBoxes,
}