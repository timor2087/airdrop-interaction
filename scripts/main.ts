import { printInfo as eth } from './chains/mainnet';
import { printInfo as zksync } from './chains/zksync';

async function main() {
    const chain = process.argv[2];
    switch(chain) {
        case 'eth':
            await eth();
            break;
        case 'zksync':
            await zksync();
            break;
        default:
            console.log('Please specify a chain (eth or zksync) as a command-line argument');
    }
}

main();
