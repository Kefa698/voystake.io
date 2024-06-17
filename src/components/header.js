import Logo from '../assets/img/header/logo-dark.png'
import { useEffect, useState } from 'react';

import { connect, useDispatch } from "react-redux";
import { connectWallet, disconnectWallet, setUnStake, harvestRewards, spinnerShow, toastState } from "../store/actions/wallet";
import { useLocation, useNavigate } from 'react-router-dom';

function Header (props) {

    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    return(
        <div className='header my-4'>
            {props.data?
                <div className="container">
                    <div className="row fw-nw mb-4">
                        <div className="col-md-2 col-sm-2 logo f-i-center">
                            <a target="_blank" href="https://www.voyage.com/" className='header-logo' rel="noreferrer">
                                <img className='logo-image' src={Logo} alt='' />
                                {/* <span className="ms-2 fw-bold logo-text">{props.data.logo.title}</span> */}
                            </a>
                        </div>


                        <div className='col-md-3 col-sm-3 ms-auto f-i-center st-actions'>
                            {/* <button className="btn">
                                <i className="bi bi-bell-fill"></i>
                            </button> */}

                            <button className="ms-2 connect-btn c-w-1 show-connect" 
                                onClick={ () => { 
                                    props.connectState ? dispatch(disconnectWallet()) : dispatch(connectWallet(true))
                                }}>
                                {props.connectState ? <i className="c-gr-1 bi bi-circle-fill me-1 br-half"></i> : <></>}{props.connectBtnName}
                            </button>
                        </div>   
                    </div>
                    <div className='row d-flex justify-content-center'>
                        <button className={ pathname == "/" ? "btn btn-dark col-md-3" : "btn b-y-1 br-8 col-md-3"}
                            onClick={ () => { 
                                if(pathname == "/") navigate('farm')
                            }}>
                            {"Farming"}
                        </button>
                        <button className={ pathname == "/" ? "btn b-y-1 br-8 col-md-3" : "btn btn-dark col-md-3"}
                            onClick={ () => { 
                                if(pathname != "/") navigate('/')
                            }}>
                            {"Staking"}
                        </button>
                    </div>
                </div>
            : 'Loading ... ' }
        </div>
    )
}

const mapStateToProps = (state) =>{
    state = state.simple;
    return { ...state }
}
  
const mapDispatchToProps = () => {
    return {
      connectWallet: connectWallet,
      disconnectWallet: disconnectWallet,
      spinnerShow: spinnerShow,
      setUnStake: setUnStake,
      harvestRewards: harvestRewards,
      toastState: toastState
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);