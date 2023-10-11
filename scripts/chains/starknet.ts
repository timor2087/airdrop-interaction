import * as fs from 'fs';
import PQueue from 'p-queue';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getNonce } from '../api/api';
import { shortenAddress } from '../utils/format';

const queue = new PQueue({ interval: 50, intervalCap: 3 });

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
        const fileName = './scripts/assets/starknet.txt';
        const fileLines = (await fs.promises.readFile(fileName, 'utf8')).split('\n');
    
        const addressPromises = fileLines.map(address => queue.add(() => processAddress(address)));
    
        const addressData = (await Promise.all(addressPromises)).filter(data => data.Txs !== null);
    
        const table = new Table({
            head: ['Index', 'Address', 'Txs'],
            colWidths: [15, 20, 5]
        });
    
        addressData.forEach((data, index) => {
            const txs = parseInt(data.Txs!, 16);
            const coloredTxs = txs > 100 ? chalk.green(txs + '') : txs;

            let printedIndex;

            if(index <= 9) {
                printedIndex = 'Argent-' + (index + 1);
            } else if(index <=34) {
                printedIndex = 'Braavos-1-' + (index - 9);
            } else {
                printedIndex = 'Braavos-2-' + (index - 34);
            } 
            table.push([printedIndex, data.Address, coloredTxs]);
        });
    
        console.log(table.toString());
    } catch (error) {
        console.log(error);   
    }
}
