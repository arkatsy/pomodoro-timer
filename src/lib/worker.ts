self.addEventListener("message", (evt) => {
  let id: NodeJS.Timeout | null = null;

  switch (evt.data.type) {
    case "START": {
      if (id) {
        clearInterval(id);
      }

      function tick() {
        self.postMessage({ type: "TICK" });
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
