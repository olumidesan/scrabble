import React from 'react';

const ScoreTable = (props) => {
    let players = props.players.map((player, index) => {
        return <tr key={index}>
            <td id={`pid_${player}`}>{props.name === player ? `${player} (You)` : player}</td>
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
    );
}

export default ScoreTable;
