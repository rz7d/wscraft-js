import * as log4js from "log4js";

export interface SocketAddress {
  port: number;
  address: string | undefined;
}

export interface BridgeConnector {
  connect(inbound: SocketAddress, outbound: SocketAddress): void;
}

export const logger = log4js.getLogger();
logger.level = "debug";
