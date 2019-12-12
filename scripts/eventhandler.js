var eventHandler = new EventHandler();

function EventHandler() {
  var self = this;

  self.events = new Map();

  self.registerEvent = function(event, handler) {
    let cEvent = self.events.get(event);

    if (!cEvent) {
      cEvent = new Array(handler);
      self.events.set(event, cEvent);
    } else {
      cEvent.push(handler);
    }
  }

  self.fireEvent = function(event, args) {
    let handlers = self.events.get(event);

    if (handlers) {
      for (let i = 0; i < handlers.length; i++) {
        let h = handlers[i];
        h(args);
      }
    }
  }
}

eventHandler.registerEvent("socket-error", function(e) {
  console.log("Socket Error: ", e);
});

eventHandler.registerEvent("error", function(e) {
  console.error(e);
});

eventHandler.registerEvent("warning", function(e) {
  console.warn(e);
});
