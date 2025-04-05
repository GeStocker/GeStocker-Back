export enum UserRole {
    BASIC = 'basic',
    PROFESIONAL = 'professional',
    BUSINESS = 'business',
    ADMIN = 'admin',
    SUPERADMIN = 'superadmin'
}

export const SubscriptionPrices: Record<UserRole, number> = {
    [UserRole.BASIC]: 20,
    [UserRole.PROFESIONAL]: 50,
    [UserRole.BUSINESS]: 99,
    [UserRole.ADMIN]: 0,
    [UserRole.SUPERADMIN]: 0,
  };
