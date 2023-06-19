import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const { APIKEY_STARKNET } = process.env;

const url = `https://starknet-mainnet.g.alchemy.com/v2/${APIKEY_STARKNET}`;

async function main() {
    const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'starknet_getNonce',
        params: [
            "latest",
            "0x0291d13ae22603ab488ec9ef9b20124a9cfd92f11eef0288f4daaed5c9da6bd2"
        ]
    };

    axios.post(url, payload)
        .then((response: { data: { result: any; }; }) => {
            console.log('Block Number:', response.data.result);
        })
        .catch((error: any) => {
            console.error(error);
        });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
