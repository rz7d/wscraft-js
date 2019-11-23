# wscraft-js

"TCP over WebSocket" proxy program.  
Since version 2.0.0, all sources were rewritten using TypeScript.

## How to use

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
