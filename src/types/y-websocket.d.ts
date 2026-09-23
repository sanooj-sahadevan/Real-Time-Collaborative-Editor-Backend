declare module "y-websocket/bin/utils" {
  export function setupWSConnection(
    connection: import("ws").WebSocket,
    request: import("http").IncomingMessage,
    options?: { docName?: string; gc?: boolean }
  ): void;
}