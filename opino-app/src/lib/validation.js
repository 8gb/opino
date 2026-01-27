import { z } from 'zod';

// Comment validation schema
export const CommentSchema = z.object({
  siteName: z.string()
    .min(1, 'Site ID is required')
    .max(100, 'Site ID too long')
    .regex(/^[a-z0-9\-_]+$/i, 'Invalid site ID format'),
  pathName: z.string()
    .min(1, 'Path is required')
    .max(500, 'Path too long')
    .regex(/^[a-z0-9\-_\/\.]+$/i, 'Invalid path characters'),
  message: z.string()
    .min(1, 'Message is required')
    .max(10000, 'Message too long (max 10000 characters)')
    .transform(s => s.trim()),
  author: z.string()
    .max(100, 'Author name too long')
    .transform(s => s.trim())
    .optional()
    .default('Guest'),
  parent: z.string().optional().nullable(),
});

// Site creation schema
export const SiteSchema = z.object({
  domain: z.string()
    .min(4, 'Domain too short')
    .max(253, 'Domain too long')
    .regex(
      /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i,
      'Invalid domain format'
    )
    .transform(s => s.toLowerCase()),
});

// Validation helper
export function validate(schema, data) {
  try {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      // Handle validation failure
      const errorMessages = result.error?.errors && Array.isArray(result.error.errors)
        ? result.error.errors.map(e => e.message || String(e)).join(', ')
        : result.error?.message || 'Validation failed';

      return {
        success: false,
        error: errorMessages
      };
    }
  } catch (error) {
    // Fallback for unexpected errors
    return {
      success: false,
      error: error?.message || 'Validation error'
    };
  }
}
