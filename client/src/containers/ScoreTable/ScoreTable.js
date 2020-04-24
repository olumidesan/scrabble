import React, { Component } from 'react';
import { toast } from 'react-toastify';

export default class ScoreTable extends Component {
    componentDidMount = () => {
        this.props.socket.on('scoreUpdate', (data) => {
            let message = data.name === this.props.name ?
                `You played "${data.word}" worth ${data.score} points` :
                `${data.name} played "${data.word}" worth ${data.score} points`;

            let scoreDiv = document.getElementById(`score_${data.name}`);
            let score = parseInt(scoreDiv.innerText);
            scoreDiv.innerText = score + data.score

            toast.success(message);
        })
    }

    render() {
        let players = this.props.players.map((player, index) => {
            return <tr key={index}>
                <td>{this.props.name === player ? `${player} (You)` : player}</td>
                <td id={`score_${player}`}>0</td>
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
