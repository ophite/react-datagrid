'use strict';

require('./index.styl')
import { IconMenu, MenuItem } from 'react-toolbox/lib/menu';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react/lib/update';
import { DragSource, DropTarget } from 'react-dnd';

//var Guid = require('node-uuid')
var sorty = require('sorty')
var React = require('react')
var ReactDOM = require('react-dom')
var DataGrid = require('./src')
var faker = window.faker = require('faker');
var preventDefault = require('./src/utils/preventDefault');

console.log(React.version, ' react version');
var gen = (function () {

    var cache = {}

    return function (len) {

        if (cache[len]) {
            // return cache[len]
        }

        var arr = []

        for (var i = 0; i < len; i++) {
            arr.push({
                id: i + 1,
                // id: Guid.create(),
                grade: Math.round(Math.random() * 10),
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                birthDate: faker.date.past(),
                country: faker.address.country(),
                city: faker.address.city()
            })
        }

        cache[len] = arr

        return arr
    }
})()

var RELOAD = true

var columns = [
    { name: 'index', title: '#', width: 50 },
    { name: 'country', width: 200 },
    { name: 'city', width: 150 },
    { name: 'firstName' },
    { name: 'lastName' },
    { name: 'email', width: 200 }
]

var ROW_HEIGHT = 31
var LEN = 2000
var SORT_INFO = [{ name: 'country', dir: 'asc' }]//[ { name: 'id', dir: 'asc'} ]
var sort = sorty(SORT_INFO)
var data = gen(LEN);
var initialData = data.slice();


const style = {
    border: '1px solid gray',
    height: '15rem',
    width: '15rem',
    padding: '2rem',
    textAlign: 'center'
};

const boxTarget = {
    drop(props, monitor, component) {
        const tItem = monitor.getItem();
        if (!tItem) {
            return
        }
        const dragIndex = tItem.index;
        const hoverIndex = props.index;
        props.handleColumnGrouping(dragIndex, hoverIndex);
    }
};

@DropTarget("CARD", boxTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
}))
class TargetBox extends React.Component {
    static propTypes = {
        connectDropTarget: React.PropTypes.func.isRequired,
        isOver: React.PropTypes.bool.isRequired,
        canDrop: React.PropTypes.bool.isRequired,
        columns: React.PropTypes.array,
        handleColumnGrouping: React.PropTypes.func
    };

    renderGroupingColumns = () => {
        if (!this.props.groupingColumns.length) {
            return null;
        }

        return (
            <div>
                Grouped columns: {this.props.groupingColumns.join(', ')}
            </div>
        );
    };

    render() {
        const { canDrop, isOver, connectDropTarget } = this.props;
        const isActive = canDrop && isOver;

        return connectDropTarget(
            <div style={style}>
                {this.renderGroupingColumns()}
                <div>
                    {isActive ?
                        'Release to drop' :
                        'Drag item here'
                    }
                </div>
            </div>
        );
    }
}

@DragDropContext(HTML5Backend)
class App extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleSortChange = this.handleSortChange.bind(this);
        this.onColumnResize = this.onColumnResize.bind(this);
        this.handleColumnGrouping = this.handleColumnGrouping.bind(this);
        this.handleColumnOrder = this.handleColumnOrder.bind(this);
        this.state = {
            groupingColumns: [
                'country',
                'grade',
            ]
        };
    }

    handleMenuColumnsGrouping = (menuItem) => {
        let groupingColumns = [...this.state.groupingColumns];
        const index = groupingColumns.indexOf(menuItem);

        if (index >= 0) {
            groupingColumns = [
                ...this.state.groupingColumns.slice(0, index),
                ...this.state.groupingColumns.slice(index + 1, this.state.groupingColumns.length)
            ];
        } else {
            groupingColumns.push(menuItem);
        }

        this.setState({ groupingColumns });
    };

    onColumnResize(firstCol, firstSize, secondCol, secondSize) {
        firstCol.width = firstSize
        this.setState({})
    }

    handleColumnOrder = (dragIndex, hoverIndex) => {
        const col = columns[dragIndex];
        columns.splice(dragIndex, 1); //delete from index, 1 item
        columns.splice(hoverIndex, 0, col);
        this.forceUpdate();
    };

    handleColumnGrouping = (dragIndex, hoverIndex) => {
        const col = columns[dragIndex];
        this.handleMenuColumnsGrouping(col.name);
    };

    handleFilter(column, value, allFilterValues) {
        //reset data to original data-array
        data = initialData;

        //go over all filters and apply them
        Object.keys(allFilterValues).forEach(function(name){
            var columnFilter = (allFilterValues[name] + '').toUpperCase()

            if (columnFilter == ''){
                return
            }

            data = data.filter(function(item){
                if ((item[name] + '').toUpperCase().indexOf(columnFilter) === 0){
                    return true
                }
            })
        })

        this.setState({})
    }

    handleResetFilter() {
        data = initialData

        this.setState({})
    }

    renderMenu = () => {
        const { isFilterMode } = this.state;
        const showHideFilterView = (
            <MenuItem
                onSelect={this.toggleFilter}
                icon='fiber_manual_record'
                value={!isFilterMode ? 'Show Filter' : 'Hide filter'}
                caption={!isFilterMode ? 'Show Filter' : 'Hide filter'}
            />
        );
        const resetFilterView = (
            isFilterMode ?
                <MenuItem
                    onSelect={this.resetFilter}
                    icon='fiber_manual_record'
                    value='Reset filter'
                    caption='Reset filter'/> : null
        );

        return (
            <IconMenu icon='more_vert' position='topLeft' menuRipple>
                <MenuItem value='download' icon='get_app' caption='Download' />
                <MenuItem value='help' icon='favorite' caption='Favorite' />
            </IconMenu>
        );
    };

    render() {
        const divStyle = {
            height: '100px',
        };

        return (
            <div>
                {this.renderMenu()}
                <TargetBox
                    handleColumnGrouping={this.handleColumnGrouping}
                    groupingColumns={this.state.groupingColumns}
                />
                <div style={divStyle}>drag here</div>
                <DataGrid
                    ref="dataGrid"
                    idProperty='id'
                    dataSource={data}
                    sortInfo={SORT_INFO}
                    onSortChange={this.handleSortChange}
                    columns={columns}
                    style={{height: 400}}
                    groupBy={this.state.groupingColumns}
                    handleFilter={this.handleFilter.bind(this)}
                    handleResetFilter={this.handleResetFilter.bind(this)}
                    onColumnResize={this.onColumnResize}
                    handleColumnOrder={this.handleColumnOrder}
                />
            </div>
        )
    }

    handleSortChange(sortInfo) {
        SORT_INFO = sortInfo
        data = sort(data)
        this.setState({})
    }
}

ReactDOM.render((
    <App />
), document.getElementById('content'))
