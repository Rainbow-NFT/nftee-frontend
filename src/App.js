import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// CURL Imports
// Outdated, IK
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

// chainId Stuff
const NETWORK_NAME = 'Rinkeby';
const ETHERSCAN_PREFIX = 'rinkeby.';
const NETWORK_ID = 4;

// Rinkeby Address
const CONTRACT_ADDRESS = '0xce4346e22dD8288D2971416d29E99DB22385E0A4';

/// Links ///

// Social Media
const TWITTER_HANDLE = 'abran_decarlo';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// Asset Links
const OPENSEA_COLLECTION_LINK = `https://testnets.opensea.io/assets/rainbow-nft`;
const RARIBLE_COLLECTION_LINK = `https://${ETHERSCAN_PREFIX}rarible.com/collection/${CONTRACT_ADDRESS}/items`;
const ETHERSCAN_LINK = `https://${ETHERSCAN_PREFIX}etherscan.io/address/${CONTRACT_ADDRESS}`;

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
        console.log(`Tokens left to mint: ${TOTAL_TOKEN_AMOUNT - Number(body)}`);

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
        console.log(`chainId: ${chainId}`);
        // Rinkeby ChainId == 4
        // Need to detect when network changes rather than only check during first page load.
        if (chainId !== NETWORK_ID) {
          isCorrectNetwork(true);
          console.log(`Wrong network, switch to ${NETWORK_NAME}`);
        } else if (chainId == NETWORK_ID) {
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
        console.log(
          `Mined, see transaction: https://${ETHERSCAN_PREFIX}etherscan.io/tx/${nftTxn.hash}`
        );
        const _tokenId = await connectedContract.currentTokenId();
        setTokenId(TOTAL_TOKEN_AMOUNT - Number(_tokenId));
        /*     const NFT_URI = await connectedContract.tokenURI(_tokenId);
         */
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Change Network
  const changeNetwork = async () => {
    (async () => {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + NETWORK_ID.toString(16) }]
      });
    })();
  };

  // Detect network change
  {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      // Don't remove 'newNetwork' or it gets stuck in an infinite loop
      provider.on('network', (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          window.location.reload();
        }
      });
    }
  }
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
        <span color="black">
          You are connected to the wrong network, please switch to {NETWORK_NAME}{' '}
        </span>
        <div>
          <button onClick={changeNetwork} className="switch-network-button">
            <i>Switch Network</i>
          </button>
        </div>
      </div>
    );
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
    return <div />;
  }

  // This is so lazy lmao
  // TODO: Actually fetch token uri + disallow XSS when enabling this, don't want future footguns
  function RenderTokenURI() {
    return (
      <img
        alt="token-uri"
        className="center"
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHByZXNlcnZlQXNwZWN0UmF0aW89J3hNaW5ZTWluIG1lZXQnIHZpZXdCb3g9JzAgMCAzNTAgMzUwJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPSd1cmwoI3BhdHRlcm4pJyAvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZ3JhZGllbnQnIHgxPScxMDAlJyB5MT0nMTAlJyB4Mj0nMCUnIHkyPScxMCUnPjxzdG9wIG9mZnNldD0nNi4yNSUnIHN0b3AtY29sb3I9JyM4N2ZmZmUnLz48c3RvcCBvZmZzZXQ9JzE4Ljc1JScgc3RvcC1jb2xvcj0nIzg4ZmY4OScvPjxzdG9wIG9mZnNldD0nMzEuMjUlJyBzdG9wLWNvbG9yPScjZjhmNThhJy8+PHN0b3Agb2Zmc2V0PSc1Ni4yNSUnIHN0b3AtY29sb3I9JyNlZjY5NmEnLz48c3RvcCBvZmZzZXQ9JzY4Ljc1JScgc3RvcC1jb2xvcj0nI2YzNmFiYScvPjxzdG9wIG9mZnNldD0nODEuMjUlJyBzdG9wLWNvbG9yPScjZWY2OTZhJy8+PHN0b3Agb2Zmc2V0PSc5My43NSUnIHN0b3AtY29sb3I9JyNmOGY1OGEnLz48c3RvcCBvZmZzZXQ9JzEwMCUnIHN0b3AtY29sb3I9JyM4OGZmODknLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0dGVybiBpZD0ncGF0dGVybicgeD0nMCcgeT0nMCcgd2lkdGg9JzQwMCUnIGhlaWdodD0nMTAwJScgcGF0dGVyblVuaXRzPSd1c2VyU3BhY2VPblVzZSc+PHJlY3QgeD0nLTE1MCUnIHk9JzAnIHdpZHRoPScyMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9J3VybCgjZ3JhZGllbnQpJyB0cmFuc2Zvcm09J3JvdGF0ZSgtNjUpJz48YW5pbWF0ZSBhdHRyaWJ1dGVUeXBlPSdYTUwnIGF0dHJpYnV0ZU5hbWU9J3gnIGZyb209Jy0xNTAlJyB0bz0nNTAlJyBkdXI9JzEwMDAwbXMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjxyZWN0IHg9Jy0zNTAlJyB5PScwJyB3aWR0aD0nMjAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPSd1cmwoI2dyYWRpZW50KScgdHJhbnNmb3JtPSdyb3RhdGUoLTY1KSc+PGFuaW1hdGUgYXR0cmlidXRlVHlwZT0nWE1MJyBhdHRyaWJ1dGVOYW1lPSd4JyBmcm9tPSctMzUwJScgdG89Jy0xNTAlJyBkdXI9JzEwMDAwbXMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjwvcGF0dGVybj48L3N2Zz4="
      />
    );
  }

  /// ============ Return Page ============

  return (
    <div className="App">
      <div className="container">
        <RenderBanner isRightNetwork={correctNetwork} />
        <div className="header-container">
          <p className="header gradient-text">Rainbow NFTs</p>
          <p className="sub-text">Each &quot;uniquely&quot; generated & bitpacked on-chain.</p>
          <RenderButton isConnected={boolBeans} />
        </div>
        <RenderTokenURI />
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
