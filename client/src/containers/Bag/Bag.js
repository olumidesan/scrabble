import React, { Component } from 'react';
import axios from '../../helpers/axios';

class Bag extends Component {

    state = {
        piecesLeft: 0
    }

    componentDidMount = () => {
        let bagLength = 0;
        axios.get('/bag')
            .then(r => (bagLength = r.data.pieces_left))
            .catch(e => console.log(e.data))
            .then(() => this.setState({ piecesLeft: bagLength }))
    }

    render() {
        return (
            <div className="bag">
                <div>
                    {this.state.piecesLeft}<br></br>
                </div>
            </div>
        )
    }
}

export default Bag
