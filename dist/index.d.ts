import * as moment from "moment-timezone";
import { HttpClient } from "./utils/http";
export interface RssGroupResponse {
    id: number;
    name: string;
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
export declare enum RssItemFlags {
    "unread" = "unread",
    "read" = "read",
    "starred" = "starred",
    "unstarred" = "unstarred"
}
export declare class GrapevineClient {
    private endpoint;
    private httpClient;
    private static AUTH_URL;
    private static GROUPS_URL;
    private static FEED_GROUP_URL;
    private static FEED_URL;
    private static FEED_WITH_ID_URL;
    private static FEEDS_IN_GROUP_URL;
    private static GROUPS_FOR_FEED_URL;
    private static FEED_ITEMS_URL;
    private static ITEMS_URL;
    private static ITEM_STATUS_URL;
    private static ITEMS_STATUS_URL;
    private username;
    private password;
    constructor(endpoint: string, httpClient?: HttpClient);
    authenticate(username: string, password: string): Promise<boolean>;
    getAllGroupsList(): Promise<RssGroupResponse[]>;
    getAllFeeds(): Promise<RssFeed[]>;
    getFeedsForGroup(groupId: number): Promise<RssFeed[]>;
    getItemsForFeed(feedId: number, flags?: RssItemFlags[]): Promise<RssItem[]>;
    getItems(flags?: RssItemFlags[]): Promise<RssItem[]>;
    setItemStatus(itemId: number, status: RssItemFlags): Promise<void>;
    setItemsStatus(itemIds: number[], status: RssItemFlags): Promise<void>;
    addFeed(title: string, feedUrl: string): Promise<boolean>;
    addGroup(name: string): Promise<boolean>;
    addFeedToGroup(feedId: number, groupId: number): Promise<boolean>;
    removeFeedFromGroup(feedId: number, groupId: number): Promise<boolean>;
    getGroupsForFeed(feedId: number): Promise<RssGroupResponse[]>;
    deleteFeed(feedId: number): Promise<void>;
    private initializeCredentials;
    private convertToRssFeed;
    private convertToRssItem;
    private getRequestParams;
}
