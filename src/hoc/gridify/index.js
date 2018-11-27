import React from 'react';
import { camelToKebab } from '../../filters/stringFormat';
import uuid from 'uuid/v4';

import GridsContext from '../../store/context/Grids';
import { updateGridElement } from '../../store/actions/Grids';
import { getGridWidth } from "../../store/selectors/Grids";


function gridify(Component, { forcedProps = {}, staticMethods = [], componentName } = {}) {

    function getDefaultProps(forcedPropsName, defaultValue = undefined) {
        return (forcedProps[forcedPropsName] !== undefined) ? forcedProps[forcedPropsName] : defaultValue;
    }

    class GridifiedComponent extends React.Component {
        constructor(props) {
            super(props);
            this.state = { uuid: uuid(), width: props.width };
        }

        componentWillReceiveProps(nextProps, nextContext, snapshot) {
            const { dispatch, store } = nextContext;
            if (JSON.stringify(this.context.store.grids) !== JSON.stringify(store.grids)) {

                const { griduuid } = this.props;
                if (griduuid && store.grids && store.grids[griduuid]) {
	                dispatch(updateGridElement(
                        {
                            griduuid,
                            elementuuid: this.state.uuid,
                            minifiedElement: this.getMinified(),
	                    },
	                ));
                }

                if (this.props.fullwidth === 'true' || forcedProps.fullWidth === 'true') {
                    const actualGridWidth = getGridWidth(this.context.store, { uuid: griduuid });
                    const nextGridWidth = getGridWidth(store, { uuid: griduuid });

                    if (actualGridWidth !== nextGridWidth) {
                        this.setState(() => ({ width: nextGridWidth }));
                    }
                }

            }
        }


        isFullWidth() {
            return this.props.fullwidth || forcedProps.fullWidth;
        }


        getMinified() {
            const { col, row, width, height, fullwidth, fullheight } = this.props;
            const { selfRowTemplate, selfColTemplate } = forcedProps;

            const type = componentName || Component.displayName || `Gridified${Component.name || 'Component'}`;

            return { type, col, row, width, height, fullwidth, fullheight, selfRowTemplate, selfColTemplate };
        }


        render() {
            const {
                className,
                style,

                col,
                row,

                width,
                height,

                fullwidth,
                fullheight,

                children,
                ...otherProps,
            } = this.props;

            const specificClassName = camelToKebab(
                componentName ||
                Component.displayName ||
                `Gridified${Component.name || 'Component'}`
            );

            const classNames = [specificClassName, className].filter(e => !!e).join(' ');

            const styles = forcedProps.noGridPlacement !== 'true'
                ? {
                    gridColumn: `${col} / span ${(fullwidth || forcedProps.fullwidth) ? this.state.width : width}`,
                    gridRow: `${row} / span ${height}`,
                    ...style
                }
                : {};


            return (
                <Component
                    className={classNames}
                    style={styles}

                    col={col}
                    row={row}

                    width={width}
                    height={height}

                    fullwidth={fullwidth}
                    fullheight={fullheight}

                    {...otherProps}
                >
                    { children }
                </Component>
            );
        }
    }


    staticMethods.forEach(method => GridifiedComponent[method] = Component[method]);

    GridifiedComponent.displayName = 'GridifiedComponent';

    GridifiedComponent.contextType = GridsContext;






    GridifiedComponent.defaultProps = {
        className: getDefaultProps('className', ''),
        style: getDefaultProps('style', {}),

        col: getDefaultProps('col', 'auto'),
        row: getDefaultProps('row', 'auto'),

        width: getDefaultProps('width', 1),
        height: getDefaultProps('height', 1),

        fullwidth: getDefaultProps('fullwidth', 'false'),
        fullheight: getDefaultProps('fullheight', 'false'),
    };

    return GridifiedComponent;
}


export default gridify;