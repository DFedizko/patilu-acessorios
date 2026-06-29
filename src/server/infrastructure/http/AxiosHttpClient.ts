import axios, { type AxiosInstance } from "axios";
import { injectable } from "inversify";
import { HttpClient, type HttpHeaders, type HttpParams, type HttpRequestConfig } from "./HttpClient";

@injectable()
export class AxiosHttpClient extends HttpClient {
    private readonly instance: AxiosInstance;

    constructor() {
        super();
        this.instance = axios.create();
    }

    setHeaders<THeaders extends HttpHeaders = HttpHeaders>(headers: THeaders): void {
        Object.assign(this.instance.defaults.headers.common, headers);
    }

    async get<Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response> {
        const { data } = await this.instance.get<Response>(url, this.toAxios(config));
        return data;
    }

    async query<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response> {
        const { data } = await this.instance.request<Response>({
            method: "QUERY",
            url,
            data: body,
            ...this.toAxios(config),
        });
        return data;
    }

    async post<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response> {
        const { data } = await this.instance.post<Response>(url, body, this.toAxios(config));
        return data;
    }

    async put<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response> {
        const { data } = await this.instance.put<Response>(url, body, this.toAxios(config));
        return data;
    }

    async patch<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response> {
        const { data } = await this.instance.patch<Response>(url, body, this.toAxios(config));
        return data;
    }

    async delete<Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response> {
        const { data } = await this.instance.delete<Response>(url, this.toAxios(config));
        return data;
    }

    private toAxios<THeaders extends HttpHeaders, TParams extends HttpParams>(
        config?: HttpRequestConfig<THeaders, TParams>,
    ) {
        return { headers: config?.headers, params: config?.params };
    }
}
