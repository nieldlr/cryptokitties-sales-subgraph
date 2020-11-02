import { BigInt } from "@graphprotocol/graph-ts"
import {
  CryptoKittiesSales,
  AuctionCreated,
  AuctionSuccessful,
  AuctionCancelled,
  Pause,
  Unpause
} from "../generated/CryptoKittiesSales/CryptoKittiesSales"
import { Aggregation, Auction, CryptoKitty, Transaction } from "../generated/schema"

import {
  getAggregation
} from './helpers'

export function handleAuctionCreated(event: AuctionCreated): void {
  // First up let's get the cryptokitty so we can keep track of the total auctions
  let isNewKitty = false
  let kitty = CryptoKitty.load(event.params.tokenId.toString())

  // Is this a new ketty?
  if (kitty == null) {
    // Yep, let's create it with default value
    isNewKitty = true
    kitty = new CryptoKitty(event.params.tokenId.toString())
    kitty.totalAuctions = BigInt.fromI32(0)
  }

  // Increase total auctions count for this kitty
  kitty.totalAuctions = kitty.totalAuctions.plus(BigInt.fromI32(1));

  // Then let's create a new auction
  let auctionId = event.params.tokenId.toString().concat("-").concat(kitty.totalAuctions.toString())
  let auction = new Auction(auctionId)

  // Assign params to auction entity
  auction.cryptoKitty = event.params.tokenId.toString()
  auction.seller = event.transaction.from.toHex()
  auction.startingPrice = event.params.startingPrice
  auction.endingPrice = event.params.endingPrice
  auction.initialDuration = event.params.duration
  auction.startedAt = event.block.timestamp
  auction.state = "live"

  // Transaction information
  // Let's save transaction info so we can refer/query it if need
  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.type = "create"
  transaction.auction = auctionId
  transaction.timestamp = event.block.timestamp

  // Save
  transaction.save()  
  auction.save()
  kitty.save()

  // Let's wrap this up and aggregate totals
  let aggregation = getAggregation()

  aggregation.totalAuctions = aggregation.totalAuctions.plus(BigInt.fromI32(1))
  if(isNewKitty) {
    aggregation.totalUniqueCryptoKittiesAuctioned = aggregation.totalUniqueCryptoKittiesAuctioned.plus(BigInt.fromI32(1))
  }

  aggregation.save()
}

export function handleAuctionSuccessful(event: AuctionSuccessful): void {
  // Fetch cryptokitty entity to get ID for auction id
  let kitty = CryptoKitty.load(event.params.tokenId.toString())
  if (kitty == null) {
    kitty = new CryptoKitty(event.params.tokenId.toString())
    kitty.totalAuctions = BigInt.fromI32(1)
  }

  // Load Auction
  let auctionId = event.params.tokenId.toString().concat("-").concat(kitty.totalAuctions.toString())
  let auction = Auction.load(auctionId)

  // If for some reason this auction is not present, let's init it
  if (auction == null) {
    auction = new Auction(auctionId)
    auction.cryptoKitty = event.params.tokenId.toString()
  }

  // Update auction
  auction.soldPrice = event.params.totalPrice
  auction.winner = event.params.winner.toHex()
  auction.endedAt = event.block.timestamp
  auction.state = "sold"

  // Transaction information
  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.type = "sold"
  transaction.auction = auctionId
  transaction.timestamp = event.block.timestamp
  
  transaction.save()
  auction.save()
  kitty.save()

  // Let's wrap this up and aggregate totals
  let aggregation = getAggregation()
  aggregation.totalAuctionsSold = aggregation.totalAuctionsSold.plus(BigInt.fromI32(1))
  
  // Is this the first time this kitty has been sold?
  // if(kitty.totalAuctions == 1) {
  //   aggregation.totalUniqueCryptoKittiesSold= aggregation.totalUniqueCryptoKittiesSold.plus(BigInt.fromI32(1))
  // }

  aggregation.save()
}

export function handleAuctionCancelled(event: AuctionCancelled): void {
  // Fetch cryptokitty entity to get ID for auction id
  let kitty = CryptoKitty.load(event.params.tokenId.toString())
  if (kitty == null) {
    kitty = new CryptoKitty(event.params.tokenId.toString())
    kitty.totalAuctions = BigInt.fromI32(1)
  }

  // Load auction
  let auctionId = event.params.tokenId.toString().concat("-").concat(kitty.totalAuctions.toString())
  let auction = Auction.load(auctionId)

  // If for some reason this auction is not present, let's init it
  if (auction == null) {
    auction = new Auction(auctionId)
    auction.cryptoKitty = event.params.tokenId.toString()
  }

  // Update auction
  auction.endedAt = event.block.timestamp
  auction.state = "cancelled"

  // Save transaction information for reference
  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.type = "cancelled"
  transaction.auction = auctionId
  transaction.timestamp = event.block.timestamp
  
  // Save
  transaction.save()
  auction.save()
  kitty.save()

  // Let's wrap this up and aggregate totals
  let aggregation = getAggregation()
  aggregation.totalAuctionsCancelled = aggregation.totalAuctionsCancelled.plus(BigInt.fromI32(1))
  aggregation.save();
  
}

export function handlePause(event: Pause): void {}

export function handleUnpause(event: Unpause): void {}
