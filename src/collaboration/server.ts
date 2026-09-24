import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { setupWSConnection } from "y-websocket/bin/utils";
import Book from "../models/Book.js";
import Page from "../models/Page.js";
import User from "../models/User.js";
import { JWT_SECRET } from "../utils/constants.js";

const roomPattern = /^\/book-([a-f\d]{24})-page-([a-f\d]{24})/i;

export const startCollaborationServer = (port: number) => {
  const server = new WebSocketServer({ port });
  server.on("connection", async (connection, request) => {
    const requestUrl = request.url || "/";
    const pendingMessages: Buffer[] = [];
    const bufferMessage = (message: Buffer) => pendingMessages.push(message);
    connection.on("message", bufferMessage);
    try {
      const url = new URL(requestUrl, `http://${request.headers.host || "localhost"}`);
      const match = roomPattern.exec(url.pathname);
      const token = url.searchParams.get("token");
      if (!match || !token) {
        console.warn(`[collaboration] rejected websocket request: invalid room or missing token`);
        return connection.close(1008, "Unauthorized");
      }
      const bookId = match[1];
      const pageId = match[2];
      if (!bookId || !pageId) {
        console.warn(`[collaboration] rejected websocket request: invalid room ids`);
        return connection.close(1008, "Unauthorized");
      }
      const decoded = jwt.verify(token, JWT_SECRET()) as { id?: string };
      if (!decoded.id) {
        console.warn(`[collaboration] rejected websocket request: token has no user id`);
        return connection.close(1008, "Unauthorized");
      }
      const page = await Page.findOne({ _id: pageId, bookId }).lean();
      const book = await Book.findOne({ _id: bookId, $or: [{ ownerId: decoded.id }, { collaborators: decoded.id }, { isPublished: true }] }).lean();
      if (!page || !book) {
        console.warn(`[collaboration] rejected websocket request: page or book access denied for user ${decoded.id}`);
        return connection.close(1008, "Forbidden");
      }
      const canEdit = book.ownerId.toString() === decoded.id || book.editors.some((id) => id.toString() === decoded.id);
      const user = await User.findById(decoded.id).select("username").lean();
      if (!user) {
        console.warn(`[collaboration] rejected websocket request: user not found for ${decoded.id}`);
        return connection.close(1008, "Unauthorized");
      }
      connection.removeListener("message", bufferMessage);
      setupWSConnection(connection, request, { gc: true });
      pendingMessages.forEach((message) => connection.emit("message", message));
    } catch (error) {
      connection.removeListener("message", bufferMessage);
      console.error(`[collaboration] websocket authorization failed`, error);
      connection.close(1008, "Unauthorized");
    }
  });
  console.log(`Collaboration server started on port ${port}`);
};