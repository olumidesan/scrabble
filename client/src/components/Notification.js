import React, { useContext, useEffect } from 'react';
import { AlertCircle, Bell, } from 'react-feather';
import { NotificationContext } from '../context';
import { useStateRef } from '../hooks';

const Notification = (props) => {

    // let ns = [];
    const { notifications } = useContext(NotificationContext);
    const [_, setTimeoutNotifications, timeoutNotifications] = useStateRef([]);

    useEffect(() => {
        for (const [index, notification] of notifications.current.entries()) {

            let classNames, iconType;

            if (notification.type === "info") {
                iconType = <AlertCircle size={22} />;
                classNames = "bg-blue-100 flex items-center border border-blue-300 text-blue-900 px-4 py-4 rounded relative";
            }
            else if (notification.type === "success") {
                iconType = <Bell size={22} />;
                classNames = "bg-green-100 flex items-center border border-green-300 text-green-800 px-4 py-4 rounded relative";
            }
            else if (notification.type === "error") {
                iconType = <AlertCircle size={22} />;
                classNames = "bg-red-100 flex items-center border border-red-300 text-red-800 px-4 py-4 rounded relative";
            }
            else if (notification.type === "warning") {
                iconType = <AlertCircle size={22} />;
                classNames = "bg-yellow-100 flex items-center border border-yellow-300 text-yellow-800 px-4 py-4 rounded relative";
            }
            else {
                iconType = <Bell size={22} />;
                classNames = "bg-center-100 flex items-center text-white center-500 text-center-800 px-4 py-4 rounded relative";
            }

            let newNotification = <div key={index}>
                <div className={classNames}>
                    <span className="inline pr-4">{iconType}</span>
                    <span className="inline text-left">{notification.message}</span>
                </div>
                <div className="pb-2"></div>
            </div>;

            // Add to state
            setTimeoutNotifications([newNotification]);
        }
    }, [notifications.current]);

    return (timeoutNotifications.current)
};

export default Notification;