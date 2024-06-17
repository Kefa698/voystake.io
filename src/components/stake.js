import { useState, useEffect } from "react";
import { connect } from "react-redux";
import jsonData from '../data/data.json';
import Header from "./header";
import StakeIntro from "./sintro";
import History from './shistory';
import Loading from './loading';

function Stake (props) {

    const [pageData, setPageData] = useState(jsonData);
    useEffect(()=>{
        setPageData(jsonData);
    }, []);
    
    return(
        <div className='main'>
            <Header data={pageData.Header} />
            <StakeIntro />
            <History />
            <Loading spinnerShow={props.show} message={props.message} />

        </div>
    );
}

const mapStateToProps = (state) =>{
    state = state.simple;
    return { ...state }
}
  
export default connect(mapStateToProps)(Stake);