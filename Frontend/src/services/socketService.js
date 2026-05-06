/**
 * Stub socket service.
 * Replace with a real WebSocket client (socket.io, ws, etc.) when needed.
 */
class SocketServiceStub {
    constructor() {
        this.listeners = new Map();
    }
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
    }
    off(event, handler) {
        const set = this.listeners.get(event);
        if (set) {
            set.delete(handler);
            if (set.size === 0) {
                this.listeners.delete(event);
            }
        }
    }
    emit(event, ...args) {
        const set = this.listeners.get(event);
        if (set) {
            set.forEach(handler => handler(...args));
        }
    }
    connect() {
        return this;
    }
    getSocket() {
        return this;
    }
    disconnect() {
        // Stub: no-op
    }
}
export const socketService = new SocketServiceStub();
