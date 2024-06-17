import '../assets/css/chart-balance.css';
import { connect } from 'react-redux';
import { PieChart } from 'react-minimal-pie-chart';
import { numberWithCommas } from '../utils/helper';

const ChartBalance = (props) => {
    const total = (props.voyValue + props.stakeValue + props.rewardValue).toFixed(2);
    return (
        total > 0 ? 
            <div className="balance-item svg-item">
                <div className='balance-sum'>
                    <div className={total > 10000000 ? "text small-font" : "text"}>{numberWithCommas(total)}</div>
                    <div className="unit-text">VOY</div>
                </div>

                <PieChart
                data={[
                    { title: 'In Wallet', value: props.voyValue, color: "#03DAC6"},
                    { title: 'Rewards', value: props.rewardValue, color: "#fff"},
                    { title: 'Stakes', value: props.stakeValue, color: "#6239F2"},
                ]}
                lineWidth={'10'}
                paddingAngle={10}
                rounded={true}
                animate={true}
                />
            </div>
        : <></>        
    )
}

const mapStateToProps = (state) =>{
    state = state.simple;
    return { ...state }
}

export default connect(mapStateToProps)(ChartBalance);