import moment from 'moment-jalaali';
import { __baseDir } from 'src/config/settings';
const appName = process.env.APP_NAME;
const date = moment().format('YYYYMMDD');

export const STORAGE = __baseDir + '/storage';
export const STORAGE_PUBLIC = STORAGE + '/public';
export const STORAGE_FONTS = STORAGE_PUBLIC + '/fonts';
export const STORAGE_EXCEL = STORAGE_PUBLIC + '/excels';
export const STORAGE_SEO = STORAGE_PUBLIC + '/seo';
export const VIEWS_FONTS = __baseDir + '/views/fonts';

export const IMAGES_FOLDER = `${appName}/images`;
export const VIDEO_FOLDER = `${appName}/videos`;
export const VOICE_FOLDER = `${appName}/voices`;

export const IMAGES_USER_FOLDER = `${IMAGES_FOLDER}/users/${date}`;

export const IMAGES_PROFILE_FOLDER = `${IMAGES_FOLDER}/profiles/${date}`;
export const IMAGES_OWNER_SELFIE_FOLDER = `${IMAGES_FOLDER}/owner-selfies/${date}`;
export const IMAGES_ADVISOR_NATIONAL_CARD_FOLDER = `${IMAGES_FOLDER}/owner-national-cards/${date}`;
export const IMAGES_ADVISOR_DOCUMENT_FOLDER = `${IMAGES_FOLDER}/owner-documents/${date}`;
export const IMAGES_OWNER_PROPERTY_FOLDER = `${IMAGES_FOLDER}/properties/${date}`;
export const IMAGES_OWNER_PROPERTY_DOCS_FOLDER = `${IMAGES_FOLDER}/owner-property-docs/${date}`;
export const VIDEOS_OWNER_PROPERTY_FOLDER = `${IMAGES_FOLDER}/property-videos/${date}`;

export const PROFILE_FOLDER = `${IMAGES_FOLDER}/profile/${date}`;

export const BANNER_FOLDER = `${IMAGES_FOLDER}/banners/${date}`;

export const CONTENT_FOLDER = `${IMAGES_FOLDER}/contents/${date}`;

export const CATEGORY_FOLDER = `${IMAGES_FOLDER}/categories/${date}`;

export const STORE_LOGO_USER_FOLDER = `${IMAGES_FOLDER}/stores/${date}`;

export const FORM_FOLDER = `${IMAGES_FOLDER}/forms/${date}`;

export const CHAT_MEDIA_FOLDER = `${IMAGES_FOLDER}/chat_media/${date}`;
