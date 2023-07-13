import * as fs from 'fs';
import PQueue from 'p-queue';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getNonce } from '../api/api';
import { shortenAddress } from '../utils/format';

const queue = new PQueue({ interval: 100, intervalCap: 5 });

interface AddressData {
    Address: string;
    Txs: string | null;
}

async function processAddress(address: string): Promise<AddressData> {
    const nonce = await getNonce(address);
    const shortenedAddress = shortenAddress(address);

    return {
        Address: shortenedAddress,
        Txs: nonce
    };
}

export async function printInfo() {
    try {
        const fileName = '/home/a186r/dev/airdrop/zksync-era/scripts/assets/starknet.txt';
        const fileLines = (await fs.promises.readFile(fileName, 'utf8')).split('\n');
    
        const addressPromises = fileLines.map(address => queue.add(() => processAddress(address)));
    
        const addressData = (await Promise.all(addressPromises)).filter(data => data.Txs !== null);
    
        const table = new Table({
            head: ['Index', 'Address', 'Txs'],
            colWidths: [12, 15, 5]
        });
    
        addressData.forEach((data, index) => {
            const txs = parseInt(data.Txs!, 16);
            const coloredTxs = txs > 100 ? chalk.green(txs + '') : txs;
            const printedIndex = index <= 24 ? 'Braavos' + (index + 1) : 'Argent' + (index - 24);
            table.push([printedIndex, data.Address, coloredTxs]);
        });
    
        console.log(table.toString());
    } catch (error) {
        console.log(error);   
    }
}
