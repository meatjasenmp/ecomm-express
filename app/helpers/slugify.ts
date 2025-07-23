import slugify from 'slugify';

/**
 * Creates a URL-friendly slug from a string using consistent configuration
 */
export function createSlug(name: string): string {
  if (!name || !name.trim()) {
    throw new Error('Name is required to create slug');
  }

  const slug = slugify(name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'";!:@]/g,
  });

  if (!slug) {
    throw new Error('Generated slug is empty - invalid name provided');
  }

  return slug;
}