import * as moment from "moment-timezone";
import { HttpClient, HttpRequestConfig } from "./utils/http";
import { Logger } from "./utils/logger";

interface VerifyAuthenticationResponse {
  verification: boolean;
}

export interface RssGroupResponse {
  id: number;
  name: string;
}

interface RssFeedApiResponse {
  added_on: number;
  id: number;
  last_updated: number;
  title: string;
  url: string;
}

export interface RssFeed {
  addedOn: number;
  id: number;
  lastUpdated: number;
  title: string;
  url: string;
}

export interface RssItemImage {
  title?: string;
  url?: string;
}

interface RssItemApiResponse {
  author?: string;
  categories?: string[];
  comments?: string;
  description?: string;
  enclosures?: string[];
  feed: {
    id: number;
    title: string;
  };
  guid: string;
  id: number;
  image?: RssItemImage;
  link?: string;
  published: string; // Joi.date(),
  read: boolean;
  starred: boolean;
  summary?: string;
  title?: string;
  updated: string; // Joi.date(),
}

export interface RssItem {
  author?: string;
  categories?: string[];
  comments?: string;
  description?: string;
  enclosures?: string[];
  feed: {
    id: number;
    title: string;
  };
  guid: string;
  id: number;
  image?: RssItemImage;
  link?: string;
  published: moment.Moment;
  read: boolean;
  starred: boolean;
  summary?: string;
  title?: string;
  updated: moment.Moment;
}

export enum RssItemFlags {
  "unread" = "unread",
  "read" = "read",
  "starred" = "starred",
  "unstarred" = "unstarred",
}

interface RssItemFlagPayload {
  flag: RssItemFlags;
}

interface RssItemsStatusPayload {
  flag: RssItemFlags;
  ids: number[];
}

interface RssAddFeedPayload {
  title: string;
  url: string;
}

interface RssAddGroupPayload {
  name: string;
}

interface RssAddFeedToGroupPayload {
  feed_id: number;
  group_id: number;
}

interface GrapevineStringResponse {
  message: string;
}

export class GrapevineClient {

  private static AUTH_URL = "/api/v1/account/verify";
  private static GROUPS_URL = "/api/v1/group";
  private static FEED_GROUP_URL = "/api/v1/feed-group";
  private static FEED_URL = "/api/v1/feed";
  private static FEED_WITH_ID_URL = `${GrapevineClient.FEED_URL}/{id}`;
  private static FEEDS_IN_GROUP_URL = "/api/v1/group/{id}/feeds";
  private static GROUPS_FOR_FEED_URL = `${GrapevineClient.FEED_URL}/{id}/groups`;
  private static FEED_ITEMS_URL = "/api/v1/items/feed/{id}{flags}";
  private static ITEMS_URL = "/api/v1/items{flags}";
  private static ITEM_STATUS_URL = "/api/v1/item/{id}/status";
  private static ITEMS_STATUS_URL = "/api/v1/items/status";

  private username: string;
  private password: string;

  constructor(
    private endpoint: string,
    private httpClient: HttpClient = new HttpClient(),
  ) { /* */ }

  public async authenticate(username: string, password: string): Promise<boolean> {
    const url = `${this.endpoint}${GrapevineClient.AUTH_URL}`;
    const requestParams: HttpRequestConfig = {
      password,
      url,
      username,
    };
    const response = await this.httpClient.get<VerifyAuthenticationResponse>(requestParams);
    if (response.status === 200 && response.data.verification === true) {
      this.initializeCredentials(username, password);
      return true;
    }
    return false;
  }

  public async getAllGroupsList(): Promise<RssGroupResponse[]> {
    const url = `${this.endpoint}${GrapevineClient.GROUPS_URL}`;
    const requestParams = this.getRequestParams(url);
    const response = await this.httpClient.get<RssGroupResponse[]>(requestParams);
    if (response.status !== 200) {
      return [];
    }
    return response.data;
  }

  public async getAllFeeds(): Promise<RssFeed[]> {
    const url = `${this.endpoint}${GrapevineClient.FEED_URL}`;
    const requestParams = this.getRequestParams(url);
    const response = await this.httpClient.get<RssFeedApiResponse[]>(requestParams);
    if (response.status !== 200) {
      return [];
    }
    return response.data.map(this.convertToRssFeed);
  }

  public async getFeedsForGroup(groupId: number): Promise<RssFeed[]> {
    let url = `${this.endpoint}${GrapevineClient.FEEDS_IN_GROUP_URL}`;
    url = url.replace(/\{id\}/, groupId.toString());
    const requestParams = this.getRequestParams(url);
    const response = await this.httpClient.get<{feeds: RssFeedApiResponse[]}>(requestParams);
    if (response.status !== 200) {
      return [];
    }
    return response.data.feeds.map(this.convertToRssFeed);
  }

  public async getItemsForFeed(feedId: number, flags: RssItemFlags[] = []): Promise<RssItem[]> {
    const flagsString = flags.length > 0 ? `/${flags.join("/")}` : "";
    let url = `${this.endpoint}${GrapevineClient.FEED_ITEMS_URL}`;
    url = url.replace(/\{id\}/, feedId.toString());
    url = url.replace(/\{flags\}/, flagsString);

    const requestParams = this.getRequestParams(url);
    const response = await this.httpClient.get<RssItemApiResponse[]>(requestParams);

    if (response.status !== 200) {
      return [];
    }

    return response.data.map(this.convertToRssItem);
  }

  public async getItems(flags: RssItemFlags[] = []): Promise<RssItem[]> {
    const flagsString = flags.length > 0 ? `/${flags.join("/")}` : "";
    let url = `${this.endpoint}${GrapevineClient.ITEMS_URL}`;
    url = url.replace(/\{flags\}/, flagsString);

    const requestParams = this.getRequestParams(url);
    const response = await this.httpClient.get<RssItemApiResponse[]>(requestParams);

    if (response.status !== 200) {
      return [];
    }

    return response.data.map(this.convertToRssItem);
  }

  public async setItemStatus(itemId: number, status: RssItemFlags): Promise<void> {
    let url = `${this.endpoint}${GrapevineClient.ITEM_STATUS_URL}`;
    url = url.replace(/\{id\}/, itemId.toString());
    const requestParams = this.getRequestParams(url);
    const data: RssItemFlagPayload = {flag: status};
    const response = await this.httpClient.post<RssItemFlagPayload, GrapevineStringResponse>(data, requestParams);

    if (response.status !== 200) {
      Logger.error(`Unable to set item status, status code=${response.status}`);
    }

    return;
  }

  public async setItemsStatus(itemIds: number[], status: RssItemFlags): Promise<void> {
    const url = `${this.endpoint}${GrapevineClient.ITEMS_STATUS_URL}`;
    const requestParams = this.getRequestParams(url);
    const data: RssItemsStatusPayload = {
      flag: status,
      ids: itemIds,
    };
    const response = await this.httpClient.patch<RssItemsStatusPayload, GrapevineStringResponse>(data, requestParams);

    if (response.status !== 200) {
      Logger.error(`Unable to set item status, status code=${response.status}`);
    }

    return;
  }

  public async addFeed(title: string, feedUrl: string): Promise<boolean> {
    const url = `${this.endpoint}${GrapevineClient.FEED_URL}`;
    const requestParams = this.getRequestParams(url);
    const data: RssAddFeedPayload = {
      title,
      url: feedUrl,
    };
    const response = await this.httpClient.post<RssAddFeedPayload, RssFeedApiResponse>(data, requestParams);
    if (response.status !== 200) {
      Logger.error(`Unable to add feed`);
      return false;
    }
    return true;
  }

  public async addGroup(name: string): Promise<boolean> {
    const url = `${this.endpoint}${GrapevineClient.GROUPS_URL}`;
    const requestParams = this.getRequestParams(url);
    const data: RssAddGroupPayload = {
      name,
    };
    const response = await this.httpClient.post<RssAddGroupPayload, RssGroupResponse>(data, requestParams);
    if (response.status !== 200) {
      Logger.error(`Unable to add group statusCode=${response.status}`);
      return false;
    }
    return true;
  }

  public async addFeedToGroup(feedId: number, groupId: number): Promise<boolean> {
    const url = `${this.endpoint}${GrapevineClient.FEED_GROUP_URL}`;
    const requestParams = this.getRequestParams(url);
    const data: RssAddFeedToGroupPayload = {
      feed_id: feedId, // eslint-disable-line @typescript-eslint/camelcase
      group_id: groupId,  // eslint-disable-line @typescript-eslint/camelcase
    };
    const response =
      await this.httpClient.post<RssAddFeedToGroupPayload, {groups: RssGroupResponse}>(data, requestParams);
    if (response.status !== 200) {
      Logger.error(`Unable to add feed to group statusCode=${response.status}`);
      return false;
    }
    return true;
  }

  public async removeFeedFromGroup(feedId: number, groupId: number): Promise<boolean> {
    const url = `${this.endpoint}${GrapevineClient.FEED_GROUP_URL}`;
    const requestParams = this.getRequestParams(url);
    const data: RssAddFeedToGroupPayload = {
      feed_id: feedId,  // eslint-disable-line @typescript-eslint/camelcase
      group_id: groupId,  // eslint-disable-line @typescript-eslint/camelcase
    };
    const response =
    await this.httpClient.delete<RssAddFeedToGroupPayload, {groups: RssGroupResponse}>(requestParams, data);
    if (response.status !== 200) {
      Logger.error(`Unable to add feed to group statusCode=${response.status}`);
      return false;
    }
    return true;
  }

  public async getGroupsForFeed(feedId: number): Promise<RssGroupResponse[]> {
    let url = `${this.endpoint}${GrapevineClient.GROUPS_FOR_FEED_URL}`;
    url = url.replace(/\{id\}/, feedId.toString());
    const requestParams = this.getRequestParams(url);
    const response = await this.httpClient.get<{groups: RssGroupResponse[]}>(requestParams);
    if (response.status !== 200) {
      Logger.error(`Unable to retrieve groups for feed, statusCode=${response.status}`);
      return [];
    }
    return response.data.groups;
  }

  public async deleteFeed(feedId: number): Promise<void> {
    let url = `${this.endpoint}${GrapevineClient.FEED_WITH_ID_URL}`;
    url = url.replace(/\{id\}/, feedId.toString());
    const requestParams = this.getRequestParams(url);
    const response = await this.httpClient.delete<{message: string}, unknown>(requestParams);
    if (response.status !== 200) {
      Logger.error(`Unable to delete feed id = ${feedId}`);
    }
    return;
  }

  private initializeCredentials(username: string, password: string): void {
    this.username = username;
    this.password = password;
    return;
  }

  private convertToRssFeed(feedApi: RssFeedApiResponse): RssFeed {
    return {
      addedOn: feedApi.added_on,
      id: feedApi.id,
      lastUpdated: feedApi.last_updated,
      title: feedApi.title,
      url: feedApi.url,
    };
  }

  private convertToRssItem(itemApi: RssItemApiResponse): RssItem {
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

  private getRequestParams(url: string): HttpRequestConfig {
    return {
      password: this.password,
      url,
      username: this.username,
    };
  }

}
