// Dead simple DDD-like event bus

export enum EventType {
    AudioTimeChange,
}

export class EventBus {
    private listeners: Map<EventType, Array<Listener>>;
    private sealed: boolean;

    constructor(){
        this.listeners = new Map();
        this.sealed = false;
    }
    
    emit(event: AppEvent){
        let type = event.type();
        if (!this.listeners.has(type)) {
            return;
        }

        let listeners: Array<Listener> = this.listeners.get(type) || [];

        for (let listener of listeners) {
            listener.eventOccurred(event);
        }
    }
    
    register(eventType: EventType, listener: Listener) {
        if (this.sealed) {
            throw new Error("Blocked attempt to register listener to a sealed event bus");
        }

        if (!this.listeners.has(eventType))
            this.listeners.set(eventType, []);
            
        this.listeners.get(eventType)?.push(listener);
    }
    
    seal() {
        this.sealed = true;
    }
}

export interface Listener {
    eventOccurred(event: AppEvent): void;
}

export interface AppEvent {
    type(): EventType;
}

export class AudioTimeChangeEvent implements AppEvent {
    public currentTime: number;
    
    constructor(currentTime: number) {
        this.currentTime = currentTime;
    }

    type(): EventType {
        return EventType.AudioTimeChange;
    }
}