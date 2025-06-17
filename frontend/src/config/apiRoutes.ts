// /src/config/apiRoutes.ts

export const apiRoutes = {
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        MY_PERMISSIONS: '/auth/my-permissions',
    },
    USERS: {
        BASE: '/users',
        PROFILE: '/users/profile',
        BY_ID: (id: string) => `/users/${id}`,
    },
    POSTS: {
        BASE: '/postsapi',
        CREATE: '/postsapi',
        UPDATE: (slug: string) => `/postsapi/${slug}`,
        DELETE: (slug: string) => `/postsapi/${slug}`,
        GET_BY_SLUG: (slug: string) => `/postsapi/${slug}`,
        BY_CATEGORY: (slug: string) => `/postsapi/category/${slug}`,
    },
    PRODUCTS: {
        BASE: '/productapi',
        CREATE: '/productapi',
        UPDATE: (slug: string) => `/productapi/${slug}`,
        DELETE: (slug: string) => `/productapi/${slug}`,
        GET_BY_SLUG: (slug: string) => `/productapi/${slug}`,
    },
    PERMISSIONS: {
        BASE: '/permissions',
        USER: (userId: string) => `/permissions/user/${userId}`,
        INITIALIZE: '/permissions/initialize',
    },
};

// For backward compatibility
export const API_ROUTES = apiRoutes;
