import React from "react";

const Spinner = ({ active }) => {
    return (
        <div className={active ? 'spinner active' : 'spinner'}>
            <div uk-spinner={active ? 'true' : 'false'}></div>
        </div>
    );
};

export default Spinner;
