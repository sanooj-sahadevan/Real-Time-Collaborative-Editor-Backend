import Page from "../models/Page.js";
import type { Types } from "mongoose";

export interface CreatePageInput {
  bookId: string | Types.ObjectId;
  title: string;
  order: number;
  createdBy: string | Types.ObjectId;
}

export class PageRepository {
  async create(data: CreatePageInput) {
    return await Page.create(data);
  }

  async findByBook(bookId: string) {
    return await Page.find({ bookId }).sort({ order: 1, createdAt: 1 });
  }

  async findById(pageId: string) {
    return await Page.findById(pageId);
  }

  async update(pageId: string, data: { title?: string; content?: string }) {
    return await Page.findByIdAndUpdate(pageId, data, { new: true, runValidators: true });
  }

  async remove(pageId: string) {
    return await Page.findByIdAndDelete(pageId);
  }

  async reorder(bookId: string, pageIds: string[]) {
    await Promise.all(
      pageIds.map((pageId, order) => Page.updateOne({ _id: pageId, bookId }, { $set: { order } }))
    );
    return await this.findByBook(bookId);
  }
}