import React from 'react';
import { countDown } from '../utils';
import { ShoppingBag } from 'react-feather';
import Modal from './Modal';
import { useStateRef } from '../hooks';

const Bag = ({ bag }) => {

    const [_, setShowContents, showContents] = useStateRef(false);

    return (
        <div title={`${bag.length} pieces remaining`} onClick={() => setShowContents(!showContents.current)} className="flex items-end space-x-0">
            <div className="flex-none"><ShoppingBag className="cursor-pointer" fill="gray" size={36} /></div>
            <div className="flex-none cursor-pointer text-gray-500 text-sm">{countDown(bag.length)}</div>
            <Modal show={showContents.current} />
        </div>
    )
}

export default Bag;