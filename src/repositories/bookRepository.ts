import Book from "../models/Book.js";
import type { Types } from "mongoose";

export interface CreateBookInput {
  title: string;
  description?: string;
  ownerId: string | Types.ObjectId;
}

export interface IBookRepository {
  createBook(data: CreateBookInput): Promise<any>;
  getBooksByOwner(ownerId: string): Promise<any[]>;
  getAllBooks(): Promise<any[]>;
  getBookById(id: string): Promise<any>;
  deleteBook(id: string, ownerId: string): Promise<any>;
}

export class BookRepository implements IBookRepository {
  async createBook(data: CreateBookInput): Promise<any> {
    const book = new Book(data);
    return await book.save();
  }

  async getBooksByOwner(ownerId: string): Promise<any[]> {
    return await Book.find({ ownerId }).sort({ createdAt: -1 });
  }

  async getAllBooks(): Promise<any[]> {
    return await Book.find({}).populate("ownerId", "username").populate("collaborators", "username email").sort({ createdAt: -1 });
  }

  async getBookById(id: string): Promise<any> {
    return await Book.findById(id);
  }

  async deleteBook(id: string, ownerId: string): Promise<any> {
    return await Book.findOneAndDelete({ _id: id, ownerId });
  }
}
