const net = require("net");
const fs = require("fs");
const path = require("path");

let DIRECTORY = __dirname;
process.argv.forEach((val, index) => {
  if (val === "--directory" && process.argv[index + 1]) {
    DIRECTORY = process.argv[index + 1];
  }
});
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const LINE_TERMINATOR = "\r\n";
const END = LINE_TERMINATOR + LINE_TERMINATOR;
const OK_RESPONSE = "HTTP/1.1 200 OK";
// Uncomment this to pass the first stage
const server = net.createServer({ keepAlive: true }, (socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });
  socket.on("data", (data) => {
    const [startLine, ...rest] = String(data).split(LINE_TERMINATOR);
    const [method, path, protocol] = startLine.split(" ");
    const headers = rest.reduce((acc, line) => {
      const [k, v] = line.split(": ", 2);
      acc[k] = v;
      return acc;
    }, {});
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.includes("/echo/")) {
      const stringToEcho = path.replace("/echo/", "");
      let response =
        `${OK_RESPONSE}${LINE_TERMINATOR}` +
        `Content-Type: text/plain${LINE_TERMINATOR}` +
        `Content-Length: ${stringToEcho.length}` +
        END +
        stringToEcho;
      response = buildStringResponse(stringToEcho, "text/plain");
      console.log(response);
      socket.write(response);
    } else if (path.includes("/user-agent")) {
      const userAgent = headers["User-Agent"];
      const response = buildStringResponse(userAgent, "text/plain");
      socket.write(response);
    } else if (path.includes("/files/")) {
      const fileName = path.split("/").filter((value) => !!value)[1];
      const filePath = DIRECTORY + fileName;
      if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, { encoding: "utf8" });

        socket.write(
          buildStringResponse(fileContents, "application/octet-stream")
        );
      } else {
        socket.write("HTTP/1.1 404 NOT FOUND\r\n\r\n");
      }
    } else {
      socket.write("HTTP/1.1 404 NOT FOUND\r\n\r\n");
    }
    socket.end();
  });
});
const buildStringResponse = (stringResp, contentType) => {
  return (
    `${OK_RESPONSE}${LINE_TERMINATOR}` +
    `Content-Type: ${contentType}${LINE_TERMINATOR}` +
    `Content-Length: ${stringResp.length}` +
    END +
    stringResp
  );
};
server.listen(4221, "localhost");
