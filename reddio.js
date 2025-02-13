const { ethers } = require('ethers');
const kleur = require("kleur");
const axios = require("axios");
const chains = require('./chains');
const provider = chains.testnet.reddio.provider();
const explorer = chains.testnet.reddio.explorer;
const fs = require('fs');
const moment = require('moment-timezone');
const delay = chains.utils.etc.delay;
const loading = chains.utils.etc.loadingAnimation;
const header = chains.utils.etc.header;
const timelog = chains.utils.etc.timelog;
const countdown = chains.utils.etc.countdown;
const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));
const { CronJob } = require('cron');
const solc = require("solc");
const path = require("path");
const { 
	dailyTransaction, 
	bridgeTransaction, 
	deployContract, 
	deployTask, 
	transferTask, 
	bridgeTask, 
	performCheckin 
} = require('./service');
async function runTransaction() {
    header();
    for (const [index, privateKey] of PRIVATE_KEYS.entries()) {
        try {
            await dailyTransaction(privateKey);
            await bridgeTransaction(privateKey);
            console.log('');
        } catch (error) {
            console.error(kleur.red(`[${timelog()}] Error processing wallet ${index + 1}: ${error.message}`));
        }
    }
}
async function runDaily() {
    header();
	await runTransaction();
	await delay(180000);
    for (const [index, privateKey] of PRIVATE_KEYS.entries()) {
        try {
          await transferTask(privateKey);
          await bridgeTask(privateKey);
          console.log('');
        } catch (error) {
            console.error(kleur.red(`[${timelog()}] Error processing wallet ${index + 1}: ${error.message}`));
        }
    }
}
runDaily();
