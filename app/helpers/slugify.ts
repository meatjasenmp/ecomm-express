import slugify from 'slugify';

export const createSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

export const createProductSlug = (title: string): string => {
  return createSlug(title);
};