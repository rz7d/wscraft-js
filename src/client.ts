/*
  Copyright (C) 2019 azure.

  This file is part of wscraft-js.

  wscraft-js is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  wscraft-js is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with wscraft-js.  If not, see <http://www.gnu.org/licenses/>.
*/
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
