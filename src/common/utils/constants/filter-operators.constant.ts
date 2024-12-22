import { OperatorItems } from 'src/common/interfaces/model-props.interface';

export const operatorsList: Array<OperatorItems> = [
  {
    id: 1,
    operator: 'equals',
    title: 'برابر',
    types: ['string', 'number'],
  },
  {
    id: 2,
    operator: 'contains',
    title: 'شامل',
    types: ['string'],
  },
  {
    id: 3,
    operator: 'lt',
    title: 'کوچکتر از',
    types: ['number'],
  },
  {
    id: 4,
    operator: 'lte',
    title: 'کوچکتر مساوی از',
    types: ['number'],
  },
  {
    id: 5,
    operator: 'gt',
    title: 'بزرگتر از',
    types: ['number'],
  },
  {
    id: 6,
    operator: 'gte',
    title: 'بزرگتر مساوی از',
    types: ['number'],
  },
  {
    id: 7,
    operator: 'not',
    title: 'نا مساوی',
    types: ['string', 'number'],
  },
];

export const operators = {
  equals: operatorsList[0],
  contains: operatorsList[1],
  lt: operatorsList[2],
  lte: operatorsList[3],
  gt: operatorsList[4],
  gte: operatorsList[5],
  not: operatorsList[6],
};
