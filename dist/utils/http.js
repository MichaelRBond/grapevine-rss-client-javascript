"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
var HttpMethods;
(function (HttpMethods) {
    HttpMethods["GET"] = "GET";
    HttpMethods["POST"] = "POST";
    HttpMethods["PATCH"] = "PATCH";
    HttpMethods["PUT"] = "PUT";
    HttpMethods["DELETE"] = "DELETE";
    HttpMethods["OPTIONS"] = "OPTIONS";
})(HttpMethods || (HttpMethods = {}));
class HttpClient {
    get(requestConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const axiosConfig = this.buildAxiosConfig(HttpMethods.GET, requestConfig);
            const response = yield this.request(axiosConfig);
            return this.buildResponse(response.status, response.data);
        });
    }
    post(data, requestConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const axiosConfig = this.buildAxiosConfig(HttpMethods.POST, requestConfig, data);
            const response = yield this.request(axiosConfig);
            return this.buildResponse(response.status, response.data);
        });
    }
    patch(data, requestConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const axiosConfig = this.buildAxiosConfig(HttpMethods.PATCH, requestConfig, data);
            const response = yield this.request(axiosConfig);
            return this.buildResponse(response.status, response.data);
        });
    }
    delete(requestConfig, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const axiosConfig = this.buildAxiosConfig(HttpMethods.DELETE, requestConfig, data);
            const response = yield this.request(axiosConfig);
            return this.buildResponse(response.status, response.data);
        });
    }
    buildAxiosConfig(method, requestConfig, data, responseType = "json") {
        return {
            auth: {
                password: requestConfig.password,
                username: requestConfig.username,
            },
            url: requestConfig.url,
            method,
            responseType,
            data,
            validateStatus: () => true,
        };
    }
    buildResponse(status, data) {
        return {
            data,
            status,
        };
    }
    request(requestConfig) {
        return axios_1.default.request(requestConfig);
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http.js.map