export type HttpHeaders = Record<string, string>;
export type HttpParams = Record<string, string | number | boolean | undefined>;

export type HttpRequestConfig<THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams> = {
    headers?: THeaders;
    params?: TParams;
};

export type HttpClient = {
    get: <Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    query: <
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    post: <
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    put: <
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    patch: <
        Response,
        Body = unknown,
        THeaders extends HttpHeaders = HttpHeaders,
        TParams extends HttpParams = HttpParams,
    >(
        url: string,
        body: Body,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    delete: <Response, THeaders extends HttpHeaders = HttpHeaders, TParams extends HttpParams = HttpParams>(
        url: string,
        config?: HttpRequestConfig<THeaders, TParams>,
    ) => Promise<Response>;
    setHeaders: <THeaders extends HttpHeaders = HttpHeaders>(headers: THeaders) => void;
};

type SendRequest = <Response>(input: {
    method: "GET" | "QUERY" | "POST" | "PUT" | "PATCH" | "DELETE";
    url: string;
    body?: unknown;
    config?: HttpRequestConfig;
}) => Promise<Response>;

export const createHttpClient = (send: SendRequest): HttpClient => {
    let defaultHeaders: Record<string, string> = {};
    const withDefaults = (config?: HttpRequestConfig): HttpRequestConfig => ({
        ...config,
        headers: { ...defaultHeaders, ...config?.headers },
    });
    return {
        get: (url, config) => send({ method: "GET", url, config: withDefaults(config) }),
        query: (url, body, config) => send({ method: "QUERY", url, body, config: withDefaults(config) }),
        post: (url, body, config) => send({ method: "POST", url, body, config: withDefaults(config) }),
        put: (url, body, config) => send({ method: "PUT", url, body, config: withDefaults(config) }),
        patch: (url, body, config) => send({ method: "PATCH", url, body, config: withDefaults(config) }),
        delete: (url, config) => send({ method: "DELETE", url, config: withDefaults(config) }),
        setHeaders: (headers) => {
            defaultHeaders = { ...defaultHeaders, ...headers };
        },
    };
};
