import React, { Component } from 'react'

export default class ScoreTable extends Component {
    state = {
        score: 0
    }

    componentDidMount = () => {
        this.props.socket.on('playEvent', (data) => {
            if (data.name === this.props.name) {
                this.setState({ score: data.score });
            }
        })
    }

    render() {
        let players = this.props.players.map((player, index) => {
            return <tr key={index}>
                <td>{this.props.name === player ? `${player} (You)` : player}</td>
                <td>{this.state.score}</td>
                <td id={`turn_${player}`}>No</td>
            </tr>;
        });
        return (
            <div className="scoresTable">
                <table className="table is-hoverable is-stripped is-fullwidth is-bordered">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Score</th>
                            <th>Turn?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players}
                    </tbody>
                </table>
            </div>
        )
    }
}
