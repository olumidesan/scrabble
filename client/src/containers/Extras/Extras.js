import React from 'react';
import Rack from '../Rack/Rack';
import ScoreTable from '../ScoreTable/ScoreTable';


class Extras extends React.Component {

    render() {
        return (
            <div className="extras">
                <ScoreTable />
                <Rack isTurn={this.props.isTurn} />
            </div>
        )
    }
}

export default Extras;
