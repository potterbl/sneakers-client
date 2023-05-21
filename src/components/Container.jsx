import React from 'react';
import '../style/Container.css'
const Container = ({children}) => {
    return (
        <div className={'container'}>
            <div className="container-inner">
                {children}
            </div>
        </div>
    );
};

export default Container;