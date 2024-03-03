// TODO: Remove the duplication of types from ./time-worker.ts (issue with importing types)
type ResponseAction = {
  type: "TICK";
};

type RequestAction = {
  type: "START" | "STOP";
};

let id: NodeJS.Timeout | null = null;

self.addEventListener("message", (evt: MessageEvent<RequestAction>) => {
  switch (evt.data.type) {
    case "START": {
      if (id) {
        clearInterval(id);
      }

      function tick() {
        self.postMessage({ type: "TICK" } as ResponseAction);
      }

      id = setInterval(tick, 1000);
      break;
    }
    case "STOP": {
      if (id) {
        clearInterval(id);
      }
      break;
    }
    default: {
      console.warn(`Unknown message type: ${evt.data.type}`);
    }
  }
});
