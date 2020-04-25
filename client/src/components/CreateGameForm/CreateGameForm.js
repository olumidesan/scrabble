import React from 'react'

function CreateGameForm(props) {
    return (
        <div className='configForm'>
            <form>
                <div className="field">
                    <label className="label">Your Name: <span className="imp">*</span> </label>
                    <div className="control">
                        <input className="input" type='text' onChange={props.saveUser} name='text' placeholder='e.g: Orihime' />
                    </div>
                </div>
                <div className="control">
                    <div className="select is-fullwidth">
                        <select onChange={props.savePlayers} >
                            <option value='' defaultValue>Choose the number of players</option>
                            <option value='2'>2</option>
                            <option value='3'>3</option>
                            <option value='4'>4</option>
                        </select>
                    </div>
                </div>
                <br />
                <div className='centralize field is-grouped is-grouped-centered'>
                    <button style={{ marginRight: '5px' }} className="button optionButton is-fullwidth is-link" onClick={props.startGame}>Start</button>
                    <button style={{ marginLeft: '5px' }} className="button optionButton is-fullwidth is-light" onClick={props.showHome}>Cancel</button>
                </div>
            </form>
        </div>
    )
}

export default CreateGameForm;
