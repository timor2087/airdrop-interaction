import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import PQueue from 'p-queue';
import chalk from 'chalk';
import Table from 'cli-table3';

dotenv.config();

const { APIKEY_STARKNET } = process.env;

if (!APIKEY_STARKNET) {
    console.error('Please set the environment variable APIKEY_STARKNET.');
    process.exit(1);
}

const MAX_DISPLAY_LENGTH = 9;
const queue = new PQueue({ interval: 0, intervalCap: 5 });

const url = `https://starknet-mainnet.g.alchemy.com/v2/${APIKEY_STARKNET}`;

interface AddressData {
    Address: string;
    Txs: string | null;
}

async function getNonce(address: string): Promise<string | null> {
    const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'starknet_getNonce',
        params: ["latest", address]
    };

    try {
        const response = await axios.post(url, payload);
        return response.data.result;
    } catch (error) {
        console.error(`Failed to get nonce for address ${address}: ${error}`);
        return null;
    }
}

function shortenAddress(address: string): string {
    if (address.length <= MAX_DISPLAY_LENGTH) {
        return address;
    }

    const start = address.substring(0, 6);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
}

async function processAddress(address: string): Promise<AddressData> {
    const nonce = await getNonce(address);
    const shortenedAddress = shortenAddress(address);

    return {
        Address: shortenedAddress,
        Txs: nonce
    };
}

async function main() {
    const fileName = '/home/a186r/dev/airdrop/zksync-era/scripts/starknet.txt';
    const fileLines = (await fs.promises.readFile(fileName, 'utf8')).split('\n');

    const addressPromises = fileLines.map(address => queue.add(() => processAddress(address)));

    const addressData = (await Promise.all(addressPromises)).filter(data => data.Txs !== null);

    const table = new Table({
        head: ['Index', 'Address', 'Txs'],
        colWidths: [12, 15, 5]
    });

    addressData.forEach((data, index) => {
        const txs = parseInt(data.Txs!, 16);
        const coloredTxs = txs > 30 ? chalk.green(txs + '') : txs;
        const printedIndex = index <= 24 ? 'Braavos' + (index + 1) : 'Argent' + (index - 24);
        table.push([printedIndex, data.Address, coloredTxs]);
    });

    console.log(table.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
