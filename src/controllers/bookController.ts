import type { BookService } from "../services/bookService.js";

export class BookController {
  private service: BookService;

  constructor(service: BookService) {
    this.service = service;
  }

  getMyBooks = async (httpRequest: any) => {
    try {
      const ownerId = httpRequest.user?.id as string;
      if (!ownerId) {
        return { statusCode: 401, body: { error: "Unauthorized" } };
      }

      const books = await this.service.getMyBooks(ownerId);

      return {
        statusCode: 200,
        body: { books },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch books";
      return { statusCode: 500, body: { error: message } };
    }
  };

  getAllBooks = async (httpRequest: any) => {
    const userId = httpRequest.user?.id as string | undefined;
    if (!userId) return { statusCode: 401, body: { error: "Unauthorized" } };
    try {
      return { statusCode: 200, body: { books: await this.service.getAllBooks(userId) } };
    } catch (error: unknown) {
      return { statusCode: 500, body: { error: error instanceof Error ? error.message : "Failed to fetch books" } };
    }
  };

  createBook = async (httpRequest: any) => {
  try {
    const ownerId = httpRequest.user?.id as string;

    if (!ownerId) {
      return {
        statusCode: 401,
        body: { error: "Unauthorized" },
      };
    }

    const { title, description } = httpRequest.body as {
      title?: string;
      description?: string;
    };

    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return {
        statusCode: 400,
        body: { error: "Title is required" },
      };
    }

    const trimmedDescription = description?.trim();

    const input = {
      title: trimmedTitle,
      ...(trimmedDescription ? { description: trimmedDescription } : {}),
    };

    const book = await this.service.createBook(ownerId, input);

    return {
      statusCode: 201,
      body: {
        message: "Book created successfully",
        book,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create book";

    return {
      statusCode: 500,
      body: { error: message },
    };
  }
};

  deleteBook = async (httpRequest: any) => {
    try {
      const ownerId = httpRequest.user?.id as string;
      if (!ownerId) {
        return { statusCode: 401, body: { error: "Unauthorized" } };
      }

      const { id } = httpRequest.params as { id?: string };
      if (!id) {
        return { statusCode: 400, body: { error: "Book ID is required" } };
      }

      await this.service.deleteBook(id, ownerId);

      return {
        statusCode: 200,
        body: { message: "Book deleted successfully" },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete book";
      return { statusCode: 404, body: { error: message } };
    }
  };

  requestEdit = async (httpRequest: any) => {
    const userId = httpRequest.user?.id as string | undefined;
    if (!userId) return { statusCode: 401, body: { error: "Unauthorized" } };
    try { return { statusCode: 201, body: { request: await this.service.requestEdit(httpRequest.params.id, userId) } }; }
    catch (error: unknown) { return { statusCode: 400, body: { error: error instanceof Error ? error.message : "Unable to request editing" } }; }
  };

  getEditRequests = async (httpRequest: any) => {
    const ownerId = httpRequest.user?.id as string | undefined;
    if (!ownerId) return { statusCode: 401, body: { error: "Unauthorized" } };
    try { return { statusCode: 200, body: { requests: await this.service.getEditRequests(httpRequest.params.id, ownerId) } }; }
    catch (error: unknown) { return { statusCode: 403, body: { error: error instanceof Error ? error.message : "Unable to load edit requests" } }; }
  };

  getPendingEditRequests = async (httpRequest: any) => {
    const ownerId = httpRequest.user?.id as string | undefined;
    if (!ownerId) return { statusCode: 401, body: { error: "Unauthorized" } };
    try { return { statusCode: 200, body: { requests: await this.service.getPendingEditRequests(ownerId) } }; }
    catch (error: unknown) { return { statusCode: 500, body: { error: error instanceof Error ? error.message : "Unable to load notifications" } }; }
  };

  resolveEditRequest = async (httpRequest: any) => {
    const ownerId = httpRequest.user?.id as string | undefined;
    const status = httpRequest.body?.status;
    if (!ownerId) return { statusCode: 401, body: { error: "Unauthorized" } };
    if (status !== "approved" && status !== "rejected") return { statusCode: 400, body: { error: "status must be approved or rejected" } };
    try { return { statusCode: 200, body: { request: await this.service.resolveEditRequest(httpRequest.params.id, httpRequest.params.requestId, ownerId, status) } }; }
    catch (error: unknown) { return { statusCode: 403, body: { error: error instanceof Error ? error.message : "Unable to resolve edit request" } }; }
  };
}
