import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// CURL Imports
import request from 'request';

// ABI Imports
import SvgBitpack from './abi/SvgBitpack.json';

// Styling & Logos
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import openseaLogo from './assets/opensea-logo.svg';
import raribleLogo from './assets/rarible-logo.svg';
import etherscanLogo from './assets/etherscan-logo.svg';
import githubLogo from './assets/github-logo.svg';

/// ============ Constants ============

// Rinkeby Address
const CONTRACT_ADDRESS = '0xce4346e22dD8288D2971416d29E99DB22385E0A4';

/// Links ///

// Social Media
const TWITTER_HANDLE = 'abran_decarlo';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// Asset Links
const OPENSEA_COLLECTION_LINK = `https://testnets.opensea.io/assets/rainbow-nft`;
const RARIBLE_COLLECTION_LINK = `https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}/items`;
const ETHERSCAN_LINK = `https://rinkeby.etherscan.io/address/${CONTRACT_ADDRESS}`;

// Github Org Repo
const GITHUB_REPO = `https://github.com/Rainbow-NFT`;

// Token Cap
var TOTAL_TOKEN_AMOUNT = Number(10000);

/// ============ Main App ============

const App = () => {
  const [setCurrentAccount] = useState('');
  const [tokenId, setTokenId] = useState('X');
  const [boolBeans, isBoolBeans] = useState(0);
  const [correctNetwork, isCorrectNetwork] = useState(0);

  /// ============ API REQUEST ============

  // Fetch tokens left
  useEffect(() => {
    request(
      'https://secure-shore-07844.herokuapp.com/currentTokenId',
      function (error, response, body) {
        if (error != null) {
          console.log(error);
        }
        console.log(`API_GET_RESPONSE: OK`);
        console.log(`Tokens left: ${TOTAL_TOKEN_AMOUNT - Number(body)}`);

        // Update tokenId
        setTokenId(TOTAL_TOKEN_AMOUNT - Number(body));
      }
    );
  }, []);

  /// ============ Connect Wallet ============

  // Checks if the browser has Metamask
  const checkIfWalletIsConnected = () => {
    (async () => {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Metamask not installed');
        isBoolBeans(false);
        return;
      } else {
        console.log('Metamask found 🦊', ethereum);
        isBoolBeans(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        console.log(chainId);
        // Rinkeby ChainId == 4
        // Need to detect when network changes rather than only check during first page load.
        if (chainId !== 4) {
          isCorrectNetwork(true);
        } else if (chainId == 4) {
          isCorrectNetwork(false);
        }
      }
    })();
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get Metamask! 🦊');
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  /// ============ Mint NFT ============

  const mintNFT = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, SvgBitpack.abi, signer);
        console.log('Opening wallet to confirm transaction');
        let nftTxn = await connectedContract.mintTo(signer.getAddress());
        console.log('⛏️ Mining in progress... please wait');
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        const _tokenId = await connectedContract.currentTokenId();
        setTokenId(TOTAL_TOKEN_AMOUNT - Number(_tokenId));
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /// ============ Render Stuff ============

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Render Methods
  function RenderNotConnectedContainer() {
    return (
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect to Wallet
      </button>
    );
  }

  function RenderMintUI() {
    return (
      <button onClick={mintNFT} className="cta-button connect-wallet-button">
        Mint NFT
      </button>
    );
  }

  function RenderBannerUI() {
    return (
      <div className="banner">
        <span color="black">You are connected to the wrong network, please switch to Rinkeby.</span>
        <div>
          <button className="switch-network-button">
            <i>Switch Network</i>
          </button>
        </div>
      </div>
    );
  }

  function RenderBlankUI() {
    return <div />;
  }

  /// ============ Props ============

  function RenderButton(props) {
    const isConnected = props.isConnected;

    if (isConnected) {
      return <RenderMintUI />;
    }
    return <RenderNotConnectedContainer />;
  }

  function RenderBanner(props) {
    const isRightNetwork = props.isRightNetwork;
    if (isRightNetwork) {
      return <RenderBannerUI />;
    }
    return <RenderBlankUI />;
  }

  /// ============ Return Page ============

  return (
    <div className="App">
      <div className="container">
        <RenderBanner isRightNetwork={correctNetwork} />
        <div className="header-container">
          <p className="header gradient-text">Rainbow NFTs</p>
          <p className="sub-text">Each &quot;uniquely&quot; generated, bitpacked on-chain.</p>
          <RenderButton isConnected={boolBeans} />
        </div>
        <p className="sub-text">
          {tokenId}/{TOTAL_TOKEN_AMOUNT} NFTs left
        </p>
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
            href={OPENSEA_COLLECTION_LINK}
            target="_blank"
            rel="noreferrer"
          >
            {<img alt="Opensea Logo" className="opensea-logo" src={openseaLogo} />}
          </a>
          <a
            className="footer-text"
            href={RARIBLE_COLLECTION_LINK}
            target="_blank"
            rel="noreferrer"
          >
            {<img alt="Rarible Logo" className="rarible-logo" src={raribleLogo} />}
          </a>
          <a className="footer-text" href={ETHERSCAN_LINK} target="_blank" rel="noreferrer">
            {<img alt="Etherscan Logo" className="etherscan-logo" src={etherscanLogo} />}
          </a>
          <a className="footer-text" href={GITHUB_REPO} target="_blank" rel="noreferrer">
            {<img alt="Github Logo" className="github-logo" src={githubLogo} />}
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
