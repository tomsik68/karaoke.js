// Entry point

import { Application } from "./application";
import { DomRegistry } from "./dom_registry";
import { EventBus } from "./event_bus";

const app = new Application(new EventBus());

// When the DOM is ready, you can wire things up
window.addEventListener('DOMContentLoaded', ()=>{
    const dom_registry = new DomRegistry(window.document);
    app.attachToDom(dom_registry);
});