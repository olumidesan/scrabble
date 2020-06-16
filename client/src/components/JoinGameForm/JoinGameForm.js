import React from 'react'

function JoinGameForm(props) {
    return (
        <div className='joinForm'>
            <form>
                <div className="field">
                    <label className="label">Your Name: <span className="imp">*</span></label>
                    <div className="control">
                        <input className="input" type='text' onChange={props.saveUser} name='name' placeholder='e.g. Smeagol' />
                    </div>
                </div>

                <div className="field">
                    <div className="field is-expanded">
                        <label className="label">Game ID: <span className="imp">*</span></label>
                        <div className="field has-addons">
                            <p className="control">
                                <span className="button is-static">
                                    SC-
                                </span>
                            </p>
                            <div className="control">
                                <input className="input" type='text' onChange={props.saveID} name='gameID' placeholder='e.g. 903318' />
                            </div>
                        </div>
                    </div>

                </div>
                <div className='centralize field is-grouped is-grouped-centered'>
                    <button style={{ marginRight: '5px' }} className="button optionButton is-fullwidth is-link" onClick={props.joinRoom}>Join</button>
                    <button style={{ marginLeft: '5px' }} className="button optionButton is-fullwidth is-light" onClick={props.showHome}>Cancel</button>
                </div>
            </form>
        </div>
    )
}

export default JoinGameForm;
