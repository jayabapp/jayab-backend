import { EnumList } from "src/common/interfaces/model-props.interface";

export enum PageSeoAnalyzeStatus {
    READY_TO_SCRAPE = 0,
    IN_PROGRESS = 1,
    FAILED_TO_SCRAPE = 5,
    SCRAPED = 10,

}

export const PageSeoAnalyzeStatusList: EnumList[] = [
    { id: PageSeoAnalyzeStatus.READY_TO_SCRAPE, title: 'در صف', hex: '#615fff' },
    { id: PageSeoAnalyzeStatus.IN_PROGRESS, title: 'در حال انجام', hex: '#fe9a00' },
    { id: PageSeoAnalyzeStatus.FAILED_TO_SCRAPE, title: 'مشکل در دریافت', hex: '#ff2056' },
    { id: PageSeoAnalyzeStatus.SCRAPED, title: 'انجام شده', hex: '#00bc7d' },
]