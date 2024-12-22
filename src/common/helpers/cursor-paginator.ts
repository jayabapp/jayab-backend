export interface CursorPaginatedResult<T> {
  data: T[];
}

export type CursorPaginateOptionsType = { cursor?: number; perPage?: number };
export type CursorPaginateFunctionType = <T, K>(
  model: any,
  args?: K,
  options?: CursorPaginateOptionsType,
) => Promise<CursorPaginatedResult<T>>;

export const cursorPaginate = (
  defaultOptions: CursorPaginateOptionsType = { cursor: 0, perPage: 20 },
): CursorPaginateFunctionType => {
  return async (model, args: any = {}, options) => {
    const cursor = Number(options?.cursor || defaultOptions?.cursor) || 0;
    let perPage = Number(options?.perPage || defaultOptions?.perPage) || 20;
    perPage = Math.abs(perPage);

    const orderByArg = args?.orderBy ? Object.keys(args?.orderBy) : [];
    const orderBy = orderByArg.length > 0 ? args.orderBy : { id: 'desc' };

    let lastId = 0;
    if (!cursor) lastId = (await model.findFirst({ where: args.where, take: 1, orderBy }))?.id || 0;

    const skip = !cursor ? 0 : 1;

    const data = await model.findMany({
      ...args,
      orderBy,
      cursor: { id: cursor || lastId },
      take: perPage,
      skip,
    });

    return {
      data,
    };
  };
};
