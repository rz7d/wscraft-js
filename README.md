# wscraft-js

"TCP over WebSocket" proxy program.  
Since version 2.0.0, all sources were rewritten using TypeScript.

## How to use (Using npm)

```
$ npm -g i @rz7/wscraft2
$ wscraft --mode server -i 80 -o localhost:25565 # Server
$ wscraft --mode client -i 25565 -o ws://craft.example.com # Client
```

## How to use (Build from source)

Service Provider:

```
$ yarn
$ yarn run start --mode server -i 80 -o localhost:25565
```

End User:

```
$ yarn
$ yarn run start --mode client -i 25565 -o ws://craft.example.com
```
