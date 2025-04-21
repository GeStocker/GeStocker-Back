export enum UserRole {
    BASIC = 'basic',
    PROFESIONAL = 'professional',
    BUSINESS = 'business',
    ADMIN = 'admin',
    SUPERADMIN = 'superadmin',
    COLLABORATOR = 'COLLABORATOR',
    BUSINESS_ADMIN = 'BUSINESS_ADMIN',
}

export const SubscriptionPrices: Record<UserRole, number> = {
    [UserRole.BASIC]: 20,
    [UserRole.PROFESIONAL]: 50,
    [UserRole.BUSINESS]: 99,
    [UserRole.ADMIN]: 0,
    [UserRole.SUPERADMIN]: 0,
    [UserRole.COLLABORATOR]: 0,
    [UserRole.BUSINESS_ADMIN]: 0,
};
