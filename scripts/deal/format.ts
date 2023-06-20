const MAX_DISPLAY_LENGTH = 9;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function shortenAddress(address: string): string {
    return address.length <= MAX_DISPLAY_LENGTH ? 
        address : 
        `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function calculateDaysFromNow(date: Date): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.round(diffTime / MS_PER_DAY);
    return diffDays === 0 ? '今天' : `${diffDays}`;
}