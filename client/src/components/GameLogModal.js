import React from "react";

export default function GameLogModal({ logs, close, show }) {

    let modal = <>
        <div onClick={() => close()} className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-screen my-6 mx-auto max-w-3xl">
                <div className="h-96 border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    <div className="flex justify-center flex-col pt-7 p-3 border-b border-solid border-blueGray-200 rounded-t">
                        <h3 className="text-2xl font-semibold">
                            Logs
                        </h3>
                        <div className="text-md pt-1 text-gray-500">History of in-game plays</div>
                    </div>
                    <div className="overflow-auto py-0 justify-center">
                        {logs.length > 0 ?
                            <table className="table-auto w-full mb-5">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-black-600">Time</th>
                                        <th className="border border-gray-300 px-4 py-2 text-black-600">Event</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => {
                                        return <tr key={index}>
                                            <td className='w-1/5 text-gray-500 capitalize border border-gray-300 px-4 py-2 text-black-600 font-medium'>
                                                {log.time}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-black-600 font-medium">{log.event}</td>
                                        </tr>
                                    })}
                                </tbody>
                            </table>

                            : <div className="flex pt-28 text-gray-500 justify-center">Nothing to show :)</div>}
                    </div>
                </div>
            </div>
        </div>
        <div className="opacity-75 fixed inset-0 z-40 bg-black"></div>
    </>

    return (show.current ? modal : null);
}