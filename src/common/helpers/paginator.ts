export type PaginationMetaType = {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
};

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMetaType;
}

export type PaginateOptionsType = { page?: number | string; perPage?: number | string };
export type PaginateFunctionType = <T, K>(
  model: any,
  args?: K,
  options?: PaginateOptionsType,
) => Promise<PaginatedResult<T>>;

export const paginate = (
  defaultOptions: PaginateOptionsType = { page: 1, perPage: 10 },
): PaginateFunctionType => {
  return async (model, args: any = {}, options) => {
    const page = Number(options?.page || defaultOptions?.page) || 1;
    const perPage = Number(options?.perPage || defaultOptions?.perPage) || 10;

    const skip = page > 0 ? perPage * (page - 1) : 0;
    const orderBy =
      typeof args.orderBy == 'object' && Object.keys(args.orderBy).length > 0
        ? args.orderBy
        : { created_at: 'desc' };

    const [total, data] = await Promise.all([
      model.count({ where: args.where }),
      model.findMany({
        ...args,
        orderBy,
        take: perPage,
        skip,
      }),
    ]);
    const lastPage = Math.ceil(total / perPage);

    return {
      data,
      meta: {
        total,
        lastPage,
        currentPage: page,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  };
};
