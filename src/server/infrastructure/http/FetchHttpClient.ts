import { injectable } from "inversify";
import { HttpClient, type HttpHeaders, type HttpParams, type HttpRequestConfig } from "./HttpClient";

@injectable()
export class FetchHttpClient extends HttpClient {
    private defaultHeaders: HttpHeaders = {};

    setHeaders<THeaders extends HttpHeaders = HttpHeaders>(headers: THeaders): void {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    }

    async get<Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response> {
        return this.request<Response>("GET", url, undefined, config);
    }

    async query<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response> {
        return this.request<Response>("QUERY", url, body, config);
    }

    async post<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response> {
        return this.request<Response>("POST", url, body, config);
    }

    async put<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response> {
        return this.request<Response>("PUT", url, body, config);
    }

    async patch<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response> {
        return this.request<Response>("PATCH", url, body, config);
    }

    async delete<Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response> {
        return this.request<Response>("DELETE", url, undefined, config);
    }

    private async request<Response, Body = unknown>(
        method: string,
        url: string,
        body: Body | undefined,
        config?: HttpRequestConfig,
    ): Promise<Response> {
        const target = this.buildUrl(url, config?.params);
        const headers: HttpHeaders = { ...this.defaultHeaders, ...(config?.headers ?? {}) };
        const hasBody = body !== undefined;
        if (hasBody && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
        const response = await fetch(target, {
            method,
            headers,
            body: hasBody ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText} on ${method} ${url}`);
        return this.parse<Response>(response);
    }

    private buildUrl(url: string, params?: HttpParams): string {
        if (!params) return url;
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) search.append(key, String(value));
        });
        const query = search.toString();
        return query ? `${url}?${query}` : url;
    }

    private async parse<T>(response: Response): Promise<T> {
        const text = await response.text();
        return (text ? JSON.parse(text) : undefined) as T;
    }
}
