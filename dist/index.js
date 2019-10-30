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
const moment = require("moment-timezone");
const http_1 = require("./utils/http");
const logger_1 = require("./utils/logger");
var RssItemFlags;
(function (RssItemFlags) {
    RssItemFlags["unread"] = "unread";
    RssItemFlags["read"] = "read";
    RssItemFlags["starred"] = "starred";
    RssItemFlags["unstarred"] = "unstarred";
})(RssItemFlags = exports.RssItemFlags || (exports.RssItemFlags = {}));
class GrapevineClient {
    constructor(endpoint, httpClient = new http_1.HttpClient()) {
        this.endpoint = endpoint;
        this.httpClient = httpClient;
    }
    authenticate(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.endpoint}${GrapevineClient.AUTH_URL}`;
            const requestParams = {
                password,
                url,
                username,
            };
            const response = yield this.httpClient.get(requestParams);
            if (response.status === 200 && response.data.verification === true) {
                this.initializeCredentials(username, password);
                return true;
            }
            return false;
        });
    }
    getAllGroupsList() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.endpoint}${GrapevineClient.GROUPS_URL}`;
            const requestParams = this.getRequestParams(url);
            const response = yield this.httpClient.get(requestParams);
            if (response.status !== 200) {
                return [];
            }
            return response.data;
        });
    }
    getAllFeeds() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.endpoint}${GrapevineClient.FEED_URL}`;
            const requestParams = this.getRequestParams(url);
            const response = yield this.httpClient.get(requestParams);
            if (response.status !== 200) {
                return [];
            }
            return response.data.map(this.convertToRssFeed);
        });
    }
    getFeedsForGroup(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `${this.endpoint}${GrapevineClient.FEEDS_IN_GROUP_URL}`;
            url = url.replace(/\{id\}/, groupId.toString());
            const requestParams = this.getRequestParams(url);
            const response = yield this.httpClient.get(requestParams);
            if (response.status !== 200) {
                return [];
            }
            return response.data.feeds.map(this.convertToRssFeed);
        });
    }
    getItemsForFeed(feedId, flags = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const flagsString = flags.length > 0 ? `/${flags.join("/")}` : "";
            let url = `${this.endpoint}${GrapevineClient.FEED_ITEMS_URL}`;
            url = url.replace(/\{id\}/, feedId.toString());
            url = url.replace(/\{flags\}/, flagsString);
            const requestParams = this.getRequestParams(url);
            const response = yield this.httpClient.get(requestParams);
            if (response.status !== 200) {
                return [];
            }
            return response.data.map(this.convertToRssItem);
        });
    }
    getItems(flags = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const flagsString = flags.length > 0 ? `/${flags.join("/")}` : "";
            let url = `${this.endpoint}${GrapevineClient.ITEMS_URL}`;
            url = url.replace(/\{flags\}/, flagsString);
            const requestParams = this.getRequestParams(url);
            const response = yield this.httpClient.get(requestParams);
            if (response.status !== 200) {
                return [];
            }
            return response.data.map(this.convertToRssItem);
        });
    }
    setItemStatus(itemId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `${this.endpoint}${GrapevineClient.ITEM_STATUS_URL}`;
            url = url.replace(/\{id\}/, itemId.toString());
            const requestParams = this.getRequestParams(url);
            const data = { flag: status };
            const response = yield this.httpClient.post(data, requestParams);
            if (response.status !== 200) {
                logger_1.Logger.error(`Unable to set item status, status code=${response.status}`);
            }
            return;
        });
    }
    setItemsStatus(itemIds, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.endpoint}${GrapevineClient.ITEMS_STATUS_URL}`;
            const requestParams = this.getRequestParams(url);
            const data = {
                flag: status,
                ids: itemIds,
            };
            const response = yield this.httpClient.patch(data, requestParams);
            if (response.status !== 200) {
                logger_1.Logger.error(`Unable to set item status, status code=${response.status}`);
            }
            return;
        });
    }
    addFeed(title, feedUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.endpoint}${GrapevineClient.FEED_URL}`;
            const requestParams = this.getRequestParams(url);
            const data = {
                title,
                url: feedUrl,
            };
            const response = yield this.httpClient.post(data, requestParams);
            if (response.status !== 200) {
                logger_1.Logger.error(`Unable to add feed`);
                return false;
            }
            return true;
        });
    }
    addGroup(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.endpoint}${GrapevineClient.GROUPS_URL}`;
            const requestParams = this.getRequestParams(url);
            const data = {
                name,
            };
            const response = yield this.httpClient.post(data, requestParams);
            if (response.status !== 200) {
                logger_1.Logger.error(`Unable to add group statusCode=${response.status}`);
                return false;
            }
            return true;
        });
    }
    addFeedToGroup(feedId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.endpoint}${GrapevineClient.FEED_GROUP_URL}`;
            const requestParams = this.getRequestParams(url);
            const data = {
                feed_id: feedId,
                group_id: groupId,
            };
            const response = yield this.httpClient.post(data, requestParams);
            if (response.status !== 200) {
                logger_1.Logger.error(`Unable to add feed to group statusCode=${response.status}`);
                return false;
            }
            return true;
        });
    }
    removeFeedFromGroup(feedId, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.endpoint}${GrapevineClient.FEED_GROUP_URL}`;
            const requestParams = this.getRequestParams(url);
            const data = {
                feed_id: feedId,
                group_id: groupId,
            };
            const response = yield this.httpClient.delete(requestParams, data);
            if (response.status !== 200) {
                logger_1.Logger.error(`Unable to add feed to group statusCode=${response.status}`);
                return false;
            }
            return true;
        });
    }
    getGroupsForFeed(feedId) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `${this.endpoint}${GrapevineClient.GROUPS_FOR_FEED_URL}`;
            url = url.replace(/\{id\}/, feedId.toString());
            const requestParams = this.getRequestParams(url);
            const response = yield this.httpClient.get(requestParams);
            if (response.status !== 200) {
                logger_1.Logger.error(`Unable to retrieve groups for feed, statusCode=${response.status}`);
                return [];
            }
            return response.data.groups;
        });
    }
    deleteFeed(feedId) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `${this.endpoint}${GrapevineClient.FEED_WITH_ID_URL}`;
            url = url.replace(/\{id\}/, feedId.toString());
            const requestParams = this.getRequestParams(url);
            const response = yield this.httpClient.delete(requestParams);
            if (response.status !== 200) {
                logger_1.Logger.error(`Unable to delete feed id = ${feedId}`);
            }
            return;
        });
    }
    initializeCredentials(username, password) {
        this.username = username;
        this.password = password;
        return;
    }
    convertToRssFeed(feedApi) {
        return {
            addedOn: feedApi.added_on,
            id: feedApi.id,
            lastUpdated: feedApi.last_updated,
            title: feedApi.title,
            url: feedApi.url,
        };
    }
    convertToRssItem(itemApi) {
        return {
            author: itemApi.author || undefined,
            categories: itemApi.categories || undefined,
            comments: itemApi.comments || undefined,
            description: itemApi.description || undefined,
            enclosures: itemApi.enclosures || undefined,
            feed: {
                id: itemApi.feed.id,
                title: itemApi.feed.title,
            },
            guid: itemApi.guid,
            id: itemApi.id,
            image: itemApi.image || undefined,
            link: itemApi.link || undefined,
            published: moment(itemApi.published),
            read: itemApi.read,
            starred: itemApi.starred,
            summary: itemApi.summary || undefined,
            title: itemApi.title || undefined,
            updated: moment(itemApi.updated),
        };
    }
    getRequestParams(url) {
        return {
            password: this.password,
            url,
            username: this.username,
        };
    }
}
exports.GrapevineClient = GrapevineClient;
GrapevineClient.AUTH_URL = "/api/v1/account/verify";
GrapevineClient.GROUPS_URL = "/api/v1/group";
GrapevineClient.FEED_GROUP_URL = "/api/v1/feed-group";
GrapevineClient.FEED_URL = "/api/v1/feed";
GrapevineClient.FEED_WITH_ID_URL = `${GrapevineClient.FEED_URL}/{id}`;
GrapevineClient.FEEDS_IN_GROUP_URL = "/api/v1/group/{id}/feeds";
GrapevineClient.GROUPS_FOR_FEED_URL = `${GrapevineClient.FEED_URL}/{id}/groups`;
GrapevineClient.FEED_ITEMS_URL = "/api/v1/items/feed/{id}{flags}";
GrapevineClient.ITEMS_URL = "/api/v1/items{flags}";
GrapevineClient.ITEM_STATUS_URL = "/api/v1/item/{id}/status";
GrapevineClient.ITEMS_STATUS_URL = "/api/v1/items/status";
//# sourceMappingURL=index.js.map