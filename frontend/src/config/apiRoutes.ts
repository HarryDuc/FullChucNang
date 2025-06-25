// /src/config/apiRoutes.ts
export const API_URL_CLIENT = process.env.NEXT_PUBLIC_API_URL; // Lấy từ .env.local

export const apiRoutes = {
    AUTH: {
        BASE: '/authapi',
        CHECK_EMAIL: '/authapi/check-email',
        REGISTER: '/authapi/register',
        LOGIN: '/authapi/login',
        LOGOUT: '/authapi/logout',
        ME: '/authapi/me',
        MY_PERMISSIONS: '/authapi/my-permissions',
        USERS: '/authapi/users',
        UPDATE: '/authapi/update',
        GOOGLE: '/authapi/google',
        GOOGLE_REDIRECT: '/authapi/google/redirect',
        REQUEST_PASSWORD_RESET: '/authapi/request-password-reset',
        VERIFY_OTP: '/authapi/verify-otp',
        RESET_PASSWORD_WITH_TOKEN: '/authapi/reset-password/token',
        RESET_PASSWORD_WITH_OTP: '/authapi/reset-password/otp',
        CHECK_PERMISSION: '/authapi/check-permission',
        METAMASK: {
            NONCE: '/authapi/metamask/nonce',
            AUTHENTICATE: '/authapi/metamask/authenticate',
            LINK: '/authapi/metamask/link',
            WALLETS: '/authapi/metamask/wallets',
            WALLETS_BY_ADDRESS: (address: string) => `/authapi/metamask/wallets/${address}`,
            WALLETS_BY_ADDRESS_PRIMARY: (address: string) => `/authapi/metamask/wallets/${address}/primary`,
        },
    },
    BANNERS: {
        BASE: '/bannersapi',
        CREATE: '/bannersapi',
        GET_ALL: '/bannersapi',
        GET_ACTIVE_BY_TYPE: (type: string) => `/bannersapi/active/${type}`,
        GET_BY_ID: (id: string) => `/bannersapi/${id}`,
        UPDATE: (id: string) => `/bannersapi/${id}`,
        UPDATE_ORDER: (id: string) => `/bannersapi/${id}/order`,
        TOGGLE_ACTIVE: (id: string) => `/bannersapi/${id}/toggle-active`,
        DELETE: (id: string) => `/bannersapi/${id}`,
    },
    CATEGORIES_POST: {
        BASE: '/category-postsapi',
        CREATE: '/category-postsapi',
        UPDATE: (slug: string) => `/category-postsapi/${slug}`,
        GET_ONE: (slug: string) => `/category-postsapi/${slug}`,
        // GET_ALL hỗ trợ phân trang, tìm kiếm, lọc
        GET_ALL: (params?: { page?: number; limit?: number; search?: string }) => {
            let url = '/category-postsapi';
            if (params) {
                const searchParams = new URLSearchParams();
                if (params.page !== undefined) searchParams.append('page', String(params.page));
                if (params.limit !== undefined) searchParams.append('limit', String(params.limit));
                if (params.search) searchParams.append('search', params.search);
                const queryString = searchParams.toString();
                if (queryString) url += `?${queryString}`;
            }
            return url;
        },
        SOFT_DELETE: (slug: string) => `/category-postsapi/${slug}/soft-delete`,
        DELETE: (slug: string) => `/category-postsapi/${slug}`,
    },
    CATEGORIES_PRODUCT: {
        BASE: '/categories-productsapi',
        CREATE: '/categories-productsapi',
        GET_ALL: '/categories-productsapi',
        GET_BY_ID: (id: string) => `/categories-productsapi/id/${id}`,
        GET_MAIN: '/categories-productsapi/main',
        GET_SUB_BY_PARENT_ID: (parentId: string) => `/categories-productsapi/sub/${parentId}`,
        GET_BY_SLUG: (slug: string) => `/categories-productsapi/${slug}`,
        UPDATE: (slug: string) => `/categories-productsapi/${slug}`,
        DELETE: (slug: string) => `/categories-productsapi/${slug}`,
    },
    CHECKOUTS: {
        BASE: '/checkoutsapi',
        CREATE: '/checkoutsapi',
        GET_ALL: '/checkoutsapi',
        GET_BY_SLUG: (slug: string) => `/checkoutsapi/${slug}`,
        UPDATE: (slug: string) => `/checkoutsapi/${slug}`,
        UPDATE_PAYMENT_STATUS: (slug: string) => `/checkoutsapi/${slug}/payment-status`,
        DELETE: (slug: string) => `/checkoutsapi/${slug}`,
        METAMASK: {
            BASE: '/checkoutsapi/metamask',
            VERIFY_TRANSACTION: (slug: string) => `/checkoutsapi/metamask/${slug}/verify`,
            GENERATE_PAYMENT_INFO: (slug: string) => `/checkoutsapi/metamask/${slug}/payment-info`,
        },
    },
    CONTACTS: {
        BASE: '/contactsapi',
        CREATE: '/contactsapi',
        GET_ALL: '/contactsapi',
        GET_BY_ID: (id: string) => `/contactsapi/${id}`,
        DELETE: (id: string) => `/contactsapi/${id}`,
    },
    CREATE_PAGES: {
        BASE: '/pagesapi',
        CREATE: '/pagesapi',
        GET_ALL: '/pagesapi',
        GET_BY_SLUG: (slug: string) => `/pagesapi/by-slug/${slug}`,
        UPDATE: (slug: string) => `/pagesapi/by-slug/${slug}`,
        DELETE: (slug: string) => `/pagesapi/by-slug/${slug}`,
    },
    IMAGES: {
        BASE: '/imagesapi',
        GET_ALL: '/imagesapi',
        // Upload 1 ảnh (field: file)
        UPLOAD: '/imagesapi/upload',
        // Upload nhiều ảnh (field: files)
        UPLOAD_MULTIPLE: '/imagesapi/upload-multiple',
        // Upload ảnh cho SunEditor (field: file)
        UPLOAD_SUNEDITOR: '/imagesapi/sunEditor',
        // Xóa ảnh theo slug
        DELETE: (slug: string) => `/imagesapi/${slug}`,
    },
    INFO_WEBSITE: {
        BASE: '/info-websitesapi',
        CREATE: '/info-websitesapi',
        GET_ALL: '/info-websitesapi',
        GET_ACTIVE: '/info-websitesapi/active',
        GET_BY_ID: (id: string) => `/info-websitesapi/${id}`,
        UPDATE: (id: string) => `/info-websitesapi/${id}`,
        DELETE: (id: string) => `/info-websitesapi/${id}`,
        SET_ACTIVE: (id: string) => `/info-websitesapi/${id}/set-active`,
    },
    MANAGER_PERMISSIONS: {
        // RoleController
        ROLES_BASE: '/rolesapi',
        ROLES_GET_ALL: '/rolesapi',
        ROLES_GET_ALL_WITH_PERMISSIONS: '/rolesapi/with-permissions',
        ROLES_GET_BY_ID: (id: string) => `/rolesapi/${id}`,
        ROLES_CREATE: '/rolesapi',
        ROLES_UPDATE: (id: string) => `/rolesapi/${id}`,
        ROLES_DELETE: (id: string) => `/rolesapi/${id}`,
        ROLES_GET_PERMISSIONS: (roleId: string) => `/rolesapi/${roleId}/permissions`,
        ROLES_UPDATE_PERMISSIONS: (roleId: string) => `/rolesapi/${roleId}/permissions`,

        // UserRoleController
        USER_ROLES_BASE: '/user-rolesapi',
        USER_ROLES_ASSIGN: '/user-rolesapi',
        USER_ROLES_REMOVE: (userId: string) => `/user-rolesapi/${userId}/role`,
        USER_ROLES_GET: (userId: string) => `/user-rolesapi/${userId}/role`,
    },
    ORDERS: {
        BASE: '/ordersapi',
        CREATE: '/ordersapi',
        GET_ALL: '/ordersapi',
        GET_BY_SLUG: (slug: string) => `/ordersapi/${slug}`,
        UPDATE: (slug: string) => `/ordersapi/${slug}`,
        UPDATE_STATUS: (slug: string) => `/ordersapi/${slug}/status`,
        DELETE: (slug: string) => `/ordersapi/${slug}`,
        UPDATE_PAYMENT_STATUS: (slug: string) => `/ordersapi/${slug}/update-payment-status`,
    },
    PAYPAL: {
        BASE: '/paypalsapi',
        CREATE_ORDER: '/paypalsapi/create-order',
        GET_ORDER_DETAILS: (orderId: string) => `/paypalsapi/order/${orderId}`,
        CAPTURE_PAYMENT: (orderId: string) => `/paypalsapi/order/${orderId}/capture`,
        AUTHORIZE_PAYMENT: (orderId: string) => `/paypalsapi/order/${orderId}/authorize`,
        WEBHOOKS: '/paypalsapi/webhooks',
    },
    PERMISSIONS: {
        BASE: '/permissionsapi',
        GET_ALL: '/permissionsapi',
        CREATE: '/permissionsapi',
        GET_BY_USER_ID: (userId: string) => `/permissionsapi/user/${userId}`,
        UPDATE_USER_PERMISSIONS: (userId: string) => `/permissionsapi/user/${userId}`,
        INITIALIZE: '/permissionsapi/initialize',
        ASSIGN_ALL_TO_ADMIN: (userId: string) => `/permissionsapi/admin/${userId}`,
    },
    POSTS: {
        BASE: '/postsapi',
        CREATE: '/postsapi',
        GET_ALL: '/postsapi',
        GET_MY_POSTS: (userId: string, page: number = 1, limit: number = 10) =>
            `/postsapi/my-posts?userId=${userId}&page=${page}&limit=${limit}`,
        GET_BY_STATUS: (status: string, page: number = 1, limit: number = 10, includeHidden: boolean = false) =>
            `/postsapi/by-status/${status}?page=${page}&limit=${limit}&includeHidden=${includeHidden}`,
        GET_BY_SLUG: (slug: string, includeHidden: boolean = false) =>
            `/postsapi/${slug}?includeHidden=${includeHidden}`,
        UPDATE: (slug: string) => `/postsapi/${slug}`,
        UPDATE_SLUG: (slug: string) => `/postsapi/${slug}/update-slug`,
        UPDATE_VISIBILITY: (slug: string) => `/postsapi/${slug}/visibility`,
        UPDATE_STATUS: (slug: string) => `/postsapi/${slug}/status`,
        DELETE: (slug: string) => `/postsapi/${slug}`,
        HARD_DELETE: (slug: string) => `/postsapi/${slug}/force`,
        TRANSFER_ALL: '/postsapi/transfer-all',
        TRANSFER_SELECTED: '/postsapi/transfer-selected',
    },
    PRODUCTS: {
        BASE: '/productsapi',
        CREATE: '/productsapi',
        GET_ALL: (page: number = 1) => `/productsapi?page=${page}`,
        GET_ALL_BASIC_INFO: (page: number = 1) => `/productsapi/basic-info?page=${page}`,
        GET_BY_CATEGORY_ID: (mainCategoryId: string, page: number = 1, limit: number = 12) =>
            `/productsapi/by-categoryID?mainCategoryId=${mainCategoryId}&page=${page}&limit=${limit}`,
        SEARCH: (q: string, page: number = 1) =>
            `/productsapi/search?q=${encodeURIComponent(q)}&page=${page}`,
        GET_BY_SLUG: (slug: string) => `/productsapi/${slug}`,
        GET_BY_MAIN_CATEGORY: (mainCategory: string, page: number = 1) =>
            `/productsapi/bycategory/${encodeURIComponent(mainCategory)}?page=${page}`,
        GET_BY_SUB_CATEGORY: (subCategory: string, page: number = 1) =>
            `/productsapi/bysubcategory/${encodeURIComponent(subCategory)}?page=${page}`,
        UPDATE: (slug: string) => `/productsapi/${slug}`,
        DELETE: (slug: string) => `/productsapi/${slug}`,
        UPDATE_NAME: (slug: string) => `/productsapi/${slug}/name`,
        UPDATE_CATEGORY: (slug: string) => `/productsapi/${slug}/category`,
        UPDATE_VARIANTS: (slug: string) => `/productsapi/${slug}/variants`,
        UPDATE_SLUG: (slug: string) => `/productsapi/${slug}/slug`,
    },
    REDIRECTS: {
        BASE: '/redirectsapi',
        CREATE: '/redirectsapi',
        CREATE_BULK: '/redirectsapi/bulk',
        GET_ALL: (page: number = 1, limit: number = 10, type?: string, isActive?: boolean, path?: string, statusCode?: number) => {
            let url = `/redirectsapi?page=${page}&limit=${limit}`;
            if (type !== undefined) url += `&type=${encodeURIComponent(type)}`;
            if (isActive !== undefined) url += `&isActive=${isActive}`;
            if (path !== undefined) url += `&path=${encodeURIComponent(path)}`;
            if (statusCode !== undefined) url += `&statusCode=${statusCode}`;
            return url;
        },
        CHECK: (path: string) => `/redirectsapi/check?path=${encodeURIComponent(path)}`,
        GET_BY_ID: (id: string) => `/redirectsapi/${id}`,
        UPDATE: (id: string) => `/redirectsapi/${id}`,
        DELETE: (id: string) => `/redirectsapi/${id}`,
    },
    REVIEWS: {
        BASE: '/reviewsapi',
        CREATE: '/reviewsapi',
        GET_ALL: '/reviewsapi',
        GET_BY_PRODUCT_SLUG: (slug: string) => `/reviewsapi/product/${slug}`,
        GET_PRODUCT_RATING: (slug: string) => `/reviewsapi/product/${slug}/rating`,
        GET_BY_ID: (id: string) => `/reviewsapi/${id}`,
        UPDATE: (id: string) => `/reviewsapi/${id}`,
        DELETE: (id: string) => `/reviewsapi/${id}`,
    },
    SCRIPTS: {
        BASE: '/scriptsapi',
        CREATE: '/scriptsapi',
        GET_ALL: '/scriptsapi',
        GET_BY_POSITION: (position: string) => `/scriptsapi/position/${encodeURIComponent(position)}`,
        GET_ALL_BY_SECTION: '/scriptsapi/sections',
        GET_BY_ID: (id: string) => `/scriptsapi/${id}`,
        UPDATE: (id: string) => `/scriptsapi/${id}`,
        DELETE: (id: string) => `/scriptsapi/${id}`,
        TOGGLE_ACTIVE: (id: string) => `/scriptsapi/${id}/toggle`,
    },
    USERS: {
        BASE: '/usersapi',
        GET_ME: '/usersapi/me',
        UPDATE_ME: '/usersapi/me',
        GET_ALL: '/usersapi',
        GET_BY_ID: (id: string) => `/usersapi/${id}`,
        CREATE: '/usersapi',
        UPDATE: (id: string) => `/usersapi/${id}`,
        DELETE: (id: string) => `/usersapi/${id}`,
    },
    VARIANTS: {
        BASE: '/variantsapi',
        CREATE: '/variantsapi',
        GET_ALL: '/variantsapi',
        GET_BY_SLUG: (slug: string) => `/variantsapi/${slug}`,
        UPDATE: (slug: string) => `/variantsapi/${slug}`,
        DELETE: (slug: string) => `/variantsapi/${slug}`,
        UPDATE_NAME: (slug: string) => `/variantsapi/${slug}/name`,
        UPDATE_VALUES: (slug: string) => `/variantsapi/${slug}/values`,
        UPDATE_SLUG: (slug: string) => `/variantsapi/${slug}/slug`,
    },
    VERIFY: {
        // Controller: VerifyController
        BASE: '/verifysapi',
        // [POST] /verifysapi/send - Gửi email xác thực, body: { email: string }
        SEND_VERIFICATION_EMAIL: '/verifysapi/send',
        // [POST] /verifysapi/verify-email - Xác thực email, body: { email: string, code: string }
        VERIFY_EMAIL: '/verifysapi/verify-email',
    },
    // Controller: VietQRConfigController
    VIETQR_CONFIG: {
        BASE: '/vietqr-configsapi',
        // [GET] /vietqr-configsapi - Lấy cấu hình VietQR đang active
        GET_ACTIVE: '/vietqr-configsapi',
        // [GET] /vietqr-configsapi/all - Lấy tất cả cấu hình VietQR
        GET_ALL: '/vietqr-configsapi/all',
        // [POST] /vietqr-configsapi - Tạo mới cấu hình VietQR, body: VietQRConfigDto
        CREATE: '/vietqr-configsapi',
        // [PUT] /vietqr-configsapi/:id - Cập nhật cấu hình VietQR, body: UpdateVietQRConfigDto
        UPDATE: (id: string) => `/vietqr-configsapi/${id}`,
        // [PUT] /vietqr-configsapi/:id/activate - Đặt cấu hình VietQR có id là active
        SET_ACTIVE: (id: string) => `/vietqr-configsapi/${id}/activate`,
        // (Không có DELETE trong controller)
    },
    // Controller: VoucherController
    VOUCHERS: {
        BASE: '/vouchersapi',
        // [POST] /vouchersapi - Tạo voucher mới, body: CreateVoucherDto
        CREATE: '/vouchersapi',
        // [GET] /vouchersapi - Lấy tất cả voucher (có phân trang, lọc), query: page, limit, isActive
        GET_ALL: '/vouchersapi',
        // [GET] /vouchersapi/valid - Lấy các voucher hợp lệ cho user/sản phẩm/phương thức thanh toán
        GET_VALID: (params?: { productSlug?: string; userId?: string; paymentMethod?: string }) => {
            let url = '/vouchersapi/valid';
            const q = [];
            if (params?.productSlug) q.push(`productSlug=${encodeURIComponent(params.productSlug)}`);
            if (params?.userId) q.push(`userId=${encodeURIComponent(params.userId)}`);
            if (params?.paymentMethod) q.push(`paymentMethod=${encodeURIComponent(params.paymentMethod)}`);
            if (q.length) url += '?' + q.join('&');
            return url;
        },
        // [GET] /vouchersapi/:id - Lấy voucher theo id
        GET_BY_ID: (id: string) => `/vouchersapi/${id}`,
        // [GET] /vouchersapi/code/:code - Lấy voucher theo code
        GET_BY_CODE: (code: string) => `/vouchersapi/code/${encodeURIComponent(code)}`,
        // [GET] /vouchersapi/check/:code - Kiểm tra tính hợp lệ của voucher, query: productSlug, userId, paymentMethod, totalAmount
        CHECK_VALIDITY: (code: string, params?: { productSlug?: string; userId?: string; paymentMethod?: string; totalAmount?: number }) => {
            let url = `/vouchersapi/check/${encodeURIComponent(code)}`;
            const q = [];
            if (params?.productSlug) q.push(`productSlug=${encodeURIComponent(params.productSlug)}`);
            if (params?.userId) q.push(`userId=${encodeURIComponent(params.userId)}`);
            if (params?.paymentMethod) q.push(`paymentMethod=${encodeURIComponent(params.paymentMethod)}`);
            if (params?.totalAmount !== undefined) q.push(`totalAmount=${params.totalAmount}`);
            if (q.length) url += '?' + q.join('&');
            return url;
        },
        // [POST] /vouchersapi/use/:code - Sử dụng voucher
        USE: (code: string) => `/vouchersapi/use/${encodeURIComponent(code)}`,
        // [PATCH] /vouchersapi/:id - Cập nhật voucher, body: Partial<CreateVoucherDto>
        UPDATE: (id: string) => `/vouchersapi/${id}`,
        // [DELETE] /vouchersapi/:id - Xóa voucher
        DELETE: (id: string) => `/vouchersapi/${id}`,
    },
};

// For backward compatibility
export const API_ROUTES = apiRoutes;
