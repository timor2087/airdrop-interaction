import { printInfo as eth } from './chains/mainnet';
import { printInfo as zksync } from './chains/zksync';
import { printInfo as starknet } from './chains/starknet';

async function main() {
    const chain = process.argv[2];
    switch(chain) {
        case 'eth':
            await eth();
            break;
        case 'zksync':
            await zksync();
            break;
        case 'starknet':
            await starknet();
            break;
        default:
            console.log('Please specify a chain (eth、zksync or starknet) as a command-line argument');
    }
}

main();
