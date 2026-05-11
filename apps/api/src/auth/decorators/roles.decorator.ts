import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Convenience decorators
export const SuperAdminOnly = () => Roles('SUPER_ADMIN');
export const AdminOnly = () => Roles('SUPER_ADMIN', 'ADMIN');
export const GuideOnly = () => Roles('GUIDE', 'SUPER_ADMIN', 'ADMIN');
export const UserAndAbove = () => Roles('USER', 'PREMIUM', 'CREATOR', 'GUIDE', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');