# Metaverse Market for ERC721

The projects creates a simple NFT Marketplace using Nextjs and Solidity which is deployed on Polygon Matic Mumbai Testnet.

Techs used:
 - Nextjs: For building the interface for Marketplace.
 - Solidity: For designing of NFT and Market Smart Contract.
 - IPFS: To store metadata of the NFT
 - Hardhat: To compile and deploy the Solidity contracts.
 - TailWind: For basic styling of the pages.

## Project Setup

1. Clone the repository
```
git clone 
```

2. Install the dependencies
```
npm install
```

3. Create two file and write the respective content of the file:
    - `.secret`: The private key of your crypto account from which you will deploy the contracts
    - `.alchemy_apiKey`: API key for your project in Alchemy

4. Start the local server
```
npm run dev
```

## Components 

Here is a in brief explanantion of all the functions and dependencies used and their purpose in each component.

### Solidity Contracts
There are two contracts one for NFT and another for the Market. 

1. NFT.sol
```js
contract NFT is ERC721URIStorage {
    //Declaring Counter to count tokens in order and assign them token id
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    // To store Market contract address
    address contractAddress;

    //Assigning Market address in constructor
    constructor(address marketplaceAddress) ERC721("Somcoin", "SOM") {
        contractAddress = marketplaceAddress;
    }

    //CreateToken fn for minting token; only takes 1 para because rest are defined in contract
    function createToken(string memory tokenURI) public returns (uint) {
        //Increasing the counter and storing it as token id
        //Calling _mint() from ERC72.sol to Mint the token id and assigning msg.sender as seller.
        //setTokenURI from erc721uristorage.sol to set URi for token with given ID
        // Giving all permission to Market contract by calling setApprovalForAll().
        //Returning the Token id
    }
}
```

2. Market.sol
```

```