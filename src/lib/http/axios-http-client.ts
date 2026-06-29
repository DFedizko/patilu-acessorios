import axios, { isAxiosError } from "axios";
import { ApiError } from "@/lib/api-error";
import { createHttpClient, type HttpClient } from "./http-client";

const FALLBACK_HTTP_STATUS = 500;

type ErrorBody = { error?: { code?: string; fields?: Record<string, string[]> } };

const throwApiError = (err: unknown): never => {
    if (isAxiosError(err) && err.response) {
        const status = err.response.status ?? FALLBACK_HTTP_STATUS;
        const errorBody = err.response.data as ErrorBody;
        const code = errorBody?.error?.code ?? "INTERNAL_ERROR";
        const fields = errorBody?.error?.fields;
        throw new ApiError(code, status, fields);
    }
    throw err;
};

export const axiosHttpClient = (baseURL = "/api"): HttpClient => {
    const instance = axios.create({ baseURL });
    return createHttpClient(async ({ method, url, body, config }) => {
        try {
            const { data } = await instance.request({
                method,
                url,
                data: body,
                headers: config?.headers,
                params: config?.params,
            });
            return data;
        } catch (err) {
            throwApiError(err);
        }
    });
};
