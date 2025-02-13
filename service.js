const { ethers } = require('ethers');
const kleur = require("kleur");
const axios = require("axios");
const chains = require('./chains');
const provider = chains.testnet.reddio.provider();
const explorer = chains.testnet.reddio.explorer;
const providerSepolia = chains.testnet.sepolia.provider();
const explorerSepolia = chains.testnet.sepolia.explorer;
const fs = require('fs');
const moment = require('moment-timezone');
const delay = chains.utils.etc.delay;
const loading = chains.utils.etc.loadingAnimation;
const header = chains.utils.etc.header;
const timelog = chains.utils.etc.timelog;
const countdown = chains.utils.etc.countdown;
const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));
const BRIDGE_CA = '0xB74D5Dba3081bCaDb5D4e1CC77Cc4807E1c4ecf8';
const solc = require("solc");
const path = require("path");

function appendLog(message) {
  fs.appendFileSync('log.txt', message + '\n');
  fs.appendFileSync('log-reddio.txt', message + '\n');
}
async function dailyTransaction(privateKey) {
    const wallet = new ethers.Wallet(privateKey, provider);
	await loading(`Start Transaction for Wallet ${wallet.address}...`, 2000);
    const tx = {
        to: wallet.address,
        value: ethers.parseEther("0.0001"),
    };
    try {
        const signedTx = await wallet.sendTransaction(tx);
        const receipt = await signedTx.wait(1);
        console.log(kleur.green(`[${timelog()}] Transaction Confirmed: ${explorer.tx(receipt.hash)}`));
	appendLog(`[${timelog()}] Transaction Confirmed: ${explorer.tx(receipt.hash)}`);
    } catch (error) {
        console.error("Error:", error);
	appendLog("Error:", error);
    }
}
async function bridgeTransaction(privateKey) {
    const wallet = new ethers.Wallet(privateKey, providerSepolia);
	await loading(`Start Bridge for Wallet ${wallet.address}...`, 2000);
    const addressWith0x = wallet.address;
    const addressWithout0x = addressWith0x.startsWith("0x") ? addressWith0x.slice(2) : addressWith0x;
    const inputData = `0xce0b63ce000000000000000000000000${addressWithout0x}00000000000000000000000000000000000000000000000000005af3107a400000000000000000000000000000000000000000000000000000000000002dc6c0`;
    const tx = {
        to: BRIDGE_CA,
        value: ethers.parseEther("0.0001"),
        data: inputData,
    };
    try {
        const signedTx = await wallet.sendTransaction(tx);
        const receipt = await signedTx.wait(1);
        console.log(kleur.green(`[${timelog()}] Transaction Confirmed: ${explorerSepolia.tx(receipt.hash)}`));
	appendLog(`[${timelog()}] Transaction Confirmed: ${explorerSepolia.tx(receipt.hash)}`);
    } catch (error) {
        console.error("Error:", error);
	appendLog("Error:", error);
    }
}

async function performCheckin(privateKey) {
  let address;
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    address = await wallet.getAddress();
	await loading(`Start verify faucet task ${wallet.address}...`, 2000);  
    const reddioCheckin = await axios.post(
	"https://points-mainnet.reddio.com/v1/points/verify",
	{
		wallet_address: address,
		task_uuid: "c2cf2c1d-cb46-406d-b025-dd6a00369214",
	},
	{
		headers: {
		"Content-Type": "application/json",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
		},
	 }
	);

    console.log(kleur.green(`[${timelog()}] Checkin Task successful for ${address}`));
    appendLog(`[${timelog()}] Checkin Task successful for ${address}`);
    return {
      reddioCheckin: reddioCheckin.data,
    };
  } catch (error) {
    console.error(
      kleur.yellow(`[${timelog()}] Checkin Task failed for ${address || 'unknown address'}: `),
      error.message
    );
	return;
    throw error;
  }
}
async function transferTask(privateKey) {
  let address;
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    address = await wallet.getAddress();
	await loading(`Start verify tranfer task ${wallet.address}...`, 2000);  
    const reddioTransferTask = await axios.post(
	"https://points-mainnet.reddio.com/v1/points/verify",
	{
		wallet_address: address,
		task_uuid: "c2cf2c1d-cb46-406d-b025-dd6a00369215",
	},
	{
		headers: {
		"Content-Type": "application/json",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
		},
	 }
	);

    console.log(kleur.green(`[${timelog()}] Transfer Task successful for ${address}`));
    appendLog(`[${timelog()}] Transfer Task successful for ${address}`);
    return {
      reddioTransferTask: reddioTransferTask.data,
    };
  } catch (error) {
    console.error(
      kleur.yellow(`[${timelog()}] Transfer Task failed for ${address || 'unknown address'}: `),
      error.message
    );
    appendLog(`[${timelog()}] Transfer Task failed for ${address || 'unknown address'}: ${error.message}`);
	return;
    throw error;
  }
}
async function bridgeTask(privateKey) {
  let address;
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
	await loading(`Start verify bridge task ${wallet.address}...`, 2000);  
    address = await wallet.getAddress();
    const reddioBridgeTask = await axios.post(
	"https://points-mainnet.reddio.com/v1/points/verify",
	{
		wallet_address: address,
		task_uuid: "c2cf2c1d-cb46-406d-b025-dd6a00369216",
	},
	{
		headers: {
		"Content-Type": "application/json",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
		},
	 }
	);

    console.log(kleur.green(`[${timelog()}] Bridge Task successful for ${address}`));
    appendLog(`[${timelog()}] Bridge Task successful for ${address}`);
    return {
      reddioBridgeTask: reddioBridgeTask.data,
    };
  } catch (error) {
    console.error(kleur.yellow(`[${timelog()}] Bridge Task failed for ${address || 'unknown address'}: `), error.message);
    appendLog(`[${timelog()}] Bridge Task failed for ${address || 'unknown address'}: ${error.message}`);
    return;
    throw error;
  }
}
async function deployTask(privateKey) {
  let address;
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
	await loading(`Start verify bridge task ${wallet.address}...`, 2000);  
    address = await wallet.getAddress();
    const reddioDeployTask = await axios.post(
	"https://points-mainnet.reddio.com/v1/points/verify",
	{
		wallet_address: address,
		task_uuid: "c2cf2c1d-cb46-406d-b025-dd6a00369217",
	},
	{
		headers: {
		"Content-Type": "application/json",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
		},
	 }
	);

    console.log(kleur.green(`[${timelog()}] Deploy Task successful for ${address}`));
    return {
      reddioDeployTask: reddioDeployTask.data,
    };
  } catch (error) {
    console.error(
      kleur.yellow(`[${timelog()}] Operation failed for ${address || 'unknown address'}: `),
      error.message
    );
    throw error;
  }
}
async function deployContract(privateKey) {
    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractPath = path.resolve(__dirname, "contract.sol");
        const sourceCode = fs.readFileSync(contractPath, "utf8");
        const input = {
            language: "Solidity",
            sources: {
                "contract.sol": {
                    content: sourceCode,
                },
            },
            settings: {
				evmVersion: "paris",
                outputSelection: {
                    "*": {
                        "*": ["abi", "evm.bytecode.object"],
                    },
                },
            },
        };
        const output = JSON.parse(solc.compile(JSON.stringify(input)));

        const contractName = Object.keys(output.contracts["contract.sol"])[0];
        const abi = output.contracts["contract.sol"][contractName].abi;
        const bytecode = output.contracts["contract.sol"][contractName].evm.bytecode.object;
        await loading(`Start Deploy Contract for Wallet ${wallet.address}...`, 2000);
        console.log(`[${timelog()}] Deploying Contract...`);
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

        const contract = await contractFactory.deploy();

        console.log(kleur.green(`[${timelog()}] Contract deployed at: ${explorer.address(contract.target)}`));

        await contract.deploymentTransaction().wait(1);
        console.log(kleur.green(`[${timelog()}] Deployment hash: ${explorer.tx(contract.deploymentTransaction().hash)}`));
    } catch (error) {
        console.error("Error during process:", error);
    }
}
module.exports = { 
deployTask, 
transferTask, 
bridgeTask, 
performCheckin, 
dailyTransaction, 
bridgeTransaction,
deployContract
};
