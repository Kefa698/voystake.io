import { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import StakingImg from '../assets/img/modal/Staking.svg';
import { setStake, setUnStake } from "../store/actions/wallet";

const data = {
    stake: {
        title: "Add Stake",
        text: "Staking is locked for 30 days. You can unstake early but will incur a penalty",
        // text: "The more you stake, the higher your APR returns",
        buttonText: "Stake",
    },
    unstake: {
        title: "Remove Stake",
        text: "There are some fees when unstaking",
        buttonText: "Unstake",
    }
}

const StackCard = (props) => {

    let con = props.content;
    const dispatch = useDispatch();

    return (
        <>
            <div className="mx-auto my-4">
                {/*<img src={StakingImg} alt="stakeImg" />*/}
            </div>
            <div className='mt-4'>
                <h4 className='title'>{con.title}</h4>
                <p className='text'>
                   {con.text}
                   {/* {con.buttonText === 'Stake' ? <></> : ': ' + props.unstakingFee + '%'} */}
                   
                </p>
                {con.buttonText === 'Stake' ? <a href='https://casperpad.gitbook.io/staking-guide/unstaking' target='_blank' rel="noreferrer">More details...</a> : <a href='https://casperpad.gitbook.io/staking-guide/staking' target='_blank' rel="noreferrer">More details...</a>}
            </div>
            <div className='mt-1'>
                <p className='d-flex'>
                    <span>{con.buttonText} amount</span> 
                    <span className='ms-auto c-p-1 cur-ptr' onClick={()=>{
                        document.getElementById('stake-num').value = (con.buttonText === 'Stake' ? parseInt(props.voyValue) : props.stakeValue);
                    }}>MAX</span>
                </p>
                <input type="number" className="m-input c-w-1 br-8 b-b-2" id="stake-num" placeholder="" />
                <button className="btn b-p-1 br-8 mt-2 m-s-btn" onClick={()=>{
                    let val = document.getElementById('stake-num').value;
                    if(val === "0" || val === "") {
                        return;
                    }
                    con.buttonText === 'Stake' ? dispatch(setStake(props.web3, props.account, val)) : dispatch(setUnStake(props.web3, props.account, val))
                    props.setShowModal(false);
                }}>
                    {con.buttonText}
                </button>
            </div>
        </>
    )
}

const Modal = ({tab, ...props}) => {
    const [atab, setATab] = useState("");
    const [content, setContent] = useState({});

    useEffect(() => {
        props.setTab(atab);
        let c = (atab === "stake")? data.stake : data.unstake;
        setContent(c);
    }, [atab]);
    
    useEffect(()=>{
        if (props.showModal)
            setATab(tab);
    }, [props.showModal, tab])

    return (
        <>
            { !props.showModal? null :

            <div className={`overlay ${props.showModal? "show" : "hide"}`} onClick={() => props.setShowModal(false)}>
                <div className={"br-8 m-modal " + props.className} onClick={ e => e.stopPropagation() }>
                    <div className='m-header px-3 pt-4 pb-2'>
                        <ul className="m-nav">
                            <li onClick={() => {setATab("stake"); document.getElementById('stake-num').value=0;}} className={atab === "stake"? "active":""}><div href="#">Stakes</div></li>
                            <li onClick={() => {setATab("unstake"); document.getElementById('stake-num').value=0;}} className={atab === "unstake"? "active":""}><div href="#">Unstake</div></li>
                        </ul>
                    </div>
                    <div className='m-body p-3 d-flex flex-column'>
                        <StackCard content={content} {...props}/>
                    </div>
                </div>
            </div>
            }
        </>
    );
}

const mapStateToProps = (state) =>{
    state = state.simple;
    return { ...state }
}

const mapDispatchToProps = () => {
    return {
      setStake: setStake,
      setUnStake: setUnStake,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
