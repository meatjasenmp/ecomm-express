export const expectValidSlug = (slug: string): void => {
  expect(slug).toBeTruthy();
  expect(slug).toMatch(/^[a-z0-9-]+$/);
};

export const expectValidMongoId = (id: string): void => {
  expect(id).toBeTruthy();
  expect(id).toMatch(/^[0-9a-fA-F]{24}$/);
};

export const expectValidDate = (date: any): void => {
  expect(date).toBeInstanceOf(Date);
  expect(date.getTime()).not.toBeNaN();
};
