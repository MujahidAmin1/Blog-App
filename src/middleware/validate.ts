import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validate(schema: z.ZodType, source: 'body' | 'query' = 'body') {
//                                 ▲
//                        z.ZodType — the correct v4 base type

  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(
      source === 'body' ? req.body : req.query
    );

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
      //                           ▲
      //                  .issues not .errors in v4
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    if (source === 'body') {
      req.body = result.data;
    } else {
      req.query = result.data as any;
    }

    next();
  };
}

export default validate;