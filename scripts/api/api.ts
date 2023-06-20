import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const { APIKEY } = process.env;

const BASE_URL = 'https://www.oklink.com/api/v5/explorer/';

export interface AddressInfo {
    balance: string;
    transactionCount: number;
    lastTransactionTime: number;
}

export async function get(path: string, params: any): Promise<any | null> {
    const url = `${BASE_URL}${path}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Ok-Access-Key': APIKEY },
            params: params
        });
        return response.data.data[0];
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

export async function getAddressInfo(chainname: string, address: string): Promise<AddressInfo | null> {
    return await get('address/address-summary', { chainShortName: chainname, address: address });
}