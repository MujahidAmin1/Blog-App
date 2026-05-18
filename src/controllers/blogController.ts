import type { NextFunction, Response } from "express";
import Blog from "../models/blog";
import type { AuthRequest } from "../middleware/auth";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";
import {
  CreateBlogInput,
  PaginationInput,
  UpdateBlogInput,
} from "../validation/schemas";


export async function createBlog(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, content } = req.body as CreateBlogInput;
    const blogData: any = {
      title,
      content,
      author: req.userId,
    };
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, "blogs");
      blogData.imageUrl = imageUrl;
    }
    const blog = await Blog.create(blogData);
    return res.status(200).json({ blog });
  } catch (error) {
    // return res.status(500).json({ message: "Failed to create blog" });
    next(error);
    // passing error into next() sends it to errorHandler
    // no more res.status(500).json(...) here
  }
}
export async function listBlogs(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, limit } = req.query as unknown as PaginationInput;
    // req.query is typed as ParsedQs by Express
    // after Zod's validate middleware runs, the values are
    // already numbers (transform converted them)
    // "as unknown as PaginationInput" lets TypeScript accept this
    const skip = (page - 1) * 10;
    const [blogs, total] = await Promise.all([
      //              ▲
      // Promise.all() takes an array of Promises
      // runs them ALL simultaneously
      // waits until ALL are done
      // returns an array of results in the same order
      // faster than: const blogs = await ...; const total = await ...;
      // (which would run sequentially)
      Blog.find()
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Blog.countDocuments(),
    ]);
    return res.json({
      blogs,
      pagination: {
        total,
        // ▲ total number of blogs (e.g. 47)
        page,
        // ▲ current page (e.g. 2)
        limit,
        // ▲ blogs per page (e.g. 10)
        totalPages: Math.ceil(total / limit),
        // ▲ total number of pages (e.g. 5)
        hasNextPage: page < Math.ceil(total / limit),
        // ▲ is there a page after this one?
        hasPrevPage: page > 1,
        // ▲ is there a page before this one?
      },
    });
  } catch (error) {
    // return res.status(500).json({ message: "Failed to fetch blogs" });
    next(error);
  }
}

export async function getBlog(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const blog = await Blog.findById(id).populate("author", "name email");
    if (!blog) return res.status(404).json({ message: "Not found" });
    return res.json(blog);
  } catch (error) {
    // return res.status(500).json({ message: "Failed to get blog" });
    next(error);
  }
}
export async function updateBlog(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Not found" });
    if (blog.author.toString() !== req.userId)
      return res.status(403).json({ message: "forbidden" });
    const { title, content } = req.body as UpdateBlogInput;
    if (typeof title === "string") blog.title = title;
    if (typeof content === "string") blog.content = content;
    await blog.save();
    return res.json(blog);
  } catch (error) {
    // return res.status(500).json({ message: "Failed to update blog" });
    next(error);
  }
}

export async function deleteBlog(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: "forbidden" });
    }

    await blog.deleteOne();

    return res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    // return res.status(500).json({ message: "Failed to delete blog" });
    next(error);
  }
}
