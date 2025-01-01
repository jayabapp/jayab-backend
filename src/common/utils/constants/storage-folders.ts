import { __baseDir } from 'src/config/settings';
const appName = process.env.APP_NAME;

export const STORAGE = __baseDir + '/storage';
export const STORAGE_PUBLIC = STORAGE + '/public';
export const STORAGE_FONTS = STORAGE_PUBLIC + '/fonts';
export const STORAGE_EXCEL = STORAGE_PUBLIC + '/excels';
export const STORAGE_SEO = STORAGE_PUBLIC + '/seo';
export const VIEWS_FONTS = __baseDir + '/views/fonts';

export const VIDEO_FOLDER = `${appName}/videos`;
// export const VIDEO_FOLDER_BASE =${appName}/ `TORAGE_PUBLIC + VIDEO_FOLDE`;

export const VOICE_FOLDER = `${appName}/voices`;

export const IMAGES_FOLDER = `${appName}/images`;

export const IMAGES_USER_FOLDER = `${appName}/images/users`;

export const IMAGES_PROFILE_FOLDER = `${appName}/images/profiles`;
export const IMAGES_OWNER_SELFIE_FOLDER = `${appName}/images/owner-selfies`;
export const IMAGES_ADVISOR_NATIONAL_CARD_FOLDER = `${appName}/images/owner-national-cards`;
export const IMAGES_ADVISOR_DOCUMENT_FOLDER = `${appName}/images/owner-documents`;
export const IMAGES_OWNER_PROPERTY_FOLDER = `${appName}/images/owner-property-images`;
export const VIDEOS_OWNER_PROPERTY_FOLDER = `${appName}/images/owner-property-videos`;

export const PROFILE_FOLDER = `${appName}/images/profile`;

export const BANNER_FOLDER = `${appName}/images/banners`;

export const CONTENT_FOLDER = `${appName}/images/contents`;

export const CATEGORY_FOLDER = `${appName}/images/categories`;

export const STORE_LOGO_USER_FOLDER = `${appName}/images/stores`;

export const FORM_FOLDER = `${appName}/images/forms`;

export const CHAT_MEDIA_FOLDER = 'images/chat_media';
/**
 * if using local storage (not S3) uncomment this const
 */
export const ALL_FOLDERS = [
  // STORAGE,
  // STORAGE_PUBLIC,
  // VIDEO_FOLDER_BASE,
  // IMAGES_FOLDER_BASE,
  // IMAGES_GENERAL_FOLDER_BASE,
  // PROFILE_FOLDER_BASE,
  // BANNER_FOLDER_BASE,
  // CONTENT_FOLDER_BASE,
  // VOICE_FOLDER_BASE,
];
