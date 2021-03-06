/*
This panel will control which egram to display and will provide
options to view Atrial, Ventricular, or both graphs
as well as a print option.
*/

import React from 'react';
import Button from 'react-bootstrap/Button';
import '../../stylesheets/EgramPanel.css';
// graph components
import AtrialGraph from './egrams/AtrialGraph';
import VentricalGraph from './egrams/VentricalGraph';

const EgramPanel = (props) => {
    const [mode, setMode] = React.useState('atrial');

    // grab data points 
    var atrialValues = (props.values[0])*3.3;
    var ventValues = (props.values[1])*3.3;

    //console.log(atrialValues);

    // fetch and import data from firebase here
    const getAtrialData = () => {
        return {
            labels: ['A', 'B', 'C'],
            datasets: [{
              label: 'My data',
              fill: false,
              data: [10, 20, 30],
              backgroundColor: '#112233'
            }]
        }
    }
    // separate for atrial and ventricular (fetch both however)

    function renderGraph(modeVal) {
        switch(modeVal) {
            case 'atrial':
                return <AtrialGraph dataPoints={atrialValues} height={'300vh'} width={'40vw'} />;
            case 'ventricular':
                return <VentricalGraph dataPoints={ventValues} height={'300vh'} width={'40vw'} />;
            case 'both':
                return (
                    <div>
                        <AtrialGraph dataPoints={atrialValues} height={'160vh'}  />
                        <VentricalGraph dataPoints={ventValues} height={'160vh'}  />
                    </div>
                );
            default:
                return <AtrialGraph dataPoints={atrialValues} />;
        }
        
    }

    return (
        <div className='graphModeSelector'>
            <span style={{display: 'block', maxWidth: '100px', 'minHeight': '45vh', position: 'absolute'}}>
                <Button variant='secondary' className='graphBtn' onClick={() => {setMode('atrial')}} active={mode === 'atrial' ? true : false}>Atrial</Button>
                <Button variant='secondary' className='graphBtn' onClick={() => {setMode('ventricular')}} active={mode === 'ventricular' ? true : false}>Ventricular</Button>
                <Button variant='secondary' className='graphBtn' onClick={() => {setMode('both')}} active={mode === 'both' ? true : false}>Dual View</Button>
            </span>
            <div style={{height: '45vh', left: '50px', overflowY: 'hide'}} >
            {
                renderGraph(mode)
            }
            </div>
            
        </div>
    )
}

export default EgramPanel;