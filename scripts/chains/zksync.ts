import * as fs from 'fs';
import PQueue from 'p-queue';
import chalk from 'chalk';
import Table from 'cli-table3';
import { processAddress } from '../utils/processAddress';

const queue = new PQueue({ interval: 450, intervalCap: 1 });
const fileName = './scripts/assets/evm.txt';

export async function printInfo() {
    try {
        const fileLines = (await fs.promises.readFile(fileName, 'utf8')).split('\n');

        const chainname = 'zksync';

        const addressPromises = fileLines.map(address => queue.add(() => processAddress(chainname, address)));

        const addressData = await Promise.all(addressPromises);

        // Create a table with the required structure
        const table = new Table({
            head: ['Index', 'Address', 'Balance', 'Txs', 'LastDate'],
            colWidths: [12, 15, 10, 5, 10]
        });
    
        let totalBalance = 0;
        let countDaysFromNowGteSeven = 0;
    
        // Populate table data
        addressData.filter(Boolean).forEach((data, index) => {
            // Balance
            const balance = parseFloat(data.Balance + '');
            totalBalance += balance; // Add the balance to the total
            const coloredBalance = balance < 0.1 ? chalk.red(data.Balance + '') : data.Balance;
    
            // Txs
            let txs = data.Txs;
            const coloredTxs = txs > 100 ? chalk.green(data.Txs + '') : data.Txs;
    
            // DaysFromNow
            let coloredDaysFromNow;
            if (data.DaysFromNow === '今天') {
                coloredDaysFromNow = chalk.green(data.DaysFromNow);
            } else if (data.DaysFromNow === 'null'){
                coloredDaysFromNow = data.DaysFromNow;
            } else {
                const daysFromNow = parseInt(data.DaysFromNow);
                if (daysFromNow >= 7) {
                    countDaysFromNowGteSeven++; // Increase the count if daysFromNow >= 7
                    if (daysFromNow >= 14) {
                        coloredDaysFromNow = chalk.red(daysFromNow + '天前');
                    } else {
                        coloredDaysFromNow = chalk.magenta(daysFromNow + '天前');
                    }
                } else {
                    coloredDaysFromNow = daysFromNow + '天前';
                }
            }
    
            // Index
            const printedIndex = index == 0 ? '🔥' : '🪙 Ledger' + index;
    
            // Add index to the table
            table.push([printedIndex, data.Address, coloredBalance, coloredTxs, coloredDaysFromNow]);
        });
    
        table.push(['Total', '', totalBalance.toFixed(4), '', countDaysFromNowGteSeven]);
    
        // Print table
        console.log(table.toString());
    }
    catch(error) {
        console.error(error);
    }
}