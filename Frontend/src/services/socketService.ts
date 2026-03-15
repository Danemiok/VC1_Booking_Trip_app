/**
 * Stub socket service.
 * Replace with a real WebSocket client (socket.io, ws, etc.) when needed.
 */

type EventHandler = (...args: any[]) => void;

class SocketServiceStub {
  private listeners = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(handler => handler(...args));
    }
  }

  connect(): SocketServiceStub {
    return this;
  }

  getSocket(): SocketServiceStub {
    return this;
  }

  disconnect(): void {
    // Stub: no-op
  }
}

export const socketService = new SocketServiceStub();
