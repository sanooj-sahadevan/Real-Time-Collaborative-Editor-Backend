import Book from "../models/Book.js";
import type { PageRepository } from "../repositories/pageRepository.js";

export class PageService {
  constructor(private readonly repository: PageRepository) {}

  private async assertMember(bookId: string, userId: string) {
    const book = await Book.findOne({
      _id: bookId,
      $or: [{ ownerId: userId }, { collaborators: userId }, { isPublished: true }],
    });
    if (!book) throw new Error("Book not found or you do not have access");
    return book;
  }

  private async assertEditor(bookId: string, userId: string) {
    const book = await this.assertMember(bookId, userId);
    const isOwner = book.ownerId.toString() === userId;
    const isEditor = book.editors.some((id: { toString: () => string }) => id.toString() === userId);
    if (!isOwner && !isEditor) throw new Error("Editing permission has not been approved");
    return book;
  }

  async list(bookId: string, userId: string) {
    const book = await this.assertMember(bookId, userId);
    const isOwner = book.ownerId.toString() === userId;
    const canEdit = isOwner || book.editors.some((id: { toString: () => string }) => id.toString() === userId);
    const editRequest = book.editRequests.find((request: { userId: { toString: () => string } }) => request.userId.toString() === userId);
    await book.populate("collaborators", "username email");
    await book.populate("editors", "username email");
    return {
      pages: await this.repository.findByBook(bookId),
      book: { _id: book.id, title: book.title, ownerId: book.ownerId.toString(), collaborators: book.collaborators, editors: book.editors, canEdit, isPublished: book.isPublished === true, editRequestStatus: editRequest?.status ?? null },
    };
  }

  async get(pageId: string, userId: string) {
    const page = await this.repository.findById(pageId);
    if (!page) throw new Error("Page not found");
    await this.assertMember(page.bookId.toString(), userId);
    return page;
  }

  async create(bookId: string, userId: string, title: string) {
    await this.assertEditor(bookId, userId);
    const pages = await this.repository.findByBook(bookId);
    return await this.repository.create({ bookId, title, order: pages.length, createdBy: userId });
  }

  async update(pageId: string, userId: string, data: { title?: string; content?: string }) {
    const page = await this.get(pageId, userId);
    await this.assertEditor(page.bookId.toString(), userId);
    const updated = await this.repository.update(pageId, data);
    if (!updated) throw new Error("Page not found");
    return updated;
  }

  async remove(pageId: string, userId: string) {
    const page = await this.get(pageId, userId);
    await this.assertEditor(page.bookId.toString(), userId);
    const deleted = await this.repository.remove(pageId);
    if (!deleted) throw new Error("Page not found");
    const pages = await this.repository.findByBook(page.bookId.toString());
    return await this.repository.reorder(page.bookId.toString(), pages.filter((item) => item.id !== pageId).map((item) => item.id));
  }

  async reorder(bookId: string, userId: string, pageIds: string[]) {
    await this.assertEditor(bookId, userId);
    const pages = await this.repository.findByBook(bookId);
    const knownIds = new Set(pages.map((page) => page.id));
    if (pageIds.length !== pages.length || pageIds.some((id) => !knownIds.has(id))) {
      throw new Error("Invalid page order");
    }
    return await this.repository.reorder(bookId, pageIds);
  }
}