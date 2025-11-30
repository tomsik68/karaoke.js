// Dead simple DDD-like event bus

enum EventType {
    AudioPlayback,
    UserSeekRequest,
    AudioFileChange,
}

export class EventBus {
    private listeners: Map<EventType, Array<Listener<AppEvent>>>;
    private sealed: boolean;

    constructor(){
        this.listeners = new Map();
        this.sealed = false;
    }
    
    emit<E extends AppEvent>(event: E){
        console.log(event);
        let type = event.type();
        if (!this.listeners.has(type)) {
            return;
        }

        let listeners: Array<Listener<E>> = this.listeners.get(type) || [];

        for (let listener of listeners) {
            listener(event);
        }
    }
    
    register<E extends AppEvent>(prototype: E, listener: Listener<E>) {
        const eventType = prototype.type();
        if (this.sealed) {
            throw new Error("Blocked attempt to register listener to a sealed event bus");
        }

        if (!this.listeners.has(eventType))
            this.listeners.set(eventType, []);
            
        this.listeners.get(eventType)?.push(listener as Listener<AppEvent>);
    }
    
    seal() {
        this.sealed = true;
    }
}
type Listener<E extends AppEvent> = (event: E) => void;

export interface AppEvent {
    type(): EventType;
}

export class AudioPlaybackEvent implements AppEvent {
    public currentTime: number;
    public duration: number;
    
    constructor(currentTime: number, duration: number) {
        this.currentTime = currentTime;
        this.duration = duration;
    }

    type(): EventType {
        return EventType.AudioPlayback;
    }
}

export class UserSeekRequest implements AppEvent {
    public seekPercentage: number;
    
    constructor(seekPercentage: number) {
        this.seekPercentage = seekPercentage;
    }

    type(): EventType {
        return EventType.UserSeekRequest;
    }
}

export class AudioFileChange implements AppEvent {
    public newAudioFile: string;
    
    constructor(newAudioFile: string) {
        this.newAudioFile = newAudioFile;
    }

    type(): EventType {
        return EventType.AudioFileChange;
    }

}