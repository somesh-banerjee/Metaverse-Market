import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import axios from 'axios'

import {
  nftaddress, marketaddress
} from '../config'


import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import MarketABI from "../artifacts/contracts/Market.sol/NFTMarket.json"

export default function CreatorDashboard() {

    const [nfts,setNFTs] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [sold,setSold] = useState([])

    useEffect(() => {
        loadNFTs()
    }, [])

    const loadNFTs = async() => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
    
        const marketContract = new ethers.Contract(marketaddress, MarketABI.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchItemsCreated()
    
        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                sold: i.sold
            }
            return item
        }))
        const soldItems = items.filter(i => i.sold)
        // console.log(soldItems)
        // console.log(items)
        setSold(soldItems)
        setNFTs(items)
        setLoadingState('loaded') 
    }

    if (loadingState === 'loaded' && !nfts.length) return (
        <h1 className="py-10 px-20 text-3xl">No assets created</h1>
    )
    
    return (
        <div>
            <div className="p-4">
                <h2 className="text-2xl py-2">Items Created</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                    nfts.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                        <img src={nft.image} alt="Image not loaded" className="rounded" />
                        <div className="p-4 bg-black">
                        <p className="text-2xl font-bold text-white">Price - {nft.price} MATIC</p>
                        </div>
                    </div>
                    ))
                }
                </div>
            </div>
            <div className='p-4'>
                <h2 className="text-2xl py-2">Items Sold</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                    sold.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                        <img src={nft.image} alt="Image not loaded" className="rounded" />
                        <div className="p-4 bg-black">
                        <p className="text-2xl font-bold text-white">Price - {nft.price} MATIC</p>
                        </div>
                    </div>
                    ))
                }
                </div>
            </div>
        </div>
    )
}