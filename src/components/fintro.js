import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Modal from "./farm-modal";
import jsonData from '../data/data.json';
import { connect, useDispatch } from "react-redux";
import { getBalanceOfRewards, harvestLPRewards, connectWallet } from "../store/actions/wallet";
import { numberWithCommas } from '../utils/helper';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function Intro(props) {
    const [showModal, setShowModal] = useState(false);
    const [tab, setTab] = useState("");
    const [pair, setPair] = useState(0);
    const poolList = jsonData.pools;

    useEffect(() => {
        if (props.toastShow) {
            if (props.toastType === "success") {
                toast.success(props.toastMessage);
            } else {
                toast.error(props.toastMessage);
            }
        }
        const interval = setInterval(() => {
            if (props.web3 != null) {
                dispatch(getBalanceOfRewards(props.web3, props.account));
            }
        }, 5000);
        return () => clearInterval(interval);
    })

    useEffect(() => {
        console.log(pair);
    }, [pair])

    useEffect(() => {
        console.log('Connected State:', props.connectState);
        console.log('Connect Button Name:', props.connectBtnName);
    }, [props.connectState, props.connectBtnName]);

    const shortAddress = (address) => {
        const startStr = address.slice(0, 10);
        const lastStr = address.slice(address.length - 8, address.length);
        return (startStr + "..." + lastStr);
    }

    const dispatch = useDispatch();

    return (
        <>
            <div><Toaster toastOptions={{ className: 'm-toaster', duration: 3000, style: { fontSize: '12px' } }} /></div>

            <Modal className='stake-modal' showModal={showModal} setShowModal={setShowModal} pair={poolList[pair]} tab={tab} setTab={setTab} />

            <div className="intro my-4">
                <div className="container">
                    <div className="row h-100">
                        <div className="col-md-8 welcome">
                            <div className="p-4 b-b-2 br-8 welcome-inner">
                                <div className="row top my-2">
                                    <div className="col-md-4">
                                        <h5 className="title">Hello, Welcome to Voyoge Farming!</h5>
                                        <span className="desc">New to the staking platform? <a className="text-primary" href="#" target="_blank" rel="noreferrer">Check Guide</a></span>
                                    </div>
                                </div>

                                <div className="row down">
                                    <div className="col-md-4 first">
                                        <div className="p-4 b-b-3 br-8 d-flex flex-column panel">
                                            <div className="mt-4 d-flex mb-4">
                                                <h5 className="title mr-auto p-2">Current LP Pair</h5>
                                                <h5 className="title ml-auto p-2 pool-info"> {poolList[pair].name} </h5>
                                            </div>

                                            <div className="actions d-flex mt-auto pb-4 mt-2">
                                                <DropdownButton title="Change Pool/Pair" className="action-pool-change">
                                                    <Dropdown.Item onClick={() => { setPair(0) }} >USDC-VOY LP</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => { setPair(1) }}>ETH-VOY LP</Dropdown.Item>
                                                </DropdownButton>
                                            </div>
                                            <div className="actions d-flex mt-auto pb-4">
                                                <button onClick={() => {
                                                    window.open(poolList[pair].link, '_blank');
                                                }} className="btn b-p-1 br-8 flex-fill btn-st">Get {poolList[pair].name} LP</button>
                                            </div>
                                            <div className="actions d-flex mt-auto pb-4">
                                                <button onClick={() => {
                                                    window.open(poolList[pair].contract, '_blank');
                                                }} className="btn b-p-1 br-8 flex-fill btn-st">View Contract</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-8 first">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="p-4 b-b-3 br-8 d-flex flex-column panel">
                                                    <h5 className="title d-flex justify-content-center">Staking
                                                        {/*<i className="bi bi-question-circle"></i>*/}
                                                    </h5>
                                                    <div className="mt-2 d-flex justify-content-center">
                                                        <p className="f-i-center">
                                                            <span className="price me-2 fw-bold">{0}</span>
                                                        </p>
                                                    </div>

                                                    <div className="actions d-flex mt-auto justify-content-around">
                                                        <div className="mr-2">
                                                            <button className="btn b-y-1 br-8 mr-auto"
                                                                onClick={() => {
                                                                    if (!props.connectState) {
                                                                        toast.success("Please connect Wallet first!");
                                                                        return;
                                                                    }
                                                                    setTab("unstake"); setShowModal(true);
                                                                }}
                                                            >
                                                                <span className="c-y-1"> - </span>
                                                            </button>
                                                        </div>
                                                        <div className="ml-2">
                                                            <button className="btn b-y-1 br-8"
                                                                onClick={() => {
                                                                    if (!props.connectState) {
                                                                        toast.success("Please connect Wallet first!");
                                                                        return;
                                                                    }
                                                                    setTab("stake"); setShowModal(true);
                                                                }}
                                                            >
                                                                <span className="c-y-1"> + </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="p-4 b-b-3 br-8 d-flex flex-column panel">
                                                    <h5 className="title d-flex justify-content-center">Accrued Reward
                                                        {/*<i className="bi bi-question-circle"></i>*/}
                                                    </h5>
                                                    <div className="mt-2 d-flex justify-content-center">
                                                        <p className="f-i-center">
                                                            <span className="price me-2 fw-bold">{0}</span>
                                                        </p>
                                                    </div>

                                                    <div className="actions d-flex mt-auto">
                                                        <button className="btn b-y-1 br-8 flex-fill"
                                                            onClick={() => {
                                                                if (!props.connectState) {
                                                                    toast.success("Please connect Wallet first!");
                                                                    return;
                                                                }
                                                                if (props.rewardValue > 0) {
                                                                    dispatch(harvestLPRewards(props.web3, props.account, props.rewardValue));
                                                                }
                                                            }}
                                                        >
                                                            <span className="c-y-1"> Harvest <i className="bi bi-arrow-up-right ms-2"></i></span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row pt-2">
                                            <div className="col-md-12">
                                                <div className="p-4 b-b-3 br-8 d-flex flex-column">
                                                    <div className="row">
                                                        <div className="col-md-4 text-center">
                                                            <h5 className="title">Yield</h5>
                                                            <h5 className="description-title pool-info">10%</h5>
                                                        </div>
                                                        <div className="col-md-4 text-center">
                                                            <h5 className="title">Liquidity</h5>
                                                            <h5 className="description-title pool-info">1,500,000</h5>
                                                        </div>
                                                        <div className="col-md-4 text-center">
                                                            <h5 className="title">Multiplier</h5>
                                                            <h5 className="description-title pool-info">20x</h5>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4  buy-panel d-flex flex-column">
                            <div className="br-8 px-3 d-flex panel-inner">
                                <div className="row p-2 b-b-2 panel-up">
                                    <h5 className="title mt-3">Wallet Balance
                                        {/*<i className="bi bi-question-circle c-g-1 fw-bold"></i>*/}
                                    </h5>
                                    <div className="mt-3">
                                        <h1 className="price fw-bold">{props.connectState ? numberWithCommas(props.voyValue) : "-"}</h1>
                                        <h6 className="unit c-g-1">VOY</h6>
                                    </div>
                                </div>

                                <div className="row b-b-4">
                                    <div className="p-3 pe-5">
                                        <h5 className="fs-6 c-g-1">Your wallet address</h5>
                                        <div className="b-t-1 bd-g-1 br-8 c-w-1 d-flex">
                                            <button className="btn b-b-3 br-8 w-btn" onClick={() => navigator.clipboard.writeText(props.account)}><i className="bi bi-wallet2"></i></button>
                                            <input className="input b-t-1 c-g-1 w-addr" placeholder="0x27h236D...1tyujkk937" value={shortAddress(props.account)} readOnly />
                                        </div>
                                    </div>
                                </div>

                                <div className="row flex-fill">
                                    {props.connectState ? (
                                        <div>
                                            {/* Content to display when connected */}
                                            <p>Connected</p>
                                            {/* ... */}
                                        </div>
                                    ) : (
                                        <div>
                                            {/* Content to display when not connected */}
                                            <button className="brb-8 b-g-1 c-w-1 py-3 buy-btn" onClick={() => dispatch(connectWallet(true))}>{props.connectBtnName}</button>
                                            {/* ... */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const mapStateToProps = (state) => {
    state = state.simple;
    return {
        ...state,
        connectState: state.connectState,
        connectBtnName: state.connectBtnName,
    };
};

const mapDispatchToProps = {
    harvestLPRewards,
    connectWallet,
};

export default connect(mapStateToProps, mapDispatchToProps)(Intro);