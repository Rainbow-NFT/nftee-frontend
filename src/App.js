import React, { useEffect, useState} from "react";
import {ethers} from "ethers";

// CURL Imports
import request from 'request'

// ABI Imports
import SvgBitpack from "./abi/SvgBitpack.json"

// Styling & Logos
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import opensealogo from './assets/opensea-logo.svg';
import rariblelogo from './assets/rarible-logo.svg';
import etherscanlogo from './assets/etherscan-logo.svg';
import githublogo from './assets/github-logo-white.svg';

/// ============ Constants ============

// Rinkeby Address
const CONTRACT_ADDRESS = "0xce4346e22dD8288D2971416d29E99DB22385E0A4";

/// Links ///

// Social Media
const TWITTER_HANDLE = 'abran_decarlo';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// Asset Links
const OPENSEA_COLLECTION_LINK = `https://testnets.opensea.io/assets/rainbow-nft`;
const RARIBLE_COLLECTION_LINK = `https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}/items`;
const ETHERSCAN_LINK = `https://rinkeby.etherscan.io/address/${CONTRACT_ADDRESS}`;

// Github Org Repo
const GITHUB_REPO =  `https://github.com/Rainbow-NFT`;

// Token Cap
var TOTAL_TOKEN_AMOUNT = Number(10000);

/// ============ Main App ============

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [tokenId, setTokenId] = React.useState('X');

  /// ============ API REQUEST ============
  
  // Fetch tokens left
  useEffect(() => {
    request('https://secure-shore-07844.herokuapp.com/currentTokenId', function (error, response, body) {
    
      if (error != null) {
        console.log(error)
      }
        console.log(response)
        console.log(`Tokens left: ${TOTAL_TOKEN_AMOUNT - Number(body)}`);
  
        // Update tokenId
        setTokenId(TOTAL_TOKEN_AMOUNT - Number(body));
      });
  }, []);

   /// ============ Connect Wallet ============

    // Checks if the browser has Metamask
  const checkIfWalletIsConnected = () => {
    const {ethereum} = window;
    if (!ethereum) {
    console.log("Metamask not installed");
    return;
  } else {
    console.log("🦊 Metamask found", ethereum);
  }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get 🦊 Metamask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      /* setupEventListener() */
    } catch (error) {
      console.log(error);
    }
  }

  /// ============ Mint NFT ============

  const mintNFT = async () => {
    try {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, SvgBitpack.abi, signer);
            console.log("Opening wallet to confirm transaction");
            let nftTxn = await connectedContract.mintTo(signer.getAddress());
            console.log("⛏️ Mining in progress... please wait");
            await nftTxn.wait();
            console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
            const _tokenId = await connectedContract.currentTokenId();
            setTokenId(TOTAL_TOKEN_AMOUNT - Number(_tokenId));
           
        } else {
            console.log("Ethereum object doesn't exist!");
        }
    } catch (error) {
        console.log(error)
    }

  }

  /// ============ Render Stuff ============

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  // Render Methods
  function RenderNotConnectedContainer() {
    return <button onClick={connectWallet} className="cta-button connect-wallet-button">
    Connect to Wallet
  </button>;
  }
  
  function RenderMintUI() {
    return <button onClick={mintNFT} className="cta-button connect-wallet-button">
    Mint NFT
    </button>;
  }  

  function RenderButton(props) {
    const isConnected = props.isConnected;
    if (isConnected) {
      return <RenderMintUI/>;
    }
    return <RenderNotConnectedContainer/>;
  }
  
  
  /// ============ Return Page ============

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Rainbow NFTs</p>
          <p className="sub-text">
            Each uniquely generated, bitpacked on-chain.
          </p>
          <RenderButton isConnected = {true} />
        </div>
        <p className="sub-text">{tokenId}/{TOTAL_TOKEN_AMOUNT} NFTs left</p>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
           <a
            className="footer-text"
            target="_blank"
            rel="noreferrer"
            // just use CSS later lmao
          >&nbsp;&nbsp;&nbsp;&nbsp;View Collection on:&nbsp;&nbsp;</a>
          <a
            className="footer-text"
            href={OPENSEA_COLLECTION_LINK}
            target="_blank"
            rel="noreferrer"
          >{<img alt="Opensea Logo" className="opensea-logo" src={opensealogo} />}</a>
           <a
            className="footer-text"
            href={RARIBLE_COLLECTION_LINK}
            target="_blank"
            rel="noreferrer"
          >{<img alt="Rarible Logo" className="rarible-logo" src={rariblelogo} />}</a>
          <a
            className="footer-text"
            href={ETHERSCAN_LINK}
            target="_blank"
            rel="noreferrer"
          >{<img alt="Etherscan Logo" className="etherscan-logo" src={etherscanlogo} />}</a>
           <a
            className="footer-text"
            target="_blank"
            rel="noreferrer"
            // This is why I don't do much frontend
          >&nbsp;&nbsp;&nbsp;&nbsp;Repo:&nbsp;&nbsp;</a>
           <a
            className="footer-text"
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
          >{<img alt="Github Logo" className="github-logo" src={githublogo} />}</a>
        </div>
      </div>
    </div>
  );
};

export default App;