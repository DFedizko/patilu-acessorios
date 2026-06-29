export type HttpHeaders = Record<string, string>;
export type HttpParams = Record<string, string | number | boolean | undefined>;

export type HttpRequestConfig<THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams> = {
    headers?: THeaders;
    params?: TParams;
};

export abstract class HttpClient {
    abstract get<Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response>;
    abstract query<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response>;
    abstract post<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response>;
    abstract put<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response>;
    abstract patch<
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(url: string, body: Body, config?: HttpRequestConfig<THeaders, TParams>): Promise<Response>;
    abstract delete<Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ): Promise<Response>;
    abstract setHeaders<THeaders extends HttpHeaders = HttpHeaders>(headers: THeaders): void;
}
