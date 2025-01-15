export const userCacheStatusKey = (userId: number, socketId: string): string =>
  `user:${userId}:status:${socketId}`;
export const adminCacheStatusKey = (userId: number, socketId: string): string =>
  `admin:${userId}:status:${socketId}`;
export const userPropertyViewKey = (propertyId: number, fingerprint: string): string =>
  `view:property_id:${propertyId}:fingerprint:${fingerprint}`;
