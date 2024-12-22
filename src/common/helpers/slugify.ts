export const slugify = (titleStr: string): string => {
  let slug = titleStr.replace(/^\s+|\s+$/g, '');
  slug = slug.toLowerCase();
  //persian support
  slug = slug
    .replace(/[^a-z0-9_\s-ءاأإآؤئبتثجحخدذرزسشصضطظعغفقكلمنهويةى]#u/, '')
    // Collapse whitespace and replace by -
    .replace(/\s+/g, '-')
    // Collapse dashes
    .replace(/-+/g, '-');

  return slug;
};
