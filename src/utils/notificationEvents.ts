type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeToNotificationEvents(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitNotificationEvent() {
  listeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.log('Notification event listener failed', error);
    }
  });
}
