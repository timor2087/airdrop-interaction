import * as fs from 'fs';
import axios from 'axios';
import * as dotenv from 'dotenv';
import PQueue from 'p-queue';
import chalk from 'chalk';
import Table from 'cli-table3';

dotenv.config();

const { APIKEY } = process.env;

interface AddressInfo {
    balance: string;
    transactionCount: number;
    lastTransactionTime: number;
}

const MAX_DISPLAY_LENGTH = 9;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const queue = new PQueue({ interval: 320, intervalCap: 1 });

async function getAddressInfo(address: string): Promise<AddressInfo | null> {
    const url = `https://www.oklink.com/api/v5/explorer/address/address-summary?chainShortName=ZKSYNC&address=${address}`;

    const headers = {
        'Ok-Access-Key': APIKEY,
    };

    try {
        const response = await axios.get(url, { headers });
        return response.data.data[0];
    } catch (error) {
        console.error('Error fetching data for address:', address, error);
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

function calculateDaysFromNow(date: Date): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.round(diffTime / MS_PER_DAY);
    return diffDays === 0 ? '今天' : `${diffDays}`;
}

async function processAddress(address: string) {
    const addressInfo = await getAddressInfo(address);
    const shortenedAddress = shortenAddress(address);

    if (!addressInfo) {
        return {
            Address: shortenedAddress,
            Balance: '0',
            Txs: '0',
            LastDate: 'null',
            DaysFromNow: 'null',
        };
    }

    const lastTransactionTime = Number(addressInfo.lastTransactionTime);
    const date = new Date(lastTransactionTime);
    const daysFromNow = calculateDaysFromNow(date);

    return {
        Address: shortenedAddress,
        Balance: parseFloat(addressInfo.balance).toFixed(4),
        Txs: addressInfo.transactionCount,
        LastDate: date.toLocaleDateString(),
        DaysFromNow: daysFromNow,
    };
}

async function main() {
    const fileName = '/home/a186r/dev/airdrop/zksync-era/scripts/address.txt';
    const fileLines = (await fs.promises.readFile(fileName, 'utf8')).split('\n');

    const addressPromises = fileLines.map(address => queue.add(() => processAddress(address)));

    const addressData = await Promise.all(addressPromises);

    // Define table structure
    const table = new Table({
        head: ['Index', 'Address', 'Balance', 'Txs', 'LastDate'],
        colWidths: [12, 15, 10, 5, 10]
    });

    let totalBalance = 0;
    let countDaysFromNowGteSeven = 0;

    // Populate table data
    addressData.filter(Boolean).forEach((data, index) => {
        // Balance
        const balance = parseFloat(data.Balance);
        totalBalance += balance; // Add the balance to the total
        const coloredBalance = balance < 0.1 ? chalk.red(data.Balance) : data.Balance;

        // Txs
        let txs = data.Txs;
        const coloredTxs = txs > 50 ? chalk.green(data.Txs + '') : data.Txs;

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
        const printedIndex = index == 0 ? '0xcA82' : index;

        // Add index to the table
        table.push([printedIndex, data.Address, coloredBalance, coloredTxs, coloredDaysFromNow]);
    });

    table.push(['Total', '', totalBalance.toFixed(4), '', countDaysFromNowGteSeven]);

    // Print table
    console.log(table.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
