import React from 'react';

import Grid, { GridElement } from '../Grid/index.jsx';

export const FooterList = ({ children, className }) => {
    if (!children) return null;
    if (!Array.isArray(children)) children = [children];

    const renderChild = () => {
        return children.map((child, index) => {
            return (
                <GridElement className='footer-list-element' key={index+1} row={index+1}>
                    { child }
                </GridElement>
            );
        });
    };
    const finalClassName = 'footer-list' + (className ? ' ' + className : '');
    return <Grid className={finalClassName}>{ renderChild() }</Grid>
};