import { getAddressInfo, getENS } from '../api/api';
import { shortenAddress, calculateDaysFromNow } from './format';

export async function processAddress(chainname: string, address: string) {
    const addressInfo = await getAddressInfo(chainname, address);

    if (!addressInfo) {
        return {
            Address: shortenAddress(address),
            Balance: 0,
            Txs: 0,
            LastDate: 'null',
            DaysFromNow: 'null',
        };
    }

    const lastTransactionTime = Number(addressInfo.lastTransactionTime);
    const date = new Date(lastTransactionTime);

    return {
        Address: shortenAddress(address),
        Balance: parseFloat(addressInfo.balance).toFixed(4),
        Txs: addressInfo.transactionCount,
        LastDate: date.toLocaleDateString(),
        DaysFromNow: calculateDaysFromNow(date),
    };
}

export async function processETHAddress(chainname: string, address: string) {
    const addressInfo = await getAddressInfo(chainname, address);
    let ens = (await getENS(address)) + '';

    if (!addressInfo) {
        return {
            Address: shortenAddress(address),
            ENS: ens,
            Balance: 0,
            Txs: 0,
            LastDate: 'null',
            DaysFromNow: 'null',
        };
    }

    const lastTransactionTime = Number(addressInfo.lastTransactionTime);
    const date = new Date(lastTransactionTime);

    return {
        Address: shortenAddress(address),
        ENS: ens,
        Balance: parseFloat(addressInfo.balance).toFixed(4),
        Txs: addressInfo.transactionCount,
        LastDate: date.toLocaleDateString(),
        DaysFromNow: calculateDaysFromNow(date),
    };
}