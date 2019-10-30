export interface HttpRequestConfig {
    url: string;
    username: string;
    password: string;
}
export interface HttpResponse<T> {
    status: number;
    data: T;
}
export declare class HttpClient {
    get<T>(requestConfig: HttpRequestConfig): Promise<HttpResponse<T>>;
    post<T, K>(data: T, requestConfig: HttpRequestConfig): Promise<HttpResponse<K>>;
    patch<T, K>(data: T, requestConfig: HttpRequestConfig): Promise<HttpResponse<K>>;
    delete<T, K>(requestConfig: HttpRequestConfig, data?: T): Promise<HttpResponse<K>>;
    private buildAxiosConfig;
    private buildResponse;
    private request;
}
