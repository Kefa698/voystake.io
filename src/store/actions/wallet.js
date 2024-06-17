import Web3 from "web3";
import BigNumber from "bignumber.js";
import { numberWithCommas } from "../../utils/helper.js";

import {
  CONNECT_WALLET,
  DISCONNECT_WALLET,
  SPINNER_SHOW,
  STAKE_VALUE,
  UNSTAKE_VALUE,
  TOAST_SHOW,
  EXPORT_ALLSTAKES,
  GET_BALANCEOFREWARDS,
  GET_HISTORY,
} from "./actionType";

import voyABI from "../../ABI/test/voyABI.json";
import stakingABI from "../../ABI/test/stakingABI.json";
import farmingABI from "../../ABI/test/farmingABI.json";
// import stakingABI from '../../ABI/main/stakingABI.json';

import {
  toWEI,
  MAIN_STAKING_ADDRESS,
  MAIN_VOY_ADDRESS,
  TEST_STAKING_ADDRESS,
  TEST_VOY_ADDRESS,
  BINANCE_TEST,
  BINANCE_BLOCKEXPLORER_TEST,
  CHAINID_TEST,
  BINANCE_MAIN,
  BINANCE_BLOCKEXPLORER_MAIN,
  CHAINID_MAIN,
  fromWEI,
  testStartBlockNumber,
  mainStartBlockNumber,
  BLOCKS_PER_YEAR,
  MAIN_FARMING_ADDRESS,
  TEST_FARMING_ADDRESS,
} from "../../common/constants";
import { PRODUCTION_MODE } from "../../common/config";

const STAKING_ADDRESS = PRODUCTION_MODE
  ? MAIN_STAKING_ADDRESS
  : TEST_STAKING_ADDRESS;
const FARMING_ADDRESS = PRODUCTION_MODE
  ? MAIN_FARMING_ADDRESS
  : TEST_FARMING_ADDRESS;
const VOY_ADDRESS = PRODUCTION_MODE ? MAIN_VOY_ADDRESS : TEST_VOY_ADDRESS;
const BINANCE_NET = PRODUCTION_MODE ? BINANCE_MAIN : BINANCE_TEST;
const BINANCE_EXPLORER = PRODUCTION_MODE
  ? BINANCE_BLOCKEXPLORER_MAIN
  : BINANCE_BLOCKEXPLORER_TEST;
const CHAINID = PRODUCTION_MODE ? CHAINID_MAIN : CHAINID_TEST;

const appChain = PRODUCTION_MODE ? "eth" : "goerli";
const startBlockNumber = PRODUCTION_MODE
  ? mainStartBlockNumber
  : testStartBlockNumber;

export function spinnerShow(show = false, message = "") {
  return (dispatch) => {
    dispatch({
      type: SPINNER_SHOW,
      payload: {
        show: show,
        message: message,
      },
    });
  };
}

export function toastState(
  _toastShow = false,
  _toastType = "success",
  _toastMessage = ""
) {
  return (dispatch) => {
    dispatch({
      type: TOAST_SHOW,
      payload: {
        toastShow: _toastShow,
        toastType: _toastType,
        toastMessage: _toastMessage,
      },
    });
  };
}

function decimalAdjust(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === "undefined" || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split("e");
  value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
  // Shift back
  value = value.toString().split("e");
  return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
}

// Decimal floor
export const floor = (value, exp) => decimalAdjust("floor", value, exp);

export const getPoolApr = (totalStaked, tokenPerBlock) => {
  console.log("totalStaked", totalStaked);
  console.log("tokenPerBlock", tokenPerBlock);
  const totalRewardPerYear = new BigNumber(tokenPerBlock).times(
    BLOCKS_PER_YEAR
  );
  const totalStakingTokenInPool = new BigNumber(totalStaked);
  const apr = totalRewardPerYear.div(totalStakingTokenInPool).times(100);
  return apr.isNaN() || !apr.isFinite() ? null : apr.toNumber();
};

export function connectWallet(flag) {
  return async (dispatch) => {
    try {
      if (window.ethereum === undefined || !window.ethereum.isMetaMask) {
        dispatch(disconnectWallet());
        dispatch(spinnerShow(true, "Please install MetaMask..."));
        return;
      }

      if (!flag) {
        dispatch(spinnerShow(true, "Updating Data..."));
      } else {
        dispatch(spinnerShow(true, "Connecting Wallet..."));
      }

      let web3Provider;

      if (window.ethereum) {
        web3Provider = window.ethereum;
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
          console.error("Error requesting accounts:", error);
          dispatch(spinnerShow(false));
          dispatch(toastState(true, "error", "Failed to connect wallet. Please try again."));
          return;
        }
      } else if (window.web3) {
        web3Provider = window.web3.currentProvider;
      } else {
        web3Provider = new Web3.providers.HttpProvider(BINANCE_NET);
      }

      if (!web3Provider) {
        console.error("No web3 provider found.");
        dispatch(spinnerShow(false));
        dispatch(toastState(true, "error", "No web3 provider found. Please install MetaMask."));
        return;
      }

      const web3 = new Web3(web3Provider);

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAINID }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: CHAINID,
                  chainName: "BSC Mainnet",
                  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                  rpcUrls: [BINANCE_NET],
                  blockExplorerUrls: [BINANCE_EXPLORER],
                },
              ],
            });
          } catch (addError) {
            console.error("Error adding chain:", addError);
            dispatch(spinnerShow(false));
            dispatch(toastState(true, "error", "Failed to switch network. Please try again."));
            return;
          }
        } else {
          console.error("Error switching chain:", switchError);
          dispatch(spinnerShow(false));
          dispatch(toastState(true, "error", "Failed to switch network. Please try again."));
          return;
        }
      }

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      const voyToken = new web3.eth.Contract(voyABI, VOY_ADDRESS);
      const stakeContract = new web3.eth.Contract(stakingABI, STAKING_ADDRESS);

      let allData;
      try {
        allData = await stakeContract.methods.getAllData().call({ from: account });
      } catch (error) {
        console.error("Error calling getAllData():", error);
        dispatch(spinnerShow(false));
        dispatch(toastState(true, "error", "Failed to retrieve staking data. Please try again later."));
        return;
      }

      const [userInfo, balanceOfRewards, balanceOfWallet] = await Promise.all([
        stakeContract.methods.userInfo(account).call({ from: account }),
        stakeContract.methods.getPending(account).call({ from: account }),
        voyToken.methods.balanceOf(account).call(),
      ]);

      const balanceOfStakes = fromWEI(userInfo.amount);
      const formattedBalanceOfRewards = floor(fromWEI(balanceOfRewards), -4);
      const formattedBalanceOfWallet = fromWEI(balanceOfWallet).toFixed(2);

      const adminAllStakes = allData[5];
      const rewardPerBlock = allData[4];
      const apyValue = getPoolApr(adminAllStakes, rewardPerBlock);
      const formattedApyValue =
        apyValue !== null ? `Current Pool APR ${apyValue.toFixed(2)}%` : "";
      const formattedAdminAllStakes = fromWEI(adminAllStakes).toFixed(2);

      const rewardsSecond =
        (Number(rewardPerBlock) * Number(userInfo.amount)) / Number(allData[5]);
      const rewardsPerSecond =
        fromWEI(rewardsSecond).toFixed(8) === "0.00000000"
          ? fromWEI(rewardsSecond)
          : fromWEI(rewardsSecond).toFixed(8);
      const stakePool =
        adminAllStakes !== "0"
          ? ((balanceOfStakes / fromWEI(adminAllStakes)) * 100).toFixed(2)
          : "0";

      const response = await fetch(
        `https://api-${appChain}.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=${startBlockNumber}&sort=desc&apikey=5ZDTBES96NMY1K6KVGXVSGSEM1WH2WANVH`
      );
      const transactions = await response.json();

      const filterTransactions = transactions.result.filter(
        (tx) => tx.to === STAKING_ADDRESS.toLowerCase()
      );

      await dispatch(getHistory(web3, account, filterTransactions, [], [], 0));

      dispatch(spinnerShow(false));
      dispatch({
        type: CONNECT_WALLET,
        payload: {
          web3,
          account,
          connectState: true,
          connectBtnName: "Connected",
          stakeValue: Number(balanceOfStakes),
          rewardValue: Number(formattedBalanceOfRewards),
          voyValue: Number(formattedBalanceOfWallet),
          apyValue: formattedApyValue,
          stakePool: Number(stakePool),
          rewardsPerSecond,
          totalAmountStake: formattedAdminAllStakes,
          filterTransactions,
        },
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      dispatch(spinnerShow(false));
      dispatch(toastState(true, "error", "An error occurred while connecting the wallet. Please try again."));
    }
  };
}

export function disconnectWallet() {
  return (dispatch) => {
    dispatch({
      type: DISCONNECT_WALLET,
      payload: {
        web3: null,
        account: "",
        connectState: false,
        stakeValue: 0,
        rewardValue: 0,
        voyValue: 0,
        apyValue: "APR -%",
        stakePool: 0,
        stakeHistory: [],
        harvestHistory: [],
        connectBtnName: "Connect Wallet",
        rewardsPerSecond: "",
        unstakingFee: "",
        totalAmountStake: 0,
        filterTransactions: [],
      },
    });
  };
}

export function setStake(web3, account, amount = 0) {
  return async (dispatch) => {
    try {
      console.log("setStake: ", amount);

      const voyToken = new web3.eth.Contract(voyABI, VOY_ADDRESS);
      const stakeContract = new web3.eth.Contract(stakingABI, STAKING_ADDRESS);

      const amountVal = toWEI(amount);
      dispatch(spinnerShow(true, "Requesting Approval..."));

      const approve = await voyToken.methods
        .approve(STAKING_ADDRESS, amountVal.toString(10))
        .send({ from: account });
      console.log("Approve Transaction:", approve);

      dispatch(spinnerShow(true, "Requesting Stake..."));

      const stake = await stakeContract.methods
        .stake(amountVal.toString(10))
        .send({ from: account });
      console.log("Stake Transaction:", stake);

      // const stakeContractEvent = stakeContract.events.Stake();
      // const event = await new Promise((resolve, reject) => {
      //   stakeContractEvent.on({}, (error, result) => {
      //     if (error) {
      //       reject(error);
      //     } else {
      //       resolve(result);
      //     }
      //   });
      // });

      // console.log("event**********", event)

      dispatch(connectWallet(false));
      dispatch(
        toastState(
          true,
          "success",
          `You have successfully staked ${amount} VOY.`
        )
      );
      dispatch(toastState(false));

      dispatch({
        type: STAKE_VALUE,
        payload: {},
      });
    } catch (error) {
      console.error("Error staking:", error);
      dispatch(spinnerShow(false));
      dispatch(toastState(true, "error", `Your stake request of ${amount} VOY was declined. Error: ${error.message}`));
      dispatch(toastState(false));
    }
  };
}

export function setUnStake(web3, account, amount = 0) {
  return async (dispatch) => {
    // let web3Provider;
    // web3Provider = window.web3.currentProvider;
    // const web3 = new Web3(web3Provider);
    // let account;
    // [account] = await web3.eth.getAccounts(function (error, accounts) {
    // if (error) {
    //     dispatch(spinnerShow());
    //     return false;
    // }

    // return accounts[0];
    // });
    console.log("setUnStake: ", amount);

    const stakeContract = new web3.eth.Contract(stakingABI, STAKING_ADDRESS);

    let amountVal = toWEI(amount);

    dispatch(spinnerShow(true, "requesting UnStake..."));

    await stakeContract.methods
      .unStake(amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinnerShow());
          dispatch(
            toastState(
              true,
              "error",
              "Your unstake request of " + amount + "VOY was declined."
            )
          );
          dispatch(toastState(false));
          return;
        }
        dispatch(spinnerShow(true, "processing Transaction..."));
        return res;
      });

    var stakeContractEvent = stakeContract.events.UnStake();

    let event = await stakeContractEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinnerShow(false));
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(connectWallet(false));
        dispatch(
          toastState(
            true,
            "success",
            "You have successfully unstaked " + amount + "VOY."
          )
        );
        dispatch(toastState(false));
      },
      (error) => {
        dispatch(spinnerShow(false));
        dispatch(
          toastState(
            true,
            "error",
            "Your unstake request of " + amount + "VOY was declined."
          )
        );
        dispatch(toastState(false));
      }
    );

    dispatch({
      type: UNSTAKE_VALUE,
      payload: {},
    });
  };
}

export function setLPStake(web3, account, pid, tokenAddr, amount = 0) {
  return async (dispatch) => {
    console.log("setStake: ", amount);

    const lpToken = new web3.eth.Contract(voyABI, tokenAddr);

    const farmContract = new web3.eth.Contract(farmingABI, FARMING_ADDRESS);

    let amountVal = toWEI(amount);
    dispatch(spinnerShow(true, "requesting Approval..."));
    let approve = await lpToken.methods
      .approve(FARMING_ADDRESS, amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinnerShow());
          dispatch(
            toastState(
              true,
              "error",
              "Your stake request of " + amount + "LP was declined."
            )
          );
          dispatch(toastState(false));
          return;
        }
        dispatch(spinnerShow(true, "processing Approval..."));
        return res;
      });
    console.log(approve);

    dispatch(spinnerShow(true, "requesting Stake..."));
    let stake = await farmContract.methods
      .deposit(pid, amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinnerShow());
          dispatch(
            toastState(
              true,
              "error",
              "Your stake request of " + amount + "LP was declined."
            )
          );
          dispatch(toastState(false));
          return;
        }

        dispatch(spinnerShow(true, "processing Transaction..."));
        return res;
      });

    var farmContractEvent = farmContract.events.Stake();

    let event = await farmContractEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinnerShow(false));
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(connectWallet(false));
        dispatch(
          toastState(
            true,
            "success",
            "You have successfully staked " + amount + "LP."
          )
        );
        dispatch(toastState(false));
      },
      (error) => {
        dispatch(spinnerShow(false));
        dispatch(
          toastState(
            true,
            "error",
            "Your stake request of " + amount + "LP was declined."
          )
        );
        dispatch(toastState(false));
      }
    );

    console.log(stake);

    dispatch({
      type: STAKE_VALUE,
      payload: {},
    });
  };
}

export function setLPUnStake(web3, account, pid, amount = 0) {
  return async (dispatch) => {
    console.log("setUnStake: ", amount);

    const farmContract = new web3.eth.Contract(farmingABI, FARMING_ADDRESS);

    let amountVal = toWEI(amount);

    dispatch(spinnerShow(true, "requesting UnStake..."));

    await farmContract.methods
      .withdraw(pid, amountVal)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinnerShow());
          dispatch(
            toastState(
              true,
              "error",
              "Your unstake request of " + amount + "LP was declined."
            )
          );
          dispatch(toastState(false));
          return;
        }
        dispatch(spinnerShow(true, "processing Transaction..."));
        return res;
      });

    var farmContractEvent = farmContract.events.UnStake();

    let event = await farmContractEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinnerShow(false));
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(connectWallet(false));
        dispatch(
          toastState(
            true,
            "success",
            "You have successfully unstaked " + amount + "LP."
          )
        );
        dispatch(toastState(false));
      },
      (error) => {
        dispatch(spinnerShow(false));
        dispatch(
          toastState(
            true,
            "error",
            "Your unstake request of " + amount + "LP was declined."
          )
        );
        dispatch(toastState(false));
      }
    );

    dispatch({
      type: UNSTAKE_VALUE,
      payload: {},
    });
  };
}

export function harvestRewards(web3, account, amount = 0) {
  return async (dispatch) => {
    //   console.log(amount);
    //   let web3Provider;
    //   web3Provider = window.web3.currentProvider;
    //   const web3 = new Web3(web3Provider);
    //   let account;
    //   [account] = await web3.eth.getAccounts(function (error, accounts) {
    //     if (error) {
    //       dispatch(spinnerShow(false));
    //       return false;
    //     }
    //     return accounts[0];
    //   });
    console.log(amount);
    const stakeContract = new web3.eth.Contract(stakingABI, STAKING_ADDRESS);

    let amountVal = toWEI(amount);
    dispatch(spinnerShow(true, "requesting Harvest..."));

    let harvest = await stakeContract.methods
      .harvest()
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinnerShow());
          dispatch(
            toastState(
              true,
              "error",
              "Your harvest request of " + amount + "VOY was declined."
            )
          );
          dispatch(toastState(false));
          return;
        }
        dispatch(spinnerShow(true, "processing Transaction..."));
        return res;
      })
      .then(() => {});
    console.log(harvest, stakeContract.events.Harvest);

    var stakeContractEvent = stakeContract.events.Harvest();

    let event = await stakeContractEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinnerShow(false));
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(connectWallet(false));
        dispatch(
          toastState(
            true,
            "success",
            "You have successfully harvested " + amount + "VOY."
          )
        );
        dispatch(toastState(false));
      },
      (error) => {
        dispatch(
          toastState(
            true,
            "error",
            "Your harvest request of " + amount + "VOY was declined."
          )
        );
        dispatch(toastState(false));
      }
    );
  };
}

export function harvestLPRewards(web3, account, pid, amount = 0) {
  return async (dispatch) => {
    console.log(amount);
    const farmingContract = new web3.eth.Contract(farmingABI, FARMING_ADDRESS);

    //   let amountVal = toWEI(amount);
    //   console.log(amountVal);

    dispatch(spinnerShow(true, "requesting Harvest..."));

    let harvest = await farmingContract.methods
      .withdraw(pid, 0)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinnerShow());
          dispatch(
            toastState(
              true,
              "error",
              "Your harvest request of " + amount + "VOY was declined."
            )
          );
          dispatch(toastState(false));
          return;
        }
        dispatch(spinnerShow(true, "processing Transaction..."));
        return res;
      })
      .then(() => {});
    console.log(harvest, farmingContract.events.Harvest);

    var farmingContractEvent = farmingContract.events.Harvest();

    let event = await farmingContractEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinnerShow(false));
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(connectWallet(false));
        dispatch(
          toastState(
            true,
            "success",
            "You have successfully harvested " + amount + "VOY."
          )
        );
        dispatch(toastState(false));
      },
      (error) => {
        dispatch(
          toastState(
            true,
            "error",
            "Your harvest request of " + amount + "VOY was declined."
          )
        );
        dispatch(toastState(false));
      }
    );
  };
}

export function exportAllStakes() {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinnerShow(false));
        return false;
      }
      return accounts[0];
    });
    const stakeContract = new web3.eth.Contract(stakingABI, STAKING_ADDRESS);

    let stakerLength = await stakeContract.methods
      .stakerLength()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinnerShow(false));
          return;
        }
        return res;
      });
    stakerLength = Number(stakerLength);

    let allStakesInfo = [];
    let count = parseInt(stakerLength / 100 + 1);
    for (let i = 0; i < count; i++) {
      let size = stakerLength >= 100 ? 100 : stakerLength;
      let pieceStakesInfo = await stakeContract.methods
        .exportStakingInfos(100 * i, size)
        .call({ from: account }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            return;
          }
          return res;
        });
      allStakesInfo = allStakesInfo.concat(pieceStakesInfo);
      stakerLength = stakerLength >= 100 ? stakerLength - 100 : stakerLength;
    }
    console.log("================AllStakesInfo================", allStakesInfo);
    // allStakesInfo = allStakesInfo[0];
    const cnt = allStakesInfo.length;
    let content = [];
    for (let i = 0; i < cnt; i++) {
      for (let j = 0; j < allStakesInfo[i][0].length; j++) {
        var obj = { address: "", amount: 0 };
        obj.address = allStakesInfo[i][0][j];
        obj.amount = allStakesInfo[i][1][j];
        content.push(obj);
      }
    }

    exportData(content);

    dispatch({
      type: EXPORT_ALLSTAKES,
      payload: {},
    });
  };
}

const exportData = (data) => {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(data)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = "allStakes.json";

  link.click();
  window.location.href = "/";
};

export const getBalanceOfRewards = (web3, account) => {
  return async (dispatch) => {
    const stakeContract = new web3.eth.Contract(stakingABI, STAKING_ADDRESS);
    let balanceOfRewards = await stakeContract.methods
      .getPending(account)
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinnerShow(false));
          return;
        }
        return res;
      });

    balanceOfRewards = floor(fromWEI(balanceOfRewards), -4);

    dispatch({
      type: GET_BALANCEOFREWARDS,
      payload: {
        rewardValue: balanceOfRewards,
      },
    });
  };
};

export const getHistory = (
  web3,
  account,
  filterTransactions,
  stakeHistory,
  harvestHistory,
  curCnt
) => {
  return async (dispatch) => {
    const totalCnt = filterTransactions.length;
    const txJson = {};
    for (let i = 0; i < filterTransactions.length; i++) {
      txJson[filterTransactions[i].hash] = filterTransactions[i].timeStamp;
    }
    console.log("Txjson: ", txJson);
    if (totalCnt <= curCnt) {
      return;
    }
    const stakeContract = new web3.eth.Contract(stakingABI, STAKING_ADDRESS);
    let eventAry = [];
    console.log("totalCnt", totalCnt);
    console.log("curCnt", curCnt);
    for (
      let i = curCnt;
      i < (curCnt + 3 >= totalCnt ? totalCnt : curCnt + 3);
      i++
    ) {
      console.log("block num: ", filterTransactions[i].blockNumber);
      await stakeContract
        .getPastEvents(
          "allEvents",
          {
            filter: {
              user: account,
            },
            fromBlock: filterTransactions[i].blockNumber,
            toBlock: filterTransactions[i].blockNumber,
          },
          function (error, events) {
            console.log("error: ", error);
            if (events.length > 0) {
              eventAry = eventAry.concat(events);
            }
          }
        )
        .then(function (events) {
          console.log(events);
        });
    }
    console.log("eventAry", eventAry);
    console.log(txJson);
    for (let i = 0; i < eventAry.length; i++) {
      let el = eventAry[i];
      if (el.event === "Stake" || el.event === "UnStake") {
        el.timestamp = parseInt(txJson[el.transactionHash]);
        stakeHistory = stakeHistory.concat(el);
      } else if (el.event === "Harvest") {
        el.timestamp = parseInt(txJson[el.transactionHash]);
        el.percent = 0;
        harvestHistory = harvestHistory.concat(el);
      }
    }
    console.log(stakeHistory);

    let unstakeFee = 40;
    // let unstakeFee = await stakeContract.methods
    // .getUnStakeFeePercent(account)
    // .call({ from: account }, function (err, res) {
    //   if (err) {
    //     console.log("An error occured", err);
    //     dispatch(spinnerShow());
    //     return;
    //   }
    //   return res;
    // });

    const curShowCnt = curCnt + 3;
    const moreState = totalCnt > curShowCnt ? true : false;
    console.log("stakeHistory", stakeHistory);
    dispatch({
      type: GET_HISTORY,
      payload: {
        stakeHistory: stakeHistory,
        harvestHistory: harvestHistory,
        unstakingFee: unstakeFee,
        historyTotalCnt: totalCnt,
        curShowCnt: curShowCnt,
        moreState: moreState,
      },
    });
  };
};
