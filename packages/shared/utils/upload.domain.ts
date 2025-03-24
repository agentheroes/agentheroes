export const uploadDomain = (refer?: string) => {
    if (process.env.STORAGE_PROVIDER !== "local") {
        return "";
    }

    if (process.env.STORAGE_PROVIDER === "local" && process.env.WEBSITE_URL) {
        return process.env.WEBSITE_URL;
    }

    if (refer) {
        return new URL(refer).origin;
    }

    throw new Error('cant upload');
}