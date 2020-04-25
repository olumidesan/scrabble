import React from 'react'

function LandingPage(props) {
    return (
        <div className='landing'>
            <div className="title centralize">
                SCRABBLE
        </div>
            <div className="field is-grouped">
                <div className="control">
                    <button onClick={props.registerHost} className="button mainButton is-success">Host Game</button>
                </div>
                <div className="control">
                    <button onClick={props.showJoinForm} className="button mainButton is-link">Join Game</button>
                </div>
            </div>
        </div>
    )
}

export default LandingPage;
