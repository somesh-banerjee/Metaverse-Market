import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from "axios"
import Web3Modal from "web3modal"
import Image from 'next/image'

import {
  nftaddress, marketaddress
} from "../config"

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import MarketABI from "../artifacts/contracts/Market.sol/NFTMarket.json"

export default function Home() {
  // state var nfts to store the nfts
  const [nfts, setNfts] = useState([])
  //state var to show a process is going or not like fetching from smart contract
  const [loadingState, setLoadingState] = useState('not-loaded')
  // state var to store the market
  const [Market, setMarket] = useState(null)

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    loadNFTs()
  }, [])

  const loadNFTs = async() => {
    const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com')
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(marketaddress, MarketABI.abi, provider)
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta  = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenID: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }

  const buyNFT = async(nft) => {
    setVisible(true)
    return
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    //Web3Modal to connect to any wallet present like metamask
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    //Defining the provider from the wallet connection
    const provider = new ethers.providers.Web3Provider(connection)
    //Getting the accounts using getSigner()
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketaddress, MarketABI.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */

    //Have to solve can't convert string to big number

    /*const price = ethers.utils.parseEther(nft.price.toString())
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
      value: p
    })
    await transaction.wait()*/
    loadNFTs()
  }

  //If no nfts are listed than display message
  if(loadingState == 'loaded' && !nfts.length) 
  return (
    <h1 className="px-20 py-10 text-3xl">No items listed</h1>
  )

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        {
          visible && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> The Buy button is under construction </div>
          )
        }
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) =>(
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <Image src={nft.image} alt="Image not loaded" />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} MATIC</p>
                  <button className="w-full bg-blue-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNFT(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
