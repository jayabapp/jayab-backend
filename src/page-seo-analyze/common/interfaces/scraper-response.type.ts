export type ScraperResponse = {
    title_length?: number,
    description_length?: number,
    images?: string[],
    h1_count?: number,
    h1_array?: string[],
    internal_links?: Array<{ rel: null | string, href: string }>,
    external_links?: Array<{ rel: null | string, href: string }>,
    canonical?: string,
    schemas: any[]
}