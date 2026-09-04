export type ImageEncodingQuality = {
  large: number;
  medium: number;
  thumbnail: number;
};

export const DEFAULT_IMAGE_ENCODING_QUALITY: ImageEncodingQuality = {
  large: 80,
  medium: 80,
  thumbnail: 80,
};

export const PROPERTY_IMAGE_ENCODING_QUALITY: ImageEncodingQuality = {
  large: 88,
  medium: 84,
  thumbnail: 82,
};

export const IMAGE_WEBP_OPTIONS = {
  effort: 4,
  smartSubsample: true,
} as const;

export const PROPERTY_IMAGE_MAX_DIMENSION = 1600;

export const BLOG_IMAGE_ENCODING_QUALITY = PROPERTY_IMAGE_ENCODING_QUALITY;
export const BLOG_IMAGE_MAX_DIMENSION = 1600;
