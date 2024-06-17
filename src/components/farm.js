import { useState, useEffect } from "react";
import { connect } from "react-redux";
import jsonData from '../data/data.json';
import Header from "./header";
import FarmIntro from "./fintro";
import History from './fhistory';
import Loading from './loading';

function Farm (props) {

    console.log(props);

    const [pageData, setPageData] = useState(jsonData);
    useEffect(()=>{
        setPageData(jsonData);
    }, []);
    
    return(
        <div className='main'>
            <Header data={pageData.Header} />
            <FarmIntro />
            <History />
            <Loading spinnerShow={props.show} message={props.message} />

        </div>
    );
}

const mapStateToProps = (state) =>{
    state = state.simple;
    return { ...state }
}
  
export default connect(mapStateToProps)(Farm);