type ResponseAction = {
  type: "TICK";
};

type RequestAction = {
  type: "START" | "STOP";
};

type Callback = () => void;

class TimeWorker {
  static instance: TimeWorker | null = null;
  private worker = new Worker(new URL("./_worker.ts", import.meta.url));
  private listeners = new Set<Callback>();

  private postMessage(action: RequestAction) {
    this.worker.postMessage(action);
  }

  constructor() {
    if (TimeWorker.instance) {
      return TimeWorker.instance;
    }

    TimeWorker.instance = this;

    this.worker.addEventListener("message", (e: MessageEvent<ResponseAction>) => {
      if (e.data.type === "TICK") {
        this.listeners.forEach((cb) => cb());
      }
    });
  }

  start() {
    this.postMessage({ type: "START" });
  }

  stop() {
    this.postMessage({ type: "STOP" });
  }

  subscribe(cb: Callback) {
    this.listeners.add(cb);
  }

  unsubscribe(cb: Callback) {
    this.listeners.delete(cb);
  }
}

const worker = Object.freeze(new TimeWorker());

export default worker;
