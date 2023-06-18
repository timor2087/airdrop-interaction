import * as fs from 'fs';
import axios from 'axios';
import * as dotenv from 'dotenv';
import PQueue from 'p-queue';

dotenv.config();

const { APIKEY } = process.env;

interface AddressInfo {
    balance: string;
    transactionCount: number;
    lastTransactionTime: number;
}

const MAX_DISPLAY_LENGTH = 9;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const queue = new PQueue({ interval: 300, intervalCap: 1 });

async function getAddressInfo(address: string): Promise<AddressInfo | undefined> {
    const url = `https://www.oklink.com/api/v5/explorer/address/address-summary?chainShortName=ZKSYNC&address=${address}`;

    const headers = {
        'Ok-Access-Key': APIKEY,
    };

    try {
        const response = await axios.get(url, { headers });
        return response.data.data[0];
    } catch (error) {
        console.error('Error:', error);
        throw error;
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
    const diffDays = diffTime / MS_PER_DAY;
    return diffDays === 0 ? '今天' : `${diffDays}天前`;
}

async function main() {
    const fileName = '/home/a186r/dev/airdrop/zksync-era/scripts/address.txt';
    const fileLines = fs.readFileSync(fileName, 'utf8').split('\n');

    const addressPromises = fileLines.map(address => queue.add(async () => {
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
    }));

    const addressData = await Promise.all(addressPromises);

    console.table(addressData.filter(Boolean), ['Address', 'Balance', 'Txs', 'DaysFromNow']);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
