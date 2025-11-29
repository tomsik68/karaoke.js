// Entry point

import { Application } from "./application";
import { DomRegistry } from "./dom_registry";
import { EventBus } from "./event_bus";

// When the DOM is ready, you can wire things up
window.addEventListener('DOMContentLoaded', () => {
    const domRegistry = new DomRegistry(window.document);
    const eventBus = new EventBus();
    const app = new Application(eventBus, domRegistry);
    eventBus.seal();
});