import React, { Component } from 'react'

export default class ScoreTable extends Component {
    render() {
        let players = this.props.players.map(player => {
            return <tr key={player}>
                <td>{player}</td>
                <td>0</td>
            </tr>;
        });
        return (
            <div className="scoresTable">
                <table className="table is-hoverable is-stripped is-fullwidth is-bordered">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Score</th>
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
