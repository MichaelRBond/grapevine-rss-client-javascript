# Grapevine RSS Client - Javascript

Typescript / Javascript client for the [Grapevine RSS Aggregator](https://github.com/MichaelRBond/Grapevine-Rss-Aggregator/).

example usage:

```typescript
import { Grapevine, RssItemFlags } from "components/Grapevine";

// New Grapevine client
const grapevine = new GrapevineClient("https://your.grapevine-rss-domain.com");

// get all the unread items for feed with id 1
const items = await this.props.grapevine.getItemsForFeed(1, [RssItemFlags.unread]);
```

For a complete implementation see the [Grapevine RSS Reader](https://github.com/MichaelRBond/Grapevine-Rss-Reader)

For api/types see the [type definition](https://github.com/MichaelRBond/grapevine-rss-client-javascript/blob/master/dist/index.d.ts)
