// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFT is ERC721URIStorage {
    //Declaring Counter to count tokens in order and assign them token id
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("Somcoin", "SOM") {
        contractAddress = marketplaceAddress;
    }

    //CreateToken fn for minting token; only takes 1 para because rest are defined in contract
    function createToken(string memory tokenURI) public returns (uint) {
        //Increasing the counter and storing it as token id
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        //setTokenURI from erc721uristorage.sol to set URi for token with given ID
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }
}