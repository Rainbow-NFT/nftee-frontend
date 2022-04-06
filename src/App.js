import React, { useEffect, useState} from "react";
import {ethers} from "ethers";

// ABI Imports
import WowNFT from "./abi/WowNFT.json"

// Styling & Logos
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import opensealogo from './assets/opensea-logo.svg';
import rariblelogo from './assets/rarible-logo.svg';
import etherscanlogo from './assets/etherscan-logo.svg';


/// ============ Constants ============
// Rinkeby Address
const CONTRACT_ADDRESS = "0x26f46Eac23c7De8abcF8c5fE59f8AB51A13B40aF";

// Links
const TWITTER_HANDLE = 'abran_decarlo';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_COLLECTION_LINK = `https://testnets.opensea.io/assets/wow-genbkasdgk`;
const TOTAL_MINT_COUNT = 50;

/// ============ Main App ============

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  /// ============ Wallet Stuff ============

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

  // Connect wallet
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
    } catch (error) {
      console.log(error);
    }
  }

  const mintNFT = async () => {
    // Rinkeby Address
  
    // We try to mint
    try {
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, WowNFT.abi, signer);
        
            console.log("Opening wallet to confirm transaction");
            let nftTxn = await connectedContract.makeAWowNFT();


            console.log("⛏️ Mining in progress... please wait");
            await nftTxn.wait();

            console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        } else {
            console.log("Ethereum object doesn't exist!");
        }
    } catch (error) {
        console.log(error)
    }

}

  /// ============ Render Stuff ============

  // Render Methods
  const renderNotConnectedContainer = () => (
<button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>);

useEffect(() => {
  checkIfWalletIsConnected();
}, [])


  /// ============ Return Page ============

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={mintNFT} className="cta-button connect-wallet-button">
              Mint NFT
            </button>)}
        </div>
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
          >&nbsp;&nbsp;&nbsp;&nbsp;Collection on:&nbsp;&nbsp;</a>
          <a
            className="footer-text"
            href={OPENSEA_COLLECTION_LINK}
            target="_blank"
            rel="noreferrer"
          >{<img alt="Opensea Logo" className="opensea-logo" src={opensealogo} />}</a>
           <a
            className="footer-text"
            
            target="_blank"
            rel="noreferrer"
          >{<img alt="Rarible Logo" className="rarible-logo" src={rariblelogo} />}</a>
          <a
            className="footer-text"
            
            target="_blank"
            rel="noreferrer"
          >{<img alt="Etherscan Logo" className="etherscan-logo" src={etherscanlogo} />}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
