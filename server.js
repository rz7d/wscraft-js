"use strict";

const ws = require("ws");
const net = require("net");

const BIND_PORT = 80;
const TARGET_ADDRESS = "127.0.0.1";
const TARGET_PORT = 25565;

function error(header, err) {
    console.log(`[${header}] An error has been occurred`);
    console.log(err);
}

function main() {
    const server = new ws.Server({ port: BIND_PORT });
    server.on("connection", client => {
        console.log("[WebSocket] A new connection established");
        client.on("error", err => error("WebSocket", err));

        const proxy = new net.Socket();
        proxy.setNoDelay(true);
        proxy.on("error", err => error("TCP/IP", err));
        proxy.on("data", data => client.send(data));
        proxy.on("close", () => {
            console.log("[TCP/IP] Disconnected");
            client.close();
        });
        proxy.connect(TARGET_PORT, TARGET_ADDRESS, () => {
            console.log("[TCP/IP] Connected");
        });

        client.on("message", msg => proxy.write(msg));
        client.on("close", () => {
            console.log("[WebSocket] Connection closed");
            proxy.end();
        });
    });

    console.log(`Starting WebSocket server on port ${BIND_PORT}`);
    console.log(`Bridging to ${TARGET_ADDRESS}:${TARGET_PORT}`);
}

main();
