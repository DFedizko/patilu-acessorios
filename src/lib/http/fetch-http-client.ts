import { ApiError } from "@/lib/api-error";
import { createHttpClient, type HttpClient, type HttpParams, type HttpRequestConfig } from "./http-client";

const FALLBACK_HTTP_STATUS = 500;
const DEFAULT_ERROR_CODE = "INTERNAL_ERROR";

type ErrorBody = { error?: { code?: string; fields?: Record<string, string[]> } };

const buildUrl = (baseURL: string, url: string, params?: HttpParams): string => {
    const path = `${baseURL}${url}`;
    if (!params) return path;
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) search.append(key, String(value));
    });
    const query = search.toString();
    return query ? `${path}?${query}` : path;
};

const buildHeaders = (hasBody: boolean, config?: HttpRequestConfig): Record<string, string> => {
    const headers: Record<string, string> = { ...config?.headers };
    if (hasBody && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    return headers;
};

const toApiError = (data: unknown, status: number): ApiError => {
    const error = ((data ?? {}) as ErrorBody).error;
    return new ApiError(error?.code ?? DEFAULT_ERROR_CODE, status || FALLBACK_HTTP_STATUS, error?.fields);
};

export const fetchHttpClient = (baseURL = "/api"): HttpClient => {
    return createHttpClient(async ({ method, url, body, config }) => {
        const hasBody = body !== undefined;
        const response = await fetch(buildUrl(baseURL, url, config?.params), {
            method,
            headers: buildHeaders(hasBody, config),
            body: hasBody ? JSON.stringify(body) : undefined,
        });
        const text = await response.text();
        const data = text ? JSON.parse(text) : undefined;
        if (response.ok) return data;
        throw toApiError(data, response.status);
    });
};
