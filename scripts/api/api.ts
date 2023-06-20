import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const { APIKEY } = process.env;

const OKLINK_API = 'https://www.oklink.com/api/v5/explorer/address/address-summary?chainShortName=eth';

export interface AddressInfo {
    balance: string;
    transactionCount: number;
    lastTransactionTime: number;
}

export async function getAddressInfo(address: string): Promise<AddressInfo | null> {
    const url = `${OKLINK_API}&address=${address}`;

    try {
        const response = await axios.get(url, { headers: { 'Ok-Access-Key': APIKEY } });
        return response.data.data[0];
    } catch (error) {
        console.error('Error fetching data for address:', address, error);
        return null;
    }
}
