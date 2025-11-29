// Auto-generated DOM registry
export class DomRegistry {
  editor: HTMLDivElement;
  audioFile: HTMLInputElement;
  speedSelect: HTMLSelectElement;
  audio: HTMLAudioElement;
  waveToggle: HTMLInputElement;
  waveformWrap: HTMLDivElement;
  waveCanvas: HTMLCanvasElement;
  waveformLoading: HTMLDivElement;
  linesCard: HTMLDivElement;
  viewport: HTMLDivElement;
  lyricsAsText: HTMLDivElement;
  lyricsText: HTMLTextAreaElement;
  lyricsTextSave: HTMLDivElement;
  lyricsTextDiscard: HTMLDivElement;
  lyricsWordBoxes: HTMLDivElement;
  exportBox: HTMLTextAreaElement;
  exportJSON: HTMLButtonElement;
  importJSON: HTMLButtonElement;

  constructor(private root: Document) {
    this.editor = root.getElementById("editor") as HTMLDivElement;
    this.audioFile = root.getElementById("audioFile") as HTMLInputElement;
    this.speedSelect = root.getElementById("speedSelect") as HTMLSelectElement;
    this.audio = root.getElementById("audio") as HTMLAudioElement;
    this.waveToggle = root.getElementById("waveToggle") as HTMLInputElement;
    this.waveformWrap = root.getElementById("waveformWrap") as HTMLDivElement;
    this.waveCanvas = root.getElementById("waveCanvas") as HTMLCanvasElement;
    this.waveformLoading = root.getElementById("waveformLoading") as HTMLDivElement;
    this.linesCard = root.getElementById("linesCard") as HTMLDivElement;
    this.viewport = root.getElementById("viewport") as HTMLDivElement;
    this.lyricsAsText = root.getElementById("lyricsAsText") as HTMLDivElement;
    this.lyricsText = root.getElementById("lyricsText") as HTMLTextAreaElement;
    this.lyricsTextSave = root.getElementById("lyricsTextSave") as HTMLDivElement;
    this.lyricsTextDiscard = root.getElementById("lyricsTextDiscard") as HTMLDivElement;
    this.lyricsWordBoxes = root.getElementById("lyricsWordBoxes") as HTMLDivElement;
    this.exportBox = root.getElementById("exportBox") as HTMLTextAreaElement;
    this.exportJSON = root.getElementById("exportJSON") as HTMLButtonElement;
    this.importJSON = root.getElementById("importJSON") as HTMLButtonElement;
  }
}
