
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Modal from "./modal";
import { connect, useDispatch } from "react-redux";
import { getBalanceOfRewards, harvestRewards } from "../store/actions/wallet";
import { numberWithCommas } from '../utils/helper';

function Intro(props) {

    const [showModal, setShowModal] = useState(false);
    const [tab, setTab] = useState("");

    useEffect(() => {
        if(props.toastShow) {
            if(props.toastType === "success") {
                toast.success(props.toastMessage);
            }
            else {
                toast.error(props.toastMessage);
            }
        }
        const interval = setInterval(() => {
            if(props.web3 != null ) {
                dispatch(getBalanceOfRewards(props.web3, props.account));
            }
        }, 5000);
        return () => clearInterval(interval);
    })

    const shortAddress = (address) => {
        const startStr = address.slice(0, 10);
        const lastStr = address.slice(address.length - 8, address.length);
        return (startStr + "..." + lastStr);
    }
    
    const dispatch = useDispatch();
    return (
        <>
            <div><Toaster toastOptions={{className : 'm-toaster', duration : 3000, style : { fontSize: '12px' }}}/></div>

            <Modal className='stake-modal' showModal={showModal} setShowModal={setShowModal} tab={tab} setTab={setTab}/>

            <div className="intro my-4">
                <div className="container">
                    <div className="row h-100">
                        <div className="col-md-8 welcome">
                            <div className="p-4 b-b-2 br-8 welcome-inner">
                                <div className="row top my-2">
                                    <div className="col-md-4">
                                        <h5 className="title">Hello, Welcome to Voyage!</h5>
                                        <span className="desc">New to the staking platform? <a className="text-primary" href="https://casperpad.gitbook.io/staking-guide/" target="_blank" rel="noreferrer">Check Guide</a></span>
                                    </div>
                                    <div className="col-md-4 d-flex my-3">
                                        <div>Total Staked:<span className="mx-2 c-gr-1">{props.connectState ? numberWithCommas(props.totalAmountStake) : "-"}</span>VOY</div>
                                    </div>
                                    {/* <CopyToClipboard >
                                        <button>Copy to clipboard with button</button>
                                    </CopyToClipboard> */}
                                    
                                    <div className="col-md-4 d-flex flex-column">
                                        <button className="btn b-b-3 br-8 mt-3 align-self-end apy-web">
                                            {/*<i className="bi bi-question-circle"></i>*/}
                                            <span className='mx-2'>{props.apyValue}</span>
                                        </button>
                                        <button className="btn b-b-3 br-8 align-self-start apy-mobile">
                                            {/*<i className="bi bi-question-circle"></i>*/}
                                            <span className='mx-2'>{props.apyValue}</span>
                                        </button>
                                    </div>
                                </div>


                                <div className="row down">
                                    <div className="col-md-6 first">
                                        <div className="p-4 b-b-3 br-8 d-flex flex-column panel">
                                            <h5 className="title">Stakes in total
                                                {/*<i className="bi bi-question-circle"></i>*/}
                                            </h5>
                                            <div className="mt-2">
                                                <p className="f-i-center">
                                                    <span className="price me-2 fw-bold">{props.connectState ? numberWithCommas(props.stakeValue) : "-"}</span> <span className="unit c-g-1">VOY</span>
                                                </p>
                                            </div>
                                            
                                            <div className="actions d-flex mt-auto">
                                                <button onClick={() => {
                                                    if(!props.connectState) {
                                                        toast.success("Please connect Wallet first!");
                                                        return;
                                                    }
                                                    setTab("stake"); setShowModal(true); }} className="btn b-p-1 br-8 flex-fill btn-st">Stake</button>
                                                <button onClick={() => {
                                                    if(!props.connectState) {
                                                        toast.success("Please connect Wallet first!");
                                                        return;
                                                    }
                                                    setTab("unstake"); setShowModal(true);}} className="btn b-t-1 c-p-1 btn-unst">Unstake</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="p-4 b-b-3 br-8 d-flex flex-column panel">
                                            <h5 className="title">Rewards
                                                {/*<i className="bi bi-question-circle"></i>*/}
                                            </h5>
                                            <div className="mt-2">
                                                <p className="f-i-center">
                                                    <span className="price me-2 fw-bold">{props.connectState ? numberWithCommas(props.rewardValue) : "-"}</span> <span className="unit c-g-1">VOY</span>
                                                </p>
                                                {
                                                props.connectState ? 
                                                    <h6 className="">(+{props.rewardsPerSecond} VOY/block)</h6>                                       
                                                    :
                                                    <></>
                                                }
                                            </div>
                                            
                                            <div className="actions d-flex mt-auto">
                                                <button className="btn b-y-1 br-8 flex-fill"
                                                    onClick={() => {
                                                        if(!props.connectState) {
                                                            toast.success("Please connect Wallet first!");
                                                            return;
                                                        }
                                                        dispatch(harvestRewards(props.web3, props.account, props.rewardValue));
                                                    }}
                                                >
                                                    <span className="c-y-1"> Harvest Reward <i className="bi bi-arrow-up-right ms-2"></i></span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4  buy-panel d-flex flex-column">
                            <div className="br-8 px-3 d-flex panel-inner h-100">
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
                                        <button className="btn b-b-3 br-8 w-btn" onClick={() =>  navigator.clipboard.writeText(props.account)}><i className="bi bi-wallet2"></i></button>
                                            <input className="input b-t-1 c-g-1 w-addr" placeholder="0x27h236D...1tyujkk937" value={shortAddress(props.account)} readOnly/>
                                        </div>
                                    </div>
                                </div>

                                <div className="row flex-fill">
                                    <a className="brb-8 b-g-1 c-w-1 py-3 buy-btn" target="_blank" rel="noreferrer"
                                        href="https://app.uniswap.org/#/swap?inputCurrency=0x2ac8172d8ce1c5ad3d869556fd708801a42c1c0e&chain=mainnet">
                                            <span>Buy VOY</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const mapStateToProps = (state) =>{
    state = state.simple;
    return { ...state }
}

const mapDispatchToProps = () => {
    return {
      harvestRewards: harvestRewards,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Intro);