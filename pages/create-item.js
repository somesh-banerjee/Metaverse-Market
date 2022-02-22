import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import Image from 'next/image'

//IPFS variable
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, marketaddress
} from '../config'


import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import MarketABI from "../artifacts/contracts/Market.sol/NFTMarket.json"

export default function CreateItem() {
    //state variable for storing ipfs url of file
    const [fileUrl, setFileUrl] = useState(null)
    //state variable for storing form inputs
    const [formInput, updateFormInput] = useState({
        price: '',
        name: '',
        description: ''
    })
    //state variable for storing form inputs
    const [emptyFormError, setemptyFormError] = useState(false)
    //state variable for token ID
    const [tokenId, settokenId] = useState(null)
    //to route back to homepage
    const router = useRouter()

    //fn to call when file is selected in form
    const onChange = async(e) => {
        const file = e.target.files[0]
        //trying to upload to ipfs
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            //creating ipfs url with the hash
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (error) {
            console.log(error);
        }
    }

    //fn to call when form is submitted
    const onSubmit = async(e) => {
        setemptyFormError(false)
        const { name, description, price } = formInput
        //Cancelling the call if any field is empty and calling a error message
        if(!name || !description || !price || !fileUrl) {
            setemptyFormError(true)
            return
        }
        //changing the inputs to JSON format
        const data = JSON.stringify({
            name, description, image: fileUrl
        })

        //Trying to add the meta data in IPFS and creating the sale
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
        //Making connection with wallet
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)  
        //Getting accounts  
        const signer = provider.getSigner()
        //Contract instance for NFT
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)

        //Creating the NFT
        let transaction = await contract.createToken(url)
        console.log(transaction);
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        settokenId(value.toNumber())
    }

    const listSale = async() => {
        //Making connection with wallet
        if(tokenId === null) return
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)  
        //Getting accounts  
        const signer = provider.getSigner()
        /* then list the item for sale on the marketplace */
        let contract = new ethers.Contract(marketaddress, MarketABI.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')
        let transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
        await transaction.wait()
        //After successful listing redirecting to home page
        router.push('/')
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                {
                    emptyFormError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> Enter value for all fields </div>
                    )
                }
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
                    placeholder='Asset Price in MATIC'
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
                        <Image className='rounded mt-4' width='350' alt="" src={fileUrl} />
                    )
                }
                <button onClick={onSubmit} className='font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg'>
                    Create Digital Asset
                </button>
                <button onClick={listSale} className='font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg'>
                    List the Digital Asset
                </button>
            </div>
        </div>
    )
}