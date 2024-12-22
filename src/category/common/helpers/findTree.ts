export default function findTree(path: string): Array<number> {
  if (!path) return [];
  const tree = path
    ?.split('-')
    .filter((e) => e)
    .map((e) => +e);

  return tree;
}
