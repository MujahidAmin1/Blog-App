import { z } from "zod";

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),

  email: z
    .email({ error: "Invalid email address" }),
    // ▲ top-level z.email() in v4, not z.string().email()

  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),

  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

// ─── Blog schemas ─────────────────────────────────────────────────────────────

export const createBlogSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),

  content: z
    .string({ error: "Content is required" })
    .min(10, "Content must be at least 10 characters"),
});

export const updateBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim()
    .optional(),

  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .optional(),
}).refine(
  (data) => data.title !== undefined || data.content !== undefined,
  { error: "At least one field (title or content) must be provided" }
  // ▲ "error" not "message" in v4
);

// ─── Pagination schema ────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, "Page must be at least 1")),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().min(1).max(50, "Limit cannot exceed 50")),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;