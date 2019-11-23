import ws from "ws";
import { createServer } from "net";
import { SocketAddress, BridgeConnector, logger } from "./common";

export class ClientConnector implements BridgeConnector {
  connect(inbound: SocketAddress, outbound: SocketAddress) {
    const destination = (outbound.address || "localhost") + ":" + outbound.port;
    const server = createServer(downstream => {
      logger.info("Detected a new downstream connection.");
      downstream.on("error", err => logger.error(err));

      const upstream = new ws(destination);
      upstream.on("open", () => {
        logger.info("[Upstream] Connected");
      });
      upstream.on("error", err => logger.error(err));
      upstream.on("message", msg => {
        if (typeof msg == "string" || msg instanceof Buffer) {
          downstream.write(msg);
        }
      });
      upstream.on("close", () => {
        logger.info("[Upstream] Disconnected");
        downstream.end();
      });

      downstream.on("data", data => upstream.send(data));
      downstream.on("close", () => {
        logger.info("[Downstream] Connection closed");
        upstream.close();
      });
    });
    server.listen(inbound.port, inbound.address);
    logger.info(
      `Starting TCP/IP server on ${inbound.address || "localhost"}:${
        inbound.port
      }`
    );
    logger.info(`Bridging to ${destination}`);
  }
}
