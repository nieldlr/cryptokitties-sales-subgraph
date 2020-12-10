# CryptoKitties Sales Subgraphs

This subgraphs tracks all the auctions for CryptoKitties. The schema should hopefully be self-explanatory, but here's more details for those interested in using this subgraph.

## Schema
There are four entities: Aggregation, CryptoKitty, Auction & Transction.
* Aggregation keeps track of overall statistics & data.
* CryptoKitty contains all the details for a specific CryptoKitty & its respective auctions. Also includes some aggregation for that specific kitty.
* Auction contains all information for a specific auction. It also includes each transaction. Important: an auction can have three states: live, sold & cancelled.
* Transaction contains specific information for each transaction that relates to specific auctions.

Refer to the schema.graphl for more additional documentation.

Explore [this subgraph](https://thegraph.com/explorer/subgraph/nieldlr/cryptokitties-sales) further with example queries on the The Graph's Explorer.