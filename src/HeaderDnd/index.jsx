'use strict';
import { IconMenu, MenuItem } from 'react-toolbox/lib/menu';
var React = require('react')
var Region = require('region')
var ReactMenu = React.createFactory(require('react-menus'))
var assign = require('object-assign')
var clone = require('clone')
var asArray = require('../utils/asArray')
var findIndexBy = require('../utils/findIndexBy')
var findIndexByName = require('../utils/findIndexByName')
// var Cell = require('../Cell')
import Cell from '../CellDnd';
var setupColumnDrag = require('./setupColumnDrag')
var setupColumnResize = require('./setupColumnResize')


var normalize = require('react-style-normalizer')

function emptyFn() {
}

function getColumnSortInfo(column, sortInfo) {

    sortInfo = asArray(sortInfo)

    var index = findIndexBy(sortInfo, function (info) {
        return info.name === column.name
    })

    return sortInfo[index]
}

function removeColumnSort(column, sortInfo) {
    sortInfo = asArray(sortInfo)

    var index = findIndexBy(sortInfo, function (info) {
        return info.name === column.name
    })

    if (~index) {
        sortInfo.splice(index, 1)
    }

    return sortInfo
}

function getDropState() {
    return {
        dragLeft: null,
        dragColumn: null,
        dragColumnIndex: null,
        dragging: false,
        dropIndex: null,

        shiftIndexes: null,
        shiftSize: null,

        isFilterMode: false,
        filterValues: {},
    }
}


class Header extends React.Component {

    // static displayName:
    // 'ReactDataGrid.Header';

    constructor(props, context) {
        super(props, context);
        this.state = {
            defaultClassName: 'z-header-wrapper',
            draggingClassName: 'z-dragging',
            cellClassName: 'z-column-header',
            defaultStyle: {},
            sortInfo: null,
            scrollLeft: 0,
            scrollTop: 0,
            isFilterMode: false,
            filterValues: {}
        };
    }

    onDrop = (event) => {
        var state = this.state
        var props = this.props

        if (state.dragging) {
            event.stopPropagation()
        }

        var dragIndex = state.dragColumnIndex
        var dropIndex = state.dropIndex

        if (dropIndex != null) {

            //since we need the indexes in the array of all columns
            //not only in the array of the visible columns
            //we need to search them and make this transform
            var dragColumn = props.columns[dragIndex]
            var dropColumn = props.columns[dropIndex]

            dragIndex = findIndexByName(props.allColumns, dragColumn.name)
            dropIndex = findIndexByName(props.allColumns, dropColumn.name)

            this.props.onDropColumn(dragIndex, dropIndex)
        }

        this.setState(getDropState())
    };

    renderMenu = () => {
        const { isFilterMode } = this.state;
        if (isFilterMode) {
            return (
                <div className="grid-menu">
                    <IconMenu icon='more_vert' position='topRight'>
                        <MenuItem
                            onClick={this.toggleFilter}
                            value='Hide filter'
                            caption='Hide filter'
                        />
                        <MenuItem
                            onClick={this.resetFilter}
                            value='Reset filter'
                            caption='Reset filter'
                        />
                    </IconMenu>
                </div>
            );
        } else {
            return (
                <div className="grid-menu">
                    <IconMenu icon='more_vert' position='topRight'>
                        <MenuItem
                            onClick={this.toggleFilter}
                            value='Show filter'
                            caption='Show filter'
                        />
                    </IconMenu>
                </div>
            );
        }
    };

    render() {
        var props = this.prepareProps(this.props)
        var state = this.state

        var cellMap = {}
        var cells = props.columns
            .map(function (col, index) {
                var cell = this.renderCell(props, state, col, index)
                cellMap[col.name] = cell

                return cell
            }, this)

        if (props.columnGroups && props.columnGroups.length) {

            cells = props.columnGroups.map(function (colGroup) {
                var cellProps = {}
                var columns = []

                var cells = colGroup.columns.map(function (colName) {
                    var col = props.columnMap[colName]
                    columns.push(col)
                    return cellMap[colName]
                });

                return <Cell {...cellProps}>
                    {cells}
                </Cell>
            }, this)
        }

        var style = normalize(props.style)
        var headerStyle = normalize({
            paddingRight: props.scrollbarSize,
            transform: 'translate3d(' + -props.scrollLeft + 'px, ' + -props.scrollTop + 'px, 0px)'
        });

        return (
            <div style={style} className={props.className}>
                <div className='z-header' style={headerStyle}>
                    {cells}
                    {this.renderMenu()}
                </div>
            </div>
        )
    }

    renderCell = (props, state, column, index)=> {

        var resizing = props.resizing
        var text = column.title
        var className = props.cellClassName || '';
        var style = {
            left: 0
        };

        var menu = this.renderColumnMenu(props, state, column, index)

        if (state.dragColumn && state.shiftIndexes && state.shiftIndexes[index]) {
            style.left = state.shiftSize
        }

        if (state.dragColumn === column) {
            className += ' z-drag z-over'
            style.zIndex = 1
            style.left = state.dragLeft || 0
        }

        var filterIcon = props.filterIcon || <svg version="1.1"
                                                  style={{transform: 'translate3d(0,0,0)', height:'100%', width: '100%', padding: '0px 2px' }}
                                                  viewBox="0 0 3 4">
                <polygon points="0,0 1,2 1,4 2,4 2,2 3,0 "
                         style={{fill: props.filterIconColor,strokeWidth:0, fillRule: 'nonZero'}}/>
            </svg>

        var filter = column.filterable ?
            <div className="z-show-filter" onMouseUp={this.handleFilterMouseUp.bind(this, column)}>
                {filterIcon}
            </div>
            :
            null

        var resizer = column.resizable ?
            <span className="z-column-resize" onMouseDown={this.handleResizeMouseDown.bind(this, column)}/> :
            null

        if (column.sortable) {
            text = <span >{text}<span className="z-icon-sort-info"/></span>

            var sortInfo = getColumnSortInfo(column, props.sortInfo)

            if (sortInfo && sortInfo.dir) {
                className += (sortInfo.dir === -1 || sortInfo.dir === 'desc' ?
                    ' z-desc' :
                    ' z-asc')
            }

            className += ' z-sortable'
        }

        if (filter) {
            className += ' z-filterable'
        }

        if (state.mouseOver === column.name && !resizing) {
            className += ' z-over'
        }

        if (props.menuColumn === column.name) {
            className += ' z-active'
        }

        className += ' z-unselectable'

        var events = {}

        events.onMouseDown = this.handleMouseDown.bind(this, column)
        events.onMouseUp = this.handleMouseUp.bind(this, column)

        return (
            <Cell
                key={column.name}
                handleColumnOrder={this.props.handleColumnOrder}
                contentPadding={props.cellPadding}
                columns={props.columns || []}
                index={index}
                column={props.columns[index]}
                className={className}
                style={style}
                text={text}
                header={true}
                onMouseOut={this.handleMouseOut.bind(this, column)}
                onMouseOver={this.handleMouseOver.bind(this, column)}
                {...events}
            >
                {filter}
                {menu}
                {resizer}

                {
                    state.isFilterMode ?
                        <div className="z-field-wrap">
                            <input
                                onChange={this.handleFilter.bind(this, props, column)}
                                value={state.filterValues[column.name] || ''}
                                className="z-field"
                            />
                        </div> : null
                }
            </Cell>
        )
    };

    resetFilter = ()=> {
        setTimeout(()=> {
            this.setState({ filterValues: {} });
            this.props.handleResetFilter();
        }, 500) // TODO only for demo. Then delete, fix menu timeOut
    };

    toggleFilter = ()=> {
        setTimeout(()=> {
            this.setState({ isFilterMode: !this.state.isFilterMode });
        }, 500)// TODO only for demo. Then delete, fix menu timeOut
    };

    toggleSort = (column)=> {
        var sortInfo = asArray(clone(this.props.sortInfo))
        var columnSortInfo = getColumnSortInfo(column, sortInfo)

        if (!columnSortInfo) {
            columnSortInfo = {
                name: column.name,
                type: column.type,
                fn: column.sortFn
            }

            sortInfo.push(columnSortInfo)
        }

        if (typeof column.toggleSort === 'function') {
            column.toggleSort(columnSortInfo, sortInfo)
        } else {

            var dir = columnSortInfo.dir
            var dirSign = dir === 'asc' ? 1 : dir === 'desc' ? -1 : dir
            var newDir = dirSign === 1 ? -1 : dirSign === -1 ? 0 : 1

            columnSortInfo.dir = newDir

            if (!newDir) {
                sortInfo = removeColumnSort(column, sortInfo)
            }
        }

        ;
        (this.props.onSortChange || emptyFn)(sortInfo)
    };

    handleFilter = (props, column, event)=> {
        var filterValues = JSON.parse(JSON.stringify(this.state.filterValues));
        filterValues[column.name] = event.target.value;
        this.setState({ filterValues });
        props.handleFilter(column, event, filterValues);
    };

    renderColumnMenu = (props, state, column, index)=> {
        if (!props.withColumnMenu) {
            return
        }

        var menuIcon = props.menuIcon || <svg version="1.1"
                                              style={{transform: 'translate3d(0,0,0)', height:'100%', width: '100%', padding: '0px 2px' }}
                                              viewBox="0 0 3 4">
                <polygon points="0,0 1.5,3 3,0 "
                         style={{fill: props.menuIconColor,strokeWidth:0, fillRule: 'nonZero'}}/>
            </svg>

        return <div className="z-show-menu" onMouseUp={this.handleShowMenuMouseUp.bind(this, props, column, index)}>
            {menuIcon}
        </div>
    };

    handleShowMenuMouseUp = (props, column, index, event)=> {
        event.nativeEvent.stopSort = true

        this.showMenu(column, event)
    };

    showMenu = (column, event)=> {

        var menuItem = function (column) {
            var visibility = this.props.columnVisibility

            var visible = column.visible

            if (column.name in visibility) {
                visible = visibility[column.name]
            }

            return {
                cls: visible ? 'z-selected' : '',
                selected: visible ? <span style={{fontSize: '0.95em'}}>✓</span> : '',
                label: column.title,
                fn: this.toggleColumn.bind(this, column)
            }
        }.bind(this)

        function menu(eventTarget, props) {

            var columns = props.gridColumns

            props.columns = ['selected', 'label']
            props.items = columns.map(menuItem)
            props.alignTo = eventTarget
            props.alignPositions = [
                'tl-bl',
                'tr-br',
                'bl-tl',
                'br-tr'
            ]
            props.style = {
                position: 'absolute'
            }

            var factory = this.props.columnMenuFactory || ReactMenu

            var result = factory(props)

            return result === undefined ?
                ReactMenu(props) :
                result
        }

        this.props.showMenu(menu.bind(this, event.currentTarget), {
            menuColumn: column.name
        })
    };

    showFilterMenu = (column, event)=> {

        function menu(eventTarget, props) {

            var defaultFactory = this.props.filterMenuFactory
            var factory = column.filterMenuFactory || defaultFactory

            props.columns = ['component']
            props.column = column
            props.alignTo = eventTarget
            props.alignPositions = [
                'tl-bl',
                'tr-br',
                'bl-tl',
                'br-tr'
            ]
            props.style = {
                position: 'absolute'
            }

            var result = factory(props)

            return result === undefined ?
                defaultFactory(props) :
                result
        }

        this.props.showMenu(menu.bind(this, event.currentTarget), {
            menuColumn: column.name
        })
    };

    toggleColumn = (column) => {
        this.props.toggleColumn(column)
    };

    hideMenu = () => {
        this.props.showColumnMenu(null, null)
    };

    handleResizeMouseDown = (column, event) => {
        setupColumnResize(this, this.props, column, event)

        //in order to prevent setupColumnDrag in handleMouseDown
        // event.stopPropagation()

        //we are doing setupColumnDrag protection using the resizing flag on native event
        if (event.nativeEvent) {
            event.nativeEvent.resizing = true
        }
    };

    handleFilterMouseUp = (column, event)=> {
        event.nativeEvent.stopSort = true

        this.showFilterMenu(column, event)
        // event.stopPropagation()
    };

    handleMouseUp = (column, event) => {
        if (this.state.dragging) {
            return
        }

        if (this.state.resizing) {
            return
        }

        if (event && event.nativeEvent && event.nativeEvent.stopSort) {
            return
        }

        if (column.sortable && event.target.tagName !== "INPUT") {
            this.toggleSort(column)
        }
    };

    handleMouseOut = (column) => {
        this.setState({
            mouseOver: false
        })
    };

    handleMouseOver = (column) => {
        this.setState({
            mouseOver: column.name
        })
    };

    handleMouseDown = (column, event) => {
        if (event && event.nativeEvent && event.nativeEvent.resizing) {
            return
        }

        if (!this.props.reorderColumns) {
            return
        }

        setupColumnDrag(this, this.props, column, event)
    };

    onResizeDragStart = (config) => {
        this.setState({
            resizing: true
        })
        this.props.onColumnResizeDragStart(config)
    };

    onResizeDrag = (config) => {
        this.props.onColumnResizeDrag(config)
    };

    onResizeDrop = (config, resizeInfo, event) => {
        this.setState({
            resizing: false
        })

        this.props.onColumnResizeDrop(config, resizeInfo)
    };

    prepareProps = (thisProps) => {
        var props = {}

        assign(props, thisProps)

        this.prepareClassName(props)
        this.prepareStyle(props)

        var columnMap = {}

            ;
        (props.columns || []).forEach(function (col) {
            columnMap[col.name] = col
        })

        props.columnMap = columnMap

        return props
    };

    prepareClassName = (props) => {
        props.className = props.className || ''
        props.className += ' ' + props.defaultClassName

        if (this.state.dragging) {
            props.className += ' ' + props.draggingClassName
        }
    };

    prepareStyle = (props) => {
        var style = props.style = {}

        assign(style, props.defaultStyle)
    };
}

Header.propTypes = {
    columns: React.PropTypes.array,
};

Header.defaultProps = {
    defaultClassName: 'z-header-wrapper',
    draggingClassName: 'z-dragging',
    cellClassName: 'z-column-header',
    defaultStyle: {},
    sortInfo: null,
    scrollLeft: 0,
    scrollTop: 0
};

export default Header;