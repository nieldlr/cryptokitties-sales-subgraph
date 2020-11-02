import { BigInt } from "@graphprotocol/graph-ts"
import { Aggregation } from "../generated/schema"

export function getAggregation(): Aggregation {
  let aggregation = Aggregation.load("1")

  if (aggregation == null) {
    // If this is the first time, set defaults
    aggregation = new Aggregation("1")
    aggregation.totalAuctions = BigInt.fromI32(0)
    aggregation.totalAuctionsSold = BigInt.fromI32(0)
    aggregation.totalAuctionsCancelled = BigInt.fromI32(0)
    aggregation.totalUniqueCryptoKittiesAuctioned = BigInt.fromI32(0)
    aggregation.totalUniqueCryptoKittiesSold = BigInt.fromI32(0)
    aggregation.totalUniqueCryptoKittiesCancelled = BigInt.fromI32(0)
    aggregation.totalEtherSold = BigInt.fromI32(0)
  }

  return aggregation as Aggregation
}