import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, marketaddress
} from '../config'


import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import MarketABI from "../artifacts/contracts/Market.sol/NFTMarket.json"

export default function createItem() {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({
        price: '',
        name: '',
        description: ''
    })

    const onChange = async(e) => {
        const file = e.target.files[0]
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (error) {
            console.log(error);
        }
    }

    const onSubmit = async(e) => {
        const { name, description, price } = formInput
        if(!name || !description || !price || !fileUrl) return
        const data = JSON.stringify({
            name, description, image: fileUrl
        })

        try {
            const added = await client.add(
                data,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            createSale(url)
        } catch (error) {
            console.log(error);
        }
    }

    const createSale = async(url) => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)    
        const signer = provider.getSigner()
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        console.log(transaction);
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        /* then list the item for sale on the marketplace */
        contract = new ethers.Contract(marketaddress, MarketABI.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
        await transaction.wait()
        //After successful listing redirecting to home page
        router.push('/')
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input
                    placeholder='Asset Name'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({
                        ...formInput, name: e.target.value
                    }) }
                />
                <textarea
                    placeholder='Asset Description'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({
                        ...formInput, description: e.target.value
                    }) }
                />
                <input
                    placeholder='Asset Price in Eth'
                    className='mt-8 border rounded p-4'
                    onChange={e => updateFormInput({
                        ...formInput, price: e.target.value
                    }) }
                />
                <input
                    type='file'
                    name='Asset'
                    className='my-4'
                    onChange={onChange}
                />
                {
                    fileUrl && (
                        <img className='rounded mt-4' width='350' src={fileUrl} />
                    )
                }
                <button onClick={onSubmit} className='font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg'>
                    Create Digital Asset
                </button>
            </div>
        </div>
    )
}