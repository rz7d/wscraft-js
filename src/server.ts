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
import { Socket } from "net";
import { SocketAddress, BridgeConnector, logger } from "./common";

export class ServerConnector implements BridgeConnector {
  connect(inbound: SocketAddress, outbound: SocketAddress) {
    const server = new ws.Server({ host: inbound.address, port: inbound.port });
    server.on("connection", downstream => {
      logger.info("A new downstream connection established.");
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
      `Starting WebSocket server on ${inbound.address || "0.0.0.0"}:${
        inbound.port
      }`
    );
    logger.info(`Bridging to ${outbound.address}:${outbound.port}`);
  }
}
