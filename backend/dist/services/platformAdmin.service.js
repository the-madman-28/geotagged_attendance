"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformAdminLogin = platformAdminLogin;
exports.createOrganizationAdmin = createOrganizationAdmin;
exports.getOrganizationsForPlatformAdmin = getOrganizationsForPlatformAdmin;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
async function platformAdminLogin(email, password) {
    const platformAdmin = await prisma_1.default.platformAdmin.findUnique({
        where: {
            email,
        },
    });
    if (!platformAdmin) {
        throw new Error("Invalid email or password");
    }
    if (!platformAdmin.isActive) {
        throw new Error("Platform admin account is inactive");
    }
    const passwordMatches = await bcrypt_1.default.compare(password, platformAdmin.passwordHash);
    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }
    const token = jsonwebtoken_1.default.sign({
        platformAdminId: platformAdmin.id,
        role: "PLATFORM_ADMIN",
    }, JWT_SECRET, {
        expiresIn: "7d",
    });
    return {
        token,
        platformAdmin: {
            id: platformAdmin.id,
            email: platformAdmin.email,
        },
    };
}
async function createOrganizationAdmin({ organizationId, email, password, }) {
    const organization = await prisma_1.default.organization.findUnique({
        where: {
            id: organizationId,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
        },
    });
    if (!organization) {
        throw new Error("Organization not found");
    }
    if (!organization.isActive) {
        throw new Error("Organization is inactive");
    }
    const existingAdmin = await prisma_1.default.admin.findUnique({
        where: {
            email,
        },
    });
    if (existingAdmin) {
        throw new Error("An admin with this email already exists");
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    const admin = await prisma_1.default.admin.create({
        data: {
            organizationId,
            email,
            passwordHash,
        },
        select: {
            id: true,
            email: true,
            isActive: true,
            createdAt: true,
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });
    return admin;
}
async function getOrganizationsForPlatformAdmin() {
    return prisma_1.default.organization.findMany({
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            createdAt: true,
            _count: {
                select: {
                    admins: true,
                    employees: true,
                },
            },
        },
    });
}
