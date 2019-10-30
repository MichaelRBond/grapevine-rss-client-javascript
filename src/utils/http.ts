import axios, { AxiosPromise, AxiosRequestConfig, ResponseType } from "axios";

enum HttpMethods {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
}

export interface HttpRequestConfig {
  url: string;
  username: string;
  password: string;
}

export interface HttpResponse<T> {
  status: number;
  data: T;
}

export class HttpClient {

  public async get<T>(requestConfig: HttpRequestConfig): Promise<HttpResponse<T>> {
    const axiosConfig = this.buildAxiosConfig(HttpMethods.GET, requestConfig);
    const response = await this.request(axiosConfig);
    return this.buildResponse(response.status, response.data as T);
  }

  public async post<T, K>(data: T, requestConfig: HttpRequestConfig): Promise<HttpResponse<K>> {
    const axiosConfig = this.buildAxiosConfig(HttpMethods.POST, requestConfig, data);
    const response = await this.request(axiosConfig);
    return this.buildResponse(response.status, response.data as K);
  }

  public async patch<T, K>(data: T, requestConfig: HttpRequestConfig): Promise<HttpResponse<K>> {
    const axiosConfig = this.buildAxiosConfig(HttpMethods.PATCH, requestConfig, data);
    const response = await this.request(axiosConfig);
    return this.buildResponse(response.status, response.data as K);
  }

  public async delete<T, K>(requestConfig: HttpRequestConfig, data?: T): Promise<HttpResponse<K>> {
    const axiosConfig = this.buildAxiosConfig(HttpMethods.DELETE, requestConfig, data);
    const response = await this.request(axiosConfig);
    return this.buildResponse(response.status, response.data as K);
  }

  private buildAxiosConfig<T>(method: HttpMethods, requestConfig: HttpRequestConfig, data?: T, responseType: ResponseType = "json"): AxiosRequestConfig {
    return {
      auth: {
        password: requestConfig.password,
        username: requestConfig.username,
      },
      url: requestConfig.url,
      method,
      responseType,
      data,
      validateStatus: (): boolean => true,
    }
  }

  private buildResponse<T>(status: number, data: T): HttpResponse<T> {
    return {
      data,
      status,
    };
  }

  private request<T>(requestConfig: AxiosRequestConfig): AxiosPromise<T> {
    return axios.request(requestConfig);
  }
}
