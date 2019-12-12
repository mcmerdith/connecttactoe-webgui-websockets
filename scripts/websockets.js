eventHandler.registerEvent("socket-error", function(e) {
  console.log("Socket Error: ", e);
});

function SocketConnect(port) {
  var self = this;

  self.server = "localhost";
  self.socket = undefined;
  self.ready = false;

  self.send = function(request) {
    self.socket.send(request);
  }

  self.stringToByteArray = function(s) {
    var data = [];
    for (let i = 0; i < s.length; i++) {
      data.push(s.charCodeAt(i));
    }
    console.log(s, data);
    return data;
  }

  self.sendBytes = function() {
    if (arguments.length < 1) return;

    var command = arguments[0];
    var data = [];
    for (let j = 1; j < arguments.length; j++) {
      var d = arguments[j];
      if (typeof d === "string") {
        bytes = self.stringToByteArray(d);
        data.push(bytes);
      } else if (typeof d === "number") {
        data.push(d);
      }
    }

    console.log(data);

    var initializer = new Int8Array(3);
    initializer[0] = command;
    initializer[1] = 0x20;
    initializer[2] = data.length;
    self.send(initializer);

    //console.log("initializer", initializer);

    for (var l = 0; l < data.length; l++) {
      if (Array.isArray(data[l])) {
        var req = new Int8Array(3 + data[l].length);
        req.set(data[l], 3);
        req[2] = 0x30;
      } else {
        var req = new Int8Array(4);
        req[2] = 0x31;
        req[3] = data[l];
      }

      req[0] = command;
      req[1] = 0x21;

      self.send(req);
      //console.log("request", req);
    }
  }

  self.connect = function(port) {
    self.socket = new WebSocket("ws://" + self.server + ":" + port);
    self.socket.binaryType = "arraybuffer";

    self.socket.onopen = function(e) {
      self.ready = true;
      eventHandler.fireEvent("socket-connect", e);
    }

    self.socket.onerror = function(e) {
      eventHandler.fireEvent("socket-error", e);
    }

    self.socket.onclose = function(e) {
      eventHandler.fireEvent("socket-disconnect", e);
    }

    self.socket.onmessage = function(e) {
      if (e.data instanceof ArrayBuffer) {
        eventHandler.fireEvent("socket-byte-buffer-message", e);
      } else {
        eventHandler.fireEvent("socket-message", e);
      }
    };
  }

  self.connect(port);
}
