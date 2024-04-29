const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });
  socket.on("data", (data) => {
    const socketData = data.toString();
    const [method, path, httpVersion] = socketData.split("\n")[0].split(" ");
    if (path == "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.startsWith("/echo")) {
      const randomString = path.substring(6);
      let responseBody = "HTTP/1.1 200 OK\r\n";
      responseBody += "Content-type: text/plain\r\n";
      responseBody += `Content-length: ${randomString.length}\r\n\r\n`;
      responseBody += `${randomString}\r\n\r\n`;
      socket.write(responseBody);
    } else if (path == "/user-agent") {
      const userAgent = socketData.split("\r\n")[3].split(":")[1].trim();
      let responseBody = "HTTP/1.1 200 OK\r\n";
      responseBody += "Content-Type: text/plain\r\n";
      responseBody += `Content-Length: ${userAgent.length}\r\n`;
      responseBody += `${userAgent}\r\n`;
      socket.write(responseBody);
    } else {
      socket.write("HTTP/1.1 404 NOT FOUND\r\n\r\n");
    }
  });
});

server.listen(4221, "localhost");
