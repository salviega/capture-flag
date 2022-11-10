const ethers = require('ethers')
const { RelayProvider } = require('@opengsn/provider')
const { Web3Auth } = require("@web3auth/modal");

const paymasterAddress = "0x7C10d29cfc9951958d8ffF6d9D9c9697A146bf70"
const contractArtifact = require('../../abis/CaptureTheFlag.json')
const contractAbi = contractArtifact.abi

const web3auth = new Web3Auth({
    clientId: "BBykiA78cEd8S4B2-nflNtwb_b7qAMYiL13haKwrAFLvvSrk70OpgKM0RjBQQoqWq6OibD5cLulM9M7e1JfkXQk", // get it from Web3Auth Dashboard
    chainConfig: {
        chainNamespace: "eip155",
        chainId: "0x5",
        rpcTarget: "https://hardworking-winter-firefly.ethereum-goerli.discover.quiknode.pro/54dcaf2b2ff913c18018f9e8bfd66b7fc7523ed2/",
        // Avoid using public rpcTarget in production.
        // Use services like Infura, Quicknode etc
        displayName: "Goerly",
        blockExplorer: "https://goerli.etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum",
    },
});

let theContract
let provider
let gsnProvider

async function initContract() {

    if (!window.ethereum) {
        throw new Error('provider not found')
    }
    window.ethereum.on('accountsChanged', () => {
        console.log('acct');
        window.location.reload()
    })
    window.ethereum.on('chainChanged', () => {
        console.log('chainChained');
        window.location.reload()
    })
    


    //const web3authProvider = await web3auth.connect();

    gsnProvider = await RelayProvider.newProvider({
        provider:  window.ethereum,
        config: {
            loggerConfiguration: { logLevel: 'debug' },
            paymasterAddress
        }
    }).init()

    provider = new ethers.providers.Web3Provider(gsnProvider)

    const network = await provider.getNetwork()

    const contractAddress = "0x47F5b682A0485983E391E6e6cD1e523db2A232C6"
    theContract = new ethers.Contract(
        contractAddress, contractAbi, provider.getSigner())

    await listenToEvents()
    return { contractAddress, network }
}

async function call(){
   await web3auth.initModal();
}

async function contractCall() {
    await window.ethereum.send('eth_requestAccounts')

    const txOptions = { gasPrice: await provider.getGasPrice() }
    const transaction = await theContract.captureTheFlag(txOptions)
    const hash = transaction.hash
    console.log(`Transaction ${hash} sent`)
    const receipt = await transaction.wait()
    console.log(`Mined in block: ${receipt.blockNumber}`)
}

let logview

function log(message) {
    message = message.replace(/(0x\w\w\w\w)\w*(\w\w\w\w)\b/g, '<b>$1...$2</b>')
    if (!logview) {
        logview = document.getElementById('logview')
    }
    logview.innerHTML = message + "<br>\n" + logview.innerHTML
}

async function listenToEvents() {

    theContract.on('FlagCaptured', (previousHolder, currentHolder, rawEvent) => {
        log(`Flag Captured from&nbsp;${previousHolder} by&nbsp;${currentHolder}`)
        console.log(`Flag Captured from ${previousHolder} by ${currentHolder}`)
    })
}

function App() {
    return (
        <div>
            <button onClick={call}>
                Singin
            </button>
            <button onClick={initContract}>
                Init contract
            </button>
            <button id="capture_button" onClick={contractCall}>
                Capture the flag
            </button>
            <div id="logview">

            </div>
        </div>
    );
}

export default App;
