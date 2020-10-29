import { BigInt } from "@graphprotocol/graph-ts"
import {
  CryptoKittiesSales,
  AuctionCreated,
  AuctionSuccessful,
  AuctionCancelled,
  Pause,
  Unpause
} from "../generated/CryptoKittiesSales/CryptoKittiesSales"
import { Auction, CryptoKitty, Transaction } from "../generated/schema"

// import { log } from '@graphprotocol/graph-ts'

export function handleAuctionCreated(event: AuctionCreated): void {
  // log.debug('Block number: {}, block hash: {}, transaction hash: {}', [
  //   event.block.number.toString(), // "47596000"
  //   event.block.hash.toHexString(), // "0x..."
  //   event.transaction.hash.toHexString(), // "0x..."
  // ])
  let kitty = CryptoKitty.load(event.params.tokenId.toString())
  if (kitty == null) {
    kitty = new CryptoKitty(event.params.tokenId.toString())
    kitty.totalAuctions = BigInt.fromI32(1)
  }
  else {
    kitty.totalAuctions = kitty.totalAuctions.plus(BigInt.fromI32(1));
  }

  let auctionId = event.params.tokenId.toString().concat("-").concat(kitty.totalAuctions.toString())
  let auction = Auction.load(auctionId);
  if (auction == null) {
    auction = new Auction(auctionId)
  }

  // Assign event params to entity
  auction.cryptoKitty = event.params.tokenId.toString()
  auction.seller = event.transaction.from.toHex()
  auction.startingPrice = event.params.startingPrice
  auction.endingPrice = event.params.endingPrice
  auction.initialDuration = event.params.duration

  auction.startedAt = event.block.timestamp
  
  auction.state = "live"

  // Transaction information
  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.type = "create"
  transaction.auction = auctionId
  transaction.timestamp = event.block.timestamp

  transaction.save()  
  auction.save()
  kitty.save()
}

export function handleAuctionSuccessful(event: AuctionSuccessful): void {
  // Fetch cryptokitty entity to get ID for auction id
  let kitty = CryptoKitty.load(event.params.tokenId.toString())
  if (kitty == null) {
    kitty = new CryptoKitty(event.params.tokenId.toString())
    kitty.totalAuctions = BigInt.fromI32(1)
  }

  let auctionId = event.params.tokenId.toString().concat("-").concat(kitty.totalAuctions.toString())
  
  let auction = Auction.load(auctionId);
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
}

export function handleAuctionCancelled(event: AuctionCancelled): void {
  // Fetch cryptokitty entity to get ID for auction id
  let kitty = CryptoKitty.load(event.params.tokenId.toString())
  if (kitty == null) {
    kitty = new CryptoKitty(event.params.tokenId.toString())
    kitty.totalAuctions = BigInt.fromI32(1)
  }

  let auctionId = event.params.tokenId.toString().concat("-").concat(kitty.totalAuctions.toString())
  
  let auction = Auction.load(auctionId);
  if (auction == null) {
    auction = new Auction(auctionId)
    auction.cryptoKitty = event.params.tokenId.toString()
  }

  // Update auction
  auction.endedAt = event.block.timestamp
  auction.state = "cancelled"

  let transaction = new Transaction(event.transaction.hash.toHex())
  transaction.type = "cancelled"
  transaction.auction = auctionId
  transaction.timestamp = event.block.timestamp
  
  transaction.save()
  auction.save()
  kitty.save()
}

export function handlePause(event: Pause): void {}

export function handleUnpause(event: Unpause): void {}
