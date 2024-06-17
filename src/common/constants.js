import BigNumber from "bignumber.js";

// Test net
export const TEST_VOY_ADDRESS = "0x6057B637a6d44f34745fAf90D7CF6b02B73D1feF"; // bsc test token
// export const TEST_VOY_ADDRESS = '0x958308f519E954dE54f859fE931C70c3e0bcf448'; // rinkeby
// export const TEST_VOY_ADDRESS = '0x3C55851BD94d6d8c577553982F8C2771Ea2aEDf4'; // kovan
// export const TEST_VOY_ADDRESS = '0x09DCDABA867391015c4DAD1ABA04fd0FF4F1DBcD';

//export const TEST_STAKING_ADDRESS = '0x37bE3310160bA956Afce4Ed427E7B182a85b33F5'; // Goerli
// export const TEST_STAKING_ADDRESS = '0x3b50e11C6d922dE4AED5813b416E373c83c086AE'; // rinkeby
// export const TEST_STAKING_ADDRESS = '0xb7dA4a0e74d9D22e90D12D4aBfC17Be85B828207'; // kovan
// export const TEST_STAKING_ADDRESS = '0xc29A2c04fA0C85faC17045Ac2057a8F1fc16FCed'; 
 export const TEST_STAKING_ADDRESS = "0xE57CD506244B74d9096aB688464d1bfc8Ec7Afdf"; // bsc testnet

export const PREV_TEST_STAKING_ADDRESS = '0x37bE3310160bA956Afce4Ed427E7B182a85b33F5';

export const MAIN_FARMING_ADDRESS = "0x2078Dc0ecC8971653f93fCaee19DEE6d0CC09a6a";
export const TEST_FARMING_ADDRESS = "0xf0E39D8B3E9AAB81d93c8E4c1B5aF85f671a5ab1";
// Main net
export const MAIN_VOY_ADDRESS = "0xef9481115ff33E94d3E28A52D3A8F642bf3521e5";

export const MAIN_STAKING_ADDRESS = "0x1a2Cd2Ce0fE93965487e7AceA9132a5C44477F94";

export const PREV_MAIN_STAKING_ADDRESS = "0x3b50e11C6d922dE4AED5813b416E373c83c086AE"

export const BINANCE_TEST = "https://data-seed-prebsc-1-s1.binance.org:8545/";
// export const BINANCE_TEST = "https://data-seed-prebsc-1-s1.binance.org:8545/";

export const BINANCE_BLOCKEXPLORER_TEST = "https://testnet.bscscan.com/";
// export const BINANCE_BLOCKEXPLORER_TEST = "https://testnet.bscscan.com/";

export const CHAINID_TEST = "0x61";

export const BINANCE_MAIN = "https://bsc-dataseed.binance.org/";

export const BINANCE_BLOCKEXPLORER_MAIN = "https://bscscan.com/";

export const CHAINID_MAIN = "0x01";

export const DECIMAL = 18;

export function toWEI(number){
    return BigNumber(number).shiftedBy(DECIMAL);
}

export function fromWEI(number){
    return BigNumber(number).shiftedBy(-1 * DECIMAL).toNumber();
}

export const mainStartBlockNumber = "15170577";

export const testStartBlockNumber = "7904639";

export const BLOCKS_PER_YEAR = "2385476";