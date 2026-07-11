declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_URL: string;
            TEST_DATABASE_URL: string;
            PORT: string;

            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
            CLERK_SECRET_KEY: string;
            NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
            NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string;

            TIKTOK_SHOP_APP_KEY: string;
            TIKTOK_SHOP_APP_SECRET: string;
            TIKTOK_SHOP_ACCESS_TOKEN: string;
            TIKTOK_SHOP_ACCESS_TOKEN_EXPIRES_AT: string;
            TIKTOK_SHOP_REFRESH_TOKEN: string;
            TIKTOK_SHOP_CIPHER: string;

            TIKTOK_ADS_APP_ID: string;
            TIKTOK_ADS_SECRET: string;
            TIKTOK_ADS_ACCESS_TOKEN: string;
            TIKTOK_ADS_ACCESS_TOKEN_EXPIRES_AT: string;
            TIKTOK_ADS_REFRESH_TOKEN: string;
            TIKTOK_ADS_ADVERTISER_ID: string;
        }
    }
}

export {};
