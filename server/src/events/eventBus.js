import { EventEmitter } from "node:events";

const eventBus = new EventEmitter();

// Keep default listener limit warning-free for small modular listeners.
eventBus.setMaxListeners(20);

export default eventBus;
