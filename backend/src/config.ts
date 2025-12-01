import { configDotenv } from "dotenv";

const IS_PROD = process.env.NODE_ENV === "production";

if (!IS_PROD) {
    configDotenv({
        path: "../.env",
    });
}

interface AppConfig {
    IS_PROD: boolean;
    SERVER_PORT: number;
    DATABASE_URL: string;
    GMAIL_EMAIL_ADDRESS: string;
    GMAIL_APP_PASSWORD: string;
    BASE_URL: string;
    SYSTEM_ACCOUNT_PASSWORD: string;
    JWT_SECRET: string;
}

const requiredEnvVars = [
    "DATABASE_URL",
    "GMAIL_EMAIL_ADDRESS",
    "GMAIL_APP_PASSWORD",
    "BASE_URL",
    "SYSTEM_ACCOUNT_PASSWORD",
    "JWT_SECRET",
];

if (
    requiredEnvVars.some((varName) => !process.env[varName])
) {
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
}

const appConfig: AppConfig = {
    IS_PROD,
    SERVER_PORT: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 8000,
    DATABASE_URL: process.env.DATABASE_URL || "",
    GMAIL_EMAIL_ADDRESS: process.env.GMAIL_EMAIL_ADDRESS || "",
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || "",
    BASE_URL: process.env.BASE_URL || "",
    SYSTEM_ACCOUNT_PASSWORD: process.env.SYSTEM_ACCOUNT_PASSWORD || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
};


export default appConfig;