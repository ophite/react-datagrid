'use strict';

require('./index.styl')

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
var preventDefault = require('./src/utils/preventDefault')

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
        props.moveCard(dragIndex, hoverIndex);
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
        columns: React.PropTypes.array
    };

    renderGroupingColumns = () => {
        if (!this.props.columns.length) {
            return null;
        }

        return (
            <div>
                Grouped columns: {this.props.columns.join(', ')}
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
        this.moveCard = this.moveCard.bind(this);
        this.state = {
            groupingColumns: [
                {
                    name: 'country',
                    activate: true,
                    date: new Date()
                },
                {
                    name: 'grade',
                    activate: true,
                    date: new Date()
                }
            ]
        };
    }

    _getGroupingColumns() {
        const columns = [];
        this.state.groupingColumns
            .sort(item => item.date)
            .forEach((item, index) => {
                if (item.activate) {
                    columns.push(item.name);
                }
            });

        return columns;
    };

    handleMenuColumnsGrouping = (menuItem) => {
        let index = -1;
        this.state.groupingColumns.forEach((item, indexLocal) => {
            if (item.name === menuItem) {
                index = indexLocal;
            }
        });

        let item = {
            name: menuItem,
            activate: true,
            date: new Date()
        };
        if (index >= 0) {
            item = this.state.groupingColumns[index];
            item.activate = !item.activate;

            this.state.groupingColumns = [
                ...this.state.groupingColumns.slice(0, index),
                ...this.state.groupingColumns.slice(index + 1, this.state.groupingColumns.length)
            ];
        }

        this.setState({
            ...this.state,
            groupingColumns: [
                ...this.state.groupingColumns,
                item
            ]
        });
    };

    onColumnResize(firstCol, firstSize, secondCol, secondSize) {
        firstCol.width = firstSize
        this.setState({})
    }

    moveCard = (dragIndex, hoverIndex) => {
        const handleColumnOrderChange = (index, dropIndex) => {
            const col = columns[index];
            debugger
            this.handleMenuColumnsGrouping(col.name);
            columns.splice(index, 1); //delete from index, 1 item
            columns.splice(dropIndex, 0, col);
            this.forceUpdate();
        };

        handleColumnOrderChange(dragIndex, hoverIndex);
    };

    render() {
        const divStyle = {
            height: '100px',
        };

        return (
            <div>
                <TargetBox
                    moveCard={this.moveCard}
                    columns={this._getGroupingColumns()}
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
                    moveCard={this.moveCard}
                    onColumnResize={this.onColumnResize}
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
