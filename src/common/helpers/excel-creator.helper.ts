import { Cell, Row, Workbook } from 'exceljs';
import { __baseDir } from 'src/config/settings';
import { v7 as uuidv7 } from 'uuid';

export enum SHEET_NAME {
  USERS = 'users',
  ORDERS = 'orders',
  BUSINESS_PRODUCT_PRICES = 'prices',
  PRODUCTS = 'products',
}

export type ExcelCol = { header: string; key: string; width: number };

export const excelPaginationOptions = { perPage: 2000, page: 1 };

export async function saveToExcel(cols: ExcelCol[], data: object[], sheetName: SHEET_NAME): Promise<string> {
  try {
    console.time('⓵ CREATE EXCEL');
    const workbook = new Workbook();
    workbook.creator = process.env?.APP_NAME || 'Market';
    workbook.lastModifiedBy = process.env?.APP_NAME || 'Market';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet(sheetName, { properties: { tabColor: { argb: 'FFC0000' } } });

    /**
     * FOR EXAMPLE
     *
        [
          { header: 'termid', key: 'termid', width: 15 },
          { header: 'pan', key: 'pan', width: 25 },
          { header: 'hpan', key: 'hpan', width: 45 },
          { header: 'originalamount', key: 'originalamount', width: 15 },
          { header: 'rrn', key: 'rrn', width: 20 },
          { header: 'stracedt', key: 'stracedt', width: 20 },
          { header: 'merchantnumber', key: 'merchantnumber', width: 15 },
          { header: 'responsecoden', key: 'responsecoden', width: 10 },
          { header: 'prcoden', key: 'prcoden', width: 10 },
        ];
      *
     */
    sheet.columns = cols;

    sheet.addRows(data);

    sheet.eachRow((row: Row, rowNumber: number) => {
      row.font = {
        size: 12,
      };
      if (rowNumber === 1) {
        row.height = 20;
        row.font = {
          bold: true,
          size: 14,
          color: { argb: 'ffffff' },
        };
        row.alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '0D9488' },
        };
        row.border = {
          left: { color: { argb: '262626' }, style: 'thin' },
          bottom: { color: { argb: '262626' }, style: 'thin' },
        };
      }
    });

    const fileName = `${sheetName}-${new Date().getTime()}-${uuidv7()}.xlsx`;
    const url = __baseDir + `/storage/public/excels/${fileName}`;
    await workbook.xlsx.writeFile(url);
    console.timeEnd('⓵ CREATE EXCEL');
    return `${process.env.BASE_URL}/excels/${fileName}`;
  } catch (error) {
    console.timeEnd('⓵ CREATE EXCEL');
    console.log('⭕ ', error);
  }
}
