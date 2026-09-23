import type { PageService } from "../services/pageService.js";

export class PageController {
  constructor(private readonly service: PageService) {}

  private userId(request: any) {
    return request.user?.id as string | undefined;
  }

  list = async (request: any) => {
    const userId = this.userId(request);
    if (!userId) return { statusCode: 401, body: { error: "Unauthorized" } };
    try { return { statusCode: 200, body: await this.service.list(request.params.bookId, userId) }; }
    catch (error: unknown) { return this.error(error); }
  };

  get = async (request: any) => {
    const userId = this.userId(request);
    if (!userId) return { statusCode: 401, body: { error: "Unauthorized" } };
    try { return { statusCode: 200, body: { page: await this.service.get(request.params.pageId, userId) } }; }
    catch (error: unknown) { return this.error(error); }
  };

  create = async (request: any) => {
    const userId = this.userId(request);
    if (!userId) return { statusCode: 401, body: { error: "Unauthorized" } };
    const title = typeof request.body?.title === "string" ? request.body.title.trim() : "";
    if (!title) return { statusCode: 400, body: { error: "Title is required" } };
    try { return { statusCode: 201, body: { page: await this.service.create(request.params.bookId, userId, title) } }; }
    catch (error: unknown) { return this.error(error); }
  };

  update = async (request: any) => {
    const userId = this.userId(request);
    if (!userId) return { statusCode: 401, body: { error: "Unauthorized" } };
    const data: { title?: string; content?: string } = {};
    if (typeof request.body?.title === "string") data.title = request.body.title.trim();
    if (typeof request.body?.content === "string") data.content = request.body.content;
    try { return { statusCode: 200, body: { page: await this.service.update(request.params.pageId, userId, data) } }; }
    catch (error: unknown) { return this.error(error); }
  };

  remove = async (request: any) => {
    const userId = this.userId(request);
    if (!userId) return { statusCode: 401, body: { error: "Unauthorized" } };
    try { return { statusCode: 200, body: { pages: await this.service.remove(request.params.pageId, userId) } }; }
    catch (error: unknown) { return this.error(error); }
  };

  reorder = async (request: any) => {
    const userId = this.userId(request);
    if (!userId) return { statusCode: 401, body: { error: "Unauthorized" } };
    if (!Array.isArray(request.body?.pageIds) || request.body.pageIds.some((id: unknown) => typeof id !== "string")) {
      return { statusCode: 400, body: { error: "pageIds must be an array of strings" } };
    }
    try { return { statusCode: 200, body: { pages: await this.service.reorder(request.params.bookId, userId, request.body.pageIds) } }; }
    catch (error: unknown) { return this.error(error); }
  };

  private error(error: unknown) {
    const message = error instanceof Error ? error.message : "Page request failed";
    return { statusCode: message.includes("not found") || message.includes("access") ? 404 : 400, body: { error: message } };
  }
}