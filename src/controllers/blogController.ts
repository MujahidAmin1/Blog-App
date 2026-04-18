import type { Response } from "express";
import Blog from "../models/blog";
import type { AuthRequest } from "../middleware/auth";

export async function createBlog(req: AuthRequest, res: Response) {
  try {
    const { title, content } = req.body as { title: string; content: string };
    if (!title || !content)
      return res.status(400).json({ message: "Missing Fields" });
    const blogData: any = {
      title,
      content,
      author: req.userId,
    };

    if (req.file) {
      blogData.imageUrl = `/upload/${req.file.filename}`;
    }

    const blog = await Blog.create(blogData);
    return res.status(200).json({ blog });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create blog" });
  }
}
export async function listBlogs(req: AuthRequest, res: Response) {
  try {
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    return res.json({ blogs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
}

export async function getBlog(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const blog = await Blog.findById(id).populate("author", "name email");
    if (!blog) return res.status(404).json({ message: "Not found" });
    return res.json(blog);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get blog" });
  }
}
export async function updateBlog(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Not found" });
    if (blog.author.toString() !== req.userId)
      return res.status(403).json({ message: "forbidden" });
    const { title, content } = req.body as { title: string; content: string };
    if (typeof title === "string") blog.title = title;
    if (typeof content === "string") blog.content = content;
    await blog.save();
    return res.json(blog);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update blog" });
  }
}

export async function deleteBlog(req: AuthRequest, res: Response) {
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
    return res.status(500).json({ message: "Failed to delete blog" });
  }
}

