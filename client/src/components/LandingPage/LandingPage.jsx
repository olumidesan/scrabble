import React from 'react'

function LandingPage(props) {
    return (
        <div className='landing'>
            <div className="title centralize">
                SCRABBLE  <span className="tag is-warning">v1.2</span>
            </div>
            <div className="field is-grouped">
                <div className="control">
                    <button onClick={props.registerHost} className="button mainButton is-success">Host Game</button>
                </div>
                <div className="control">
                    <button onClick={props.showJoinForm} className="button mainButton is-link">Join Game</button>
                </div>
            </div>
            <br className="mt-5 mb-2" />
            <div className="has-text-centered">
                <p className="subtitle is-size-7">Made with ❤️ by <a href="https://www.twitter.com/olumidesan" target="_blank">@olumidesan</a></p>
            </div>
        </div>
    )
}

export default LandingPage;



// import React from 'react'

// function LandingPage(props) {
//     return (
//         <div className='landing'>
//             <div className="title centralize">
//                 SCRABBLE   <span className="tag is-warning">v1.2</span>
//             </div>
//             <div className="field is-grouped">
//                 <div className="control">
//                     <button onClick={props.registerHost} className="button mainButton is-success">Host Game</button>
//                 </div>
//                 <div className="control">
//                     <button onClick={props.showJoinForm} className="button mainButton is-link">Join Game</button>
//                 </div>
//             </div>
//             <hr className="mt-5 mb-2" />
//             <div className="container has-text-centered">
//                 <p className="subtitle is-size-7">Made with ❤️ by <a href="https://www.twitter.com/olumidesan" target="_blank">@olumidesan</a></p>
//             </div>
//         </div>
//     )
// }

// export default LandingPage;
