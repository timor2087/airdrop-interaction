import * as fs from 'fs';
import { Provider } from 'zksync-web3';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const { APIKEY } = process.env;

interface AddressInfo {
    balance: string;
    transactionCount: number;
    lastTransactionTime: number;
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    const MAX_DISPLAY_LENGTH = 9;

    if (address.length <= MAX_DISPLAY_LENGTH) {
        return address;
    }

    const start = address.substring(0, 6);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
}

async function main() {
    const provider = new Provider('https://mainnet.era.zksync.io');

    const fileName = '/home/a186r/dev/airdrop/zksync-era/scripts/address.txt';
    const fileLines = fs.readFileSync(fileName, 'utf8').split('\n');

    const addressPromises = fileLines.map(async (address, index) => {
        await sleep(index * 800);
        const addressInfo = await getAddressInfo(address);
        if (!addressInfo) {
            return {
                balance: "1",
                transactionCount: "1",
                lastTransactionTime: "null"
            };
        }

        const lastTransactionTime = Number(addressInfo.lastTransactionTime);
        const date = new Date(lastTransactionTime);
        const dateString = date.toLocaleDateString();

        const shortenedAddress = shortenAddress(address);
        return {
            Address: shortenedAddress,
            Balance: parseFloat(addressInfo.balance).toFixed(4),
            Txs: addressInfo.transactionCount,
            LastDate: dateString,
        };
    });

    const addressData = await Promise.all(addressPromises);

    console.table(addressData.filter(Boolean), ['Address', 'Balance', 'Txs', 'LastDate']);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
