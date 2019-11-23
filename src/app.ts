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
import getopt from "node-getopt";
import { SocketAddress, BridgeConnector, logger } from "./common";
import { ClientConnector } from "./client";
import { ServerConnector } from "./server";

interface ConnectorMap {
  [key: string]: () => BridgeConnector;
}

const connectorMap: ConnectorMap = {
  client: () => new ClientConnector(),
  server: () => new ServerConnector()
};

const parser = getopt
  .create([
    [
      "m",
      `mode=<${Object.keys(connectorMap).join("|")}>`,
      "run with specified mode"
    ],
    ["i", "inbound=<(address:)port>", "inbound address (address:port)"],
    ["o", "outbound=<(address:)port>", "outbound address (address:port)"]
  ])
  .bindHelp();

interface LaunchOption {
  mode: string;
  inbound: string;
  outbound: string;
}

function main(): number {
  const options = (parser.parseSystem().options as unknown) as LaunchOption;

  function addr(x: string): SocketAddress {
    if (x.indexOf(":") == -1) {
      // port only; ex: -i 8080 -o 25565
      return { port: parseInt(x), address: undefined };
    } else {
      // full spec; ex: -i localhost:8080 -o localhost:25565
      const split = x.split(":");
      return { port: parseInt(split[1]), address: split[0] };
    }
  }

  const mode = options.mode;
  const inbound = addr(options.inbound);
  const outbound = addr(options.outbound);

  const connector = connectorMap[mode];
  if (connector) {
    connector().connect(inbound, outbound);
  } else {
    logger.error(`Invalid mode: ${mode}`);
    parser.showHelp();
    return 2;
  }

  return 0;
}

const result = main();
if (result != 0) process.exit(result);
