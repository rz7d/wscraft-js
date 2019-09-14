"use strict";

const ws = require("ws");
const net = require("net");

const BIND_PORT = 25565;
const TARGET_ADDRESS = "wss://example.com";

function error(header, err) {
    console.log(`[${header}] An error has been occurred`);
    console.log(err);
}

function main() {
    const server = net.createServer(client => {
        console.log("[TCP/IP] A new connection established");
        
        const proxy = new ws(`${TARGET_ADDRESS}`);
        console.log("[WebSocket] Connecting...");
        proxy.on("open", () => {
            console.log("[WebSocket] Connected");
            client.on("data", msg => proxy.send(msg));
        });
        proxy.on("message", msg => client.write(msg));
        proxy.on("error", err => error("WebSocket", err));
        proxy.on("close", () => {
            console.log("[WebSocket] Disconnected");
            client.end();
        });

        client.on("error", err => error("TCP/IP", err));
        client.on("close", () => {
            console.log("[TCP/IP] Connection closed");
            proxy.close();
        });
    });
    server.listen(BIND_PORT);

    console.log(`Starting TCP server on port ${BIND_PORT}`);
    console.log(`Bridging to ${TARGET_ADDRESS}`);
}

main();
