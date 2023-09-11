// async function connect() {
//   if (typeof window.ethereum !== "undefined") {
//     console.log("I see a metamask!");
//     await window.ethereum.request({ method: "eth_requestAccounts" });
//     document.getElementById("connectButton").innerHTML = "Connected!";
//     console.log("Connected!");
//   } else {
//     document.getElementById("connectButton").innerHTML =
//       "Please install metamask!";
//     console.log("No metamask!");
//   }
// }
import { ethers } from "./ethers-6.7.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

// console.log(ethers);

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            console.log("I see a metamask!");
            await window.ethereum.request({ method: "eth_requestAccounts" });
            connectButton.innerHTML = "Connected!";
            console.log("Connected!");
        } catch (e) {
            console.log(e.message);
        }
    } else {
        fundButton.innerHTML = "Please install metamask!";
        console.log("No metamask!");
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(`The balance is: ${ethers.formatEther(balance)}`);
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}....`);
    if (window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // signer / wallet / someone with gas
        // contract that we are interacting eith
        // ^ ABI & Address

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        console.log(signer);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        // const mainContract = ethers.getContractAt(abi, contractAddress, signer);
        console.log(contract.target);

        try {
            const transactionResponse = await contract.fund({
                value: ethers.parseEther(ethAmount),
            });
            console.log("How fast?");
            // await transactionResponse.wait(1);

            // const txs = await transactionResponse.wait(1);
            // const tx = await signer.sendTransaction({
            //     to: contractAddress,
            //     value: ethers.parseEther(ethAmount),
            // });
            // console.log(txs);

            // hey wait for this Tx to finish
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done");
            console.log(transactionResponse);
        } catch (error) {
            console.log(error.message);
            console.log("Hi");
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}....`);
    // listen for this transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, async (transactionReceipt) => {
            // await transactionResponse.wait(2);
            console.log(
                `Completed with ${await transactionReceipt.confirmations()} confirmatons`,
            );

            resolve();
        });
    });
}

// withdraw function

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const transactionResponse = await contract.withdrawal();
            // console.log(transactionResponse);

            await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}
