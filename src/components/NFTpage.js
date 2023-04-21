import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");
async function getNFTData(tokenId) {
  const ethers = require("ethers");
  //After adding your Hardhat network to your metamask, this code will get providers and signers
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const addr = await signer.getAddress();
  //Pull the deployed contract instance
  let contract = new ethers.Contract(
    MarketplaceJSON.address,
    MarketplaceJSON.abi,
    signer
  );
  //create an NFT Token
  const tokenURI = await contract.tokenURI(tokenId);
  const listedToken = await contract.getListedTokenForId(tokenId);
  let meta = await axios.get(tokenURI);
  meta = meta.data;
  console.log(listedToken);

  let item = {
    price: meta.price,
    tokenId: tokenId,
    seller: listedToken.seller,
    owner: listedToken.owner, //the contract address
    image: meta.image,
    name: meta.name,
    description: meta.description,
  };
  console.log(item);
  updateData(item);
  updateDataFetched(true);
  console.log("address", addr);
  updateCurrAddress(addr);
}
async function buyNFT(tokenId) {
  try {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    //Pull the deployed contract instance
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
    const salePrice = ethers.utils.parseUnits(data.price, "ether");
    updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
    //run the executeSale function
    let transaction = await contract.executeSale(tokenId, { value: salePrice });
    await transaction.wait();

    alert("You successfully bought the NFT!");
    updateMessage("");
  } catch (e) {
    alert("Upload Error" + e);
  }
}

const params = useParams();
const tokenId = params.tokenId;
if (!dataFetched) getNFTData(tokenId);

return (
  <div style={{ minHeight: "100vh" }}>
    <Navbar />
    <div className="flex mt-20 ml-20">
      <img src={data.image} alt="" className="w-2/5" />
      <div className="p-5 ml-20 space-y-8 text-xl text-white border-2 rounded-lg shadow-2xl">
        <div>Name: {data.name}</div>
        <div>Description: {data.description}</div>
        <div>
          Price: <span className="">{data.price + " ETH"}</span>
        </div>
        <div>
          Owner: <span className="text-sm">{data.owner}</span>
        </div>
        <div>
          Seller: <span className="text-sm">{data.seller}</span>
        </div>
        <div>
          {currAddress == data.owner || currAddress == data.seller ? (
            <button
              className="px-4 py-2 text-sm font-bold text-white bg-blue-500 rounded enableEthereumButton hover:bg-blue-700"
              onClick={() => buyNFT(tokenId)}>
              Buy this NFT
            </button>
          ) : (
            <div className="text-emerald-700">
              You are the owner of this NFT
            </div>
          )}

          <div className="mt-3 text-center text-green">{message}</div>
        </div>
      </div>
    </div>
  </div>
);
}