import type { IBookRepository, CreateBookInput } from "../repositories/bookRepository.js";
import Book from "../models/Book.js";

export class BookService {
  private repository: IBookRepository;

  constructor(repository: IBookRepository) {
    this.repository = repository;
  }

  async createBook(ownerId: string, data: Omit<CreateBookInput, "ownerId">) {
    return await this.repository.createBook({ ...data, ownerId });
  }

  async getMyBooks(ownerId: string) {
    return await this.repository.getBooksByOwner(ownerId);
  }

  async getAllBooks(userId: string) {
    const books = await this.repository.getAllBooks();
    return books.map((book) => {
      const owner = book.ownerId as { _id?: { toString: () => string }; username?: string };
      const ownerId = owner._id?.toString() ?? book.ownerId.toString();
      const isOwner = ownerId === userId;
      const isEditor = book.editors.some((id: { toString: () => string }) => id.toString() === userId);
      const request = book.editRequests.find((item: { userId: { toString: () => string } }) => item.userId.toString() === userId);
      return {
        ...book.toObject(),
        ownerId,
        ownerName: owner.username ?? "Unknown author",
        collaborators: book.collaborators.map((collaborator: { _id?: { toString: () => string }; username?: string; email?: string }) => ({
          _id: collaborator._id?.toString() ?? "",
          username: collaborator.username ?? "Collaborator",
          email: collaborator.email ?? "",
        })),
        canEdit: isOwner || isEditor,
        editRequestStatus: request?.status ?? null,
      };
    });
  }

  async deleteBook(bookId: string, ownerId: string) {
    const deleted = await this.repository.deleteBook(bookId, ownerId);
    if (!deleted) {
      throw new Error("Book not found or you are not the owner");
    }
    return deleted;
  }

  async requestEdit(bookId: string, userId: string) {
    const book = await this.repository.getBookById(bookId);
    if (!book) throw new Error("Book not found");
    if (book.ownerId.toString() === userId || book.editors.some((id: { toString: () => string }) => id.toString() === userId)) {
      throw new Error("You already have editing permission");
    }
    const existing = book.editRequests.find((request: { userId: { toString: () => string }; status: string }) => request.userId.toString() === userId && request.status === "pending");
    if (existing) return existing;
    book.editRequests.push({ userId, status: "pending", requestedAt: new Date() });
    await book.save();
    return book.editRequests[book.editRequests.length - 1];
  }

  async getEditRequests(bookId: string, ownerId: string) {
    const book = await this.repository.getBookById(bookId);
    if (!book || book.ownerId.toString() !== ownerId) throw new Error("Book not found or you are not the owner");
    await book.populate("editRequests.userId", "username email");
    return book.editRequests;
  }

  async getPendingEditRequests(ownerId: string) {
    const books = await Book.find({ ownerId }).populate("editRequests.userId", "username email").select("title editRequests");
    return books.flatMap((book) => book.editRequests
      .filter((request: { status: string }) => request.status === "pending")
      .map((request) => ({ ...request.toObject(), bookId: book.id, bookTitle: book.title })));
  }

  async resolveEditRequest(bookId: string, requestId: string, ownerId: string, status: "approved" | "rejected") {
    const book = await this.repository.getBookById(bookId);
    if (!book || book.ownerId.toString() !== ownerId) throw new Error("Book not found or you are not the owner");
    const request = book.editRequests.id(requestId);
    if (!request) throw new Error("Edit request not found");
    request.status = status;
    request.resolvedAt = new Date();
    if (status === "approved" && !book.editors.some((id: { toString: () => string }) => id.toString() === request.userId.toString())) {
      book.editors.push(request.userId);
    }
    if (status === "approved" && !book.collaborators.some((id: { toString: () => string }) => id.toString() === request.userId.toString())) {
      book.collaborators.push(request.userId);
    }
    await book.save();
    return request;
  }
}
