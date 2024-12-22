export type DashboardElement = {
  id: number;
  title: string;
  sub_title?: string;
  value: number | string;
  route?: string;
  type?: 'element' | 'divider';
};
