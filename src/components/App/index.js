import React from "react";
import { CosmosWeb3Auth } from "../CosmosWeb3Auth";
import { ethers } from "ethers";
const { RelayProvider } = require("@opengsn/provider");
const { Web3Auth } = require("@web3auth/modal");

const paymasterAddress = "0x7C10d29cfc9951958d8ffF6d9D9c9697A146bf70";
const contractArtifact = require("../../abis/CaptureTheFlag.json");
const contractAbi = contractArtifact.abi;

let theContract, logview;

function App() {
  const [appWeb3authProvider, setAppWeb3authProvider] = React.useState(null);
  const [provider, setProvider] = React.useState(null);

  const getProvider = () => {
    console.log(":D");
    console.log(appWeb3authProvider);
    console.log(":D");
    console.log(provider);
  };

  const initContract = async () => {
    //   if (!window.ethereum) {
    //     throw new Error("provider not found");
    //   }
    //   window.ethereum.on("accountsChanged", () => {
    //     console.log("acct");
    //     window.location.reload();
    //   });
    //   window.ethereum.on("chainChanged", () => {
    //     console.log("chainChained");
    //     window.location.reload();
    //   });

    //const web3authProvider = await web3auth.connect();

    let gsnProvider = await RelayProvider.newProvider({
      provider: appWeb3authProvider,
      config: {
        loggerConfiguration: { logLevel: "debug" },
        paymasterAddress,
      },
    }).init();

    const _provider = new ethers.providers.Web3Provider(gsnProvider);
    setProvider(_provider);
    const network = await _provider.getNetwork();

    const contractAddress = "0x47F5b682A0485983E391E6e6cD1e523db2A232C6";
    theContract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider.getSigner()
    );

    await listenToEvents();
    return { contractAddress, network };
  };

  const contractCall = async () => {
    //await window.ethereum.send("eth_requestAccounts");
    try {
      provider.getGasPrice().then((response) => console.log(response));
      const txOptions = { gasPrice: await provider.getGasPrice() };
      const transaction = await theContract.captureTheFlag(txOptions);
      const hash = transaction.hash;
      console.log(`Transaction ${hash} sent`);
      const receipt = await transaction.wait();
      console.log(`Mined in block: ${receipt.blockNumber}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={initContract}>Init contract</button>
      <button id="capture_button" onClick={contractCall}>
        Capture the flag
      </button>
      <button onClick={getProvider}>Click</button>
      <div id="logview"></div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <CosmosWeb3Auth setAppWeb3authProvider={setAppWeb3authProvider} />
    </div>
  );
}

export default App;

function log(message) {
  message = message.replace(/(0x\w\w\w\w)\w*(\w\w\w\w)\b/g, "<b>$1...$2</b>");
  if (!logview) {
    logview = document.getElementById("logview");
  }
  logview.innerHTML = message + "<br>\n" + logview.innerHTML;
}

async function listenToEvents() {
  theContract.on("FlagCaptured", (previousHolder, currentHolder, rawEvent) => {
    log(`Flag Captured from&nbsp;${previousHolder} by&nbsp;${currentHolder}`);
    console.log(`Flag Captured from ${previousHolder} by ${currentHolder}`);
  });
}
