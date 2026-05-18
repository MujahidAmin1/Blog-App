import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import User from "../models/user";
import Blog from "../models/blog";

// List all users — admin only
export async function listUsers(req: AuthRequest, res: Response) {
  try {
    const users = await User.find()
      .select("-passwordHash")
      // ▲ projection — exclude passwordHash from results
      // "-fieldName" syntax means "everything EXCEPT this field"
      .sort({ createdAt: -1 });

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}

// Delete any user — admin only
export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params as { id: string };

    // Prevent admin from deleting themselves
    if (id === req.userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete the user's blogs too — clean up orphaned data
    await Blog.deleteMany({ author: id });
    //              ▲
    //    deleteMany — deletes ALL documents matching the filter
    //    without this, deleted user's blogs stay in DB forever
    //    with no valid author reference

    await user.deleteOne();

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user" });
  }
}

// Delete any blog — admin only
export async function adminDeleteBlog(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params as { id: string };

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // No ownership check — admin can delete anyone's blog
    await blog.deleteOne();

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete blog" });
  }
}

export default { listUsers, deleteUser, adminDeleteBlog };