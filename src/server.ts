import ws from "ws";
import { Socket } from "net";
import { SocketAddress, BridgeConnector, logger } from "./common";

export class ServerConnector implements BridgeConnector {
  connect(inbound: SocketAddress, outbound: SocketAddress) {
    const server = new ws.Server({ host: inbound.address, port: inbound.port });
    server.on("connection", downstream => {
      logger.info("Detected a new downstream connection.");
      downstream.on("error", err => logger.error(err));

      const upstream = new Socket();
      upstream.setNoDelay(true);
      upstream.on("error", err => logger.error(err));
      upstream.on("data", data => downstream.send(data));
      upstream.on("close", () => {
        logger.info("[Upstream] Disconnected");
        downstream.close();
      });

      upstream.connect({ host: outbound.address, port: outbound.port }, () => {
        logger.info("[Upstream] Connected");
      });

      downstream.on("message", msg => {
        if (typeof msg == "string" || msg instanceof Buffer) {
          upstream.write(msg);
        }
      });

      downstream.on("close", () => {
        logger.info("[Downstream] Connection closed");
        upstream.end();
      });
    });

    logger.info(
      `Starting WebSocket server on ${inbound.address || "localhost"}:${
        inbound.port
      }`
    );
    logger.info(`Bridging to ${outbound.address}:${outbound.port}`);
  }
}
