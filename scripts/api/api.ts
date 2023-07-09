import axios from 'axios';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();

const { APIKEY, APIKEY_STARKNET, APIKEY_MAINNET } = process.env;

const OKLINK_BASE_URL = 'https://www.oklink.com/api/v5/explorer/';
const STARKNET_BASE_URL = 'https://starknet-mainnet.g.alchemy.com/v2/';
const ETH_BASE_URL = "https://eth-mainnet.g.alchemy.com/v2/";

const provider = new ethers.providers.JsonRpcProvider(`${ETH_BASE_URL}${APIKEY_MAINNET}`);

export interface AddressInfo {
    balance: string;
    ens: string | null;
    transactionCount: number;
    lastTransactionTime: number;
}

export async function getFromAlchemy(baseUrl: string, apiKey: any, method: string, params: any): Promise<string | null> {
    const url = `${baseUrl}${apiKey}`;

    const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: method,
        params: params
    };

    try {
        const response = await axios.post(url, payload);
        return response.data.result;
    } catch (error) {
        console.error(`Failed to get nonce for address ${params.address}: ${error}`);
        return null;
    }
}

export async function getNonce(address: string): Promise<string | null> {
    return await getFromAlchemy(STARKNET_BASE_URL, APIKEY_STARKNET, 'starknet_getNonce', ['latest', address]);
}

export async function getFromOKLink(path: string, params: any): Promise<any | null> {
    const url = `${OKLINK_BASE_URL}${path}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Ok-Access-Key': APIKEY },
            params: params
        });
        return response.data.data[0];
    } catch (error) {
        // console.error('Error fetching data:', error);
        return null;
    }
}

export async function getAddressInfo(chainname: string, address: string): Promise<AddressInfo | null> {
    let addressInfo: AddressInfo = await getFromOKLink('address/address-summary', { chainShortName: chainname, address: address });
    return addressInfo;
}

export async function getENS(address: string): Promise<string | null> {
    try {
        const name = await provider.lookupAddress(address);
        return name;
    } catch (error) {
        return null;
    }
}