import React, { Component } from 'react';
import { GridElement, Row } from './GridElement';
import { FooterLine } from '../Footer/FooterItem';
import { NumberOrOne } from '../../../static/Math';

import './index.styl';

export class Grid extends Component {
    constructor (props) {
        super(props);
        this.getStyle = this.getStyle.bind(this);
    }

    calculateGridSize(children) {
        try {
            let currentRow = 1;
            const rows = [];
            React.Children.forEach(children, child => {
                if (!child || !child.props) return;
                const details = {
                    col: child.props.col,
                    row: child.props.row,
                    width: child.props.width || 1,
                    height: child.props.height || 1,
                    fullwidth: child.props.fullwidth || (child.type.name === 'Row') || (child.type.name === 'FooterLine'),
                };

                const isAuto = (!details.col || !details.row);
                if (isAuto) {
                    details.col = details.col || 'auto';
                    details.row = details.row || currentRow;
                }

                if (details.fullwidth) currentRow += details.height;

                if (!rows[details.row]) rows[details.row] = {width: 0, height: 0}; // create row on first entry of each row

                const colSize = NumberOrOne(details.col) + details.width - 1; // Because col n with width 1 should return a col of n instead of n + 1
                // console.log(child.type.name, 'row =', details.row);
                const width = (details.col === 'auto') ? rows[details.row].width + colSize :  Math.max(rows[details.row].width, colSize);
                const height = Math.max(rows[details.row].height, details.height);

                rows[details.row] = {width, height};
            });
            // console.log(rows);

            let maxCol = 1;
            let maxRow = 1;
            console.log(rows)
            rows.forEach((row, index) => {
                if (!row || !row.width || !row.height) return null;
                maxCol = Math.max(maxCol, row.width);
                maxRow = Math.max(maxRow, NumberOrOne(index) + row.height - 1);
            });
            return { x: maxCol, y: maxRow, rows };
        }
        catch (e) {
            console.log(e);
            return { x: 1, y: 1, rows: [[]] };
        }
    }

    constructGrid (children, gridDimensions) {
        // const { rows } = this.calculateGridSize(children);
        if (!children) return { editedChildren: null, gridDimensions };
        try {
            // console.log('Should return', gridDimensions.y, 'arrays of', gridDimensions.x, 'element(s)');
            const grid = Array(gridDimensions.y).fill(Array(gridDimensions.x).fill(0));
            // console.log('Got', grid);

            let currentRow = 1;
            let currentCol = 1;

            // console.log('rowsAuto=',rows['auto']);

            const childrenInfos = [];
            const editedChildren = React.Children.map(children, child => {
                if (!child || !child.props || !child.type.name) return child;

                let { row, col, height, width, fullwidth } = child.props;


                fullwidth = fullwidth || (child.type.name === 'Row') || (child.type.name === 'FooterLine');
                width = fullwidth ? gridDimensions.x : width || 1;
                if (fullwidth) console.log('gdX =', gridDimensions.x);

                // const { currentRow, currentCol } = this.findNextEmptyCoordinates(grid, width, height) || { currentCol: 1, currentRow: 1 };

                const childInfos = {
                    col: col || currentCol,
                    width,
                    row: row || currentRow,
                    height,
                    fullwidth,
                };
                console.log('child:', child.type.name, '=', childInfos.col);
                childrenInfos.push(childInfos);

                // grid[0] = the 1st row of the grid, grid[1][6] the 7th column of the second row, ....
                for (let y = childInfos.row -1; y <  childInfos.row + childInfos.height - 1; y++) {
                    for (let x = childInfos.col -1; x <  childInfos.col + childInfos.width - 1; x++) {
                        // console.log('', grid[y][x], `elements already placed in [${y}][${x}]`);
                        grid[y][x] = grid[y][x]++ || 1;
                    }
                }
                return React.cloneElement(child, { ...childInfos });
            });
            // console.log('final', grid);
            return editedChildren;
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }

    // findNextEmptyCoordinates(grid, width, height) {
    //     grid.forEach(row => {
    //
    //     })
    // }

    static generateTemplate({ propsTemplate, dimension }) {
        if (!propsTemplate && dimension !== undefined) return 'auto '.repeat(dimension);
        if (typeof propsTemplate === typeof '') return propsTemplate;
        if (typeof propsTemplate === typeof {} && dimension) {
            let template = '';
            for (let i = 1; i < dimension + 1; i++) {
                const row = propsTemplate[i];
                template += (typeof row === typeof '') ? row : 'auto';
                template += ' ';
            }
            return template;
        }
        return 'fit-content(100%)'
    }

    // to perform
    getStyle() {
        const { children, style, columnsTemplate, rowsTemplate, gap = '', rowGap = gap, colGap = gap } = this.props;
        const { rows, ...dimensions } = this.calculateGridSize(children) || { x: 1, y: 1, rows: [] };
        this.gridDimensions = dimensions;

        const gridTemplateRows = Grid.generateTemplate({ propsTemplate: rowsTemplate, dimension: dimensions.y});
        const gridTemplateColumns = Grid.generateTemplate({ propsTemplate: columnsTemplate, dimension: dimensions.x});

        return {
            gridTemplateColumns,
            gridTemplateRows,
            gridRowGap: rowGap,
            gridColumnGap: colGap,
            ...style
        };
    }

    render() {
        const { className, children } = this.props;
        return (
            <div className={`grid ${className || ''}`} style={ this.getStyle() }>
                { this.constructGrid(children, this.gridDimensions) }
            </div>
        );
    }
}

export * from './GridElement';
