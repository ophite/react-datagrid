'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp, _initialiseProps;

var _CellDnd = require('../CellDnd');

var _CellDnd2 = _interopRequireDefault(_CellDnd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var Region = require('region');
var ReactMenu = React.createFactory(require('react-menus'));
var assign = require('object-assign');
var clone = require('clone');
var asArray = require('../utils/asArray');
var findIndexBy = require('../utils/findIndexBy');
var findIndexByName = require('../utils/findIndexByName');
// var Cell = require('../Cell')

var setupColumnDrag = require('./setupColumnDrag');
var setupColumnResize = require('./setupColumnResize');

var normalize = require('react-style-normalizer');

function emptyFn() {}

function getColumnSortInfo(column, sortInfo) {

    sortInfo = asArray(sortInfo);

    var index = findIndexBy(sortInfo, function (info) {
        return info.name === column.name;
    });

    return sortInfo[index];
}

function removeColumnSort(column, sortInfo) {
    sortInfo = asArray(sortInfo);

    var index = findIndexBy(sortInfo, function (info) {
        return info.name === column.name;
    });

    if (~index) {
        sortInfo.splice(index, 1);
    }

    return sortInfo;
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
        filterValues: {}
    };
}

var Header = (_temp = _class = function (_React$Component) {
    _inherits(Header, _React$Component);

    // static displayName:
    // 'ReactDataGrid.Header';

    function Header(props, context) {
        _classCallCheck(this, Header);

        var _this = _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this, props, context));

        _initialiseProps.call(_this);

        _this.state = {
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
        return _this;
    }

    _createClass(Header, [{
        key: 'render',
        value: function render() {
            var props = this.prepareProps(this.props);
            var state = this.state;

            var cellMap = {};
            var cells = props.columns.map(function (col, index) {
                var cell = this.renderCell(props, state, col, index);
                cellMap[col.name] = cell;

                return cell;
            }, this);

            if (props.columnGroups && props.columnGroups.length) {

                cells = props.columnGroups.map(function (colGroup) {
                    var cellProps = {};
                    var columns = [];

                    var cells = colGroup.columns.map(function (colName) {
                        var col = props.columnMap[colName];
                        columns.push(col);
                        return cellMap[colName];
                    });

                    return React.createElement(
                        _CellDnd2.default,
                        cellProps,
                        cells
                    );
                }, this);
            }

            var style = normalize(props.style);
            var headerStyle = normalize({
                paddingRight: props.scrollbarSize,
                transform: 'translate3d(' + -props.scrollLeft + 'px, ' + -props.scrollTop + 'px, 0px)'
            });

            return React.createElement(
                'div',
                { style: style, className: props.className },
                React.createElement(
                    'div',
                    { className: 'z-header', style: headerStyle },
                    cells,
                    React.createElement(
                        'button',
                        { onClick: this.toggleFilter },
                        !state.isFilterMode ? 'Show Filter' : 'Hide filter'
                    ),
                    state.isFilterMode ? React.createElement(
                        'button',
                        { onClick: this.resetFilter },
                        'Reset filter'
                    ) : null
                )
            );
        }
    }]);

    return Header;
}(React.Component), _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this.onDrop = function (event) {
        var state = _this2.state;
        var props = _this2.props;

        if (state.dragging) {
            event.stopPropagation();
        }

        var dragIndex = state.dragColumnIndex;
        var dropIndex = state.dropIndex;

        if (dropIndex != null) {

            //since we need the indexes in the array of all columns
            //not only in the array of the visible columns
            //we need to search them and make this transform
            var dragColumn = props.columns[dragIndex];
            var dropColumn = props.columns[dropIndex];

            dragIndex = findIndexByName(props.allColumns, dragColumn.name);
            dropIndex = findIndexByName(props.allColumns, dropColumn.name);

            _this2.props.onDropColumn(dragIndex, dropIndex);
        }

        _this2.setState(getDropState());
    };

    this.renderCell = function (props, state, column, index) {

        var resizing = props.resizing;
        var text = column.title;
        var className = props.cellClassName || '';
        var style = {
            left: 0
        };

        var menu = _this2.renderColumnMenu(props, state, column, index);

        if (state.dragColumn && state.shiftIndexes && state.shiftIndexes[index]) {
            style.left = state.shiftSize;
        }

        if (state.dragColumn === column) {
            className += ' z-drag z-over';
            style.zIndex = 1;
            style.left = state.dragLeft || 0;
        }

        var filterIcon = props.filterIcon || React.createElement(
            'svg',
            { version: '1.1',
                style: { transform: 'translate3d(0,0,0)', height: '100%', width: '100%', padding: '0px 2px' },
                viewBox: '0 0 3 4' },
            React.createElement('polygon', { points: '0,0 1,2 1,4 2,4 2,2 3,0 ',
                style: { fill: props.filterIconColor, strokeWidth: 0, fillRule: 'nonZero' } })
        );

        var filter = column.filterable ? React.createElement(
            'div',
            { className: 'z-show-filter', onMouseUp: _this2.handleFilterMouseUp.bind(_this2, column) },
            filterIcon
        ) : null;

        var resizer = column.resizable ? React.createElement('span', { className: 'z-column-resize', onMouseDown: _this2.handleResizeMouseDown.bind(_this2, column) }) : null;

        if (column.sortable) {
            text = React.createElement(
                'span',
                null,
                text,
                React.createElement('span', { className: 'z-icon-sort-info' })
            );

            var sortInfo = getColumnSortInfo(column, props.sortInfo);

            if (sortInfo && sortInfo.dir) {
                className += sortInfo.dir === -1 || sortInfo.dir === 'desc' ? ' z-desc' : ' z-asc';
            }

            className += ' z-sortable';
        }

        if (filter) {
            className += ' z-filterable';
        }

        if (state.mouseOver === column.name && !resizing) {
            className += ' z-over';
        }

        if (props.menuColumn === column.name) {
            className += ' z-active';
        }

        className += ' z-unselectable';

        var events = {};

        events.onMouseDown = _this2.handleMouseDown.bind(_this2, column);
        events.onMouseUp = _this2.handleMouseUp.bind(_this2, column);

        return React.createElement(
            _CellDnd2.default,
            _extends({
                key: column.name,
                handleColumnOrder: _this2.props.handleColumnOrder,
                contentPadding: props.cellPadding,
                columns: props.columns || [],
                index: index,
                column: props.columns[index],
                className: className,
                style: style,
                text: text,
                header: true,
                onMouseOut: _this2.handleMouseOut.bind(_this2, column),
                onMouseOver: _this2.handleMouseOver.bind(_this2, column)
            }, events),
            filter,
            menu,
            resizer,
            state.isFilterMode ? React.createElement('input', {
                onChange: _this2.handleFilter.bind(_this2, props, column),
                value: state.filterValues[column.name] || ''
            }) : null
        );
    };

    this.resetFilter = function () {
        _this2.setState({ filterValues: {} });
        _this2.props.handleResetFilter();
    };

    this.toggleFilter = function () {
        _this2.setState({ isFilterMode: !_this2.state.isFilterMode });
    };

    this.toggleSort = function (column) {
        var sortInfo = asArray(clone(_this2.props.sortInfo));
        var columnSortInfo = getColumnSortInfo(column, sortInfo);

        if (!columnSortInfo) {
            columnSortInfo = {
                name: column.name,
                type: column.type,
                fn: column.sortFn
            };

            sortInfo.push(columnSortInfo);
        }

        if (typeof column.toggleSort === 'function') {
            column.toggleSort(columnSortInfo, sortInfo);
        } else {

            var dir = columnSortInfo.dir;
            var dirSign = dir === 'asc' ? 1 : dir === 'desc' ? -1 : dir;
            var newDir = dirSign === 1 ? -1 : dirSign === -1 ? 0 : 1;

            columnSortInfo.dir = newDir;

            if (!newDir) {
                sortInfo = removeColumnSort(column, sortInfo);
            }
        }

        ;
        (_this2.props.onSortChange || emptyFn)(sortInfo);
    };

    this.handleFilter = function (props, column, event) {
        var filterValues = JSON.parse(JSON.stringify(_this2.state.filterValues));
        filterValues[column.name] = event.target.value;
        _this2.setState({ filterValues: filterValues });
        props.handleFilter(column, event, filterValues);
    };

    this.renderColumnMenu = function (props, state, column, index) {
        if (!props.withColumnMenu) {
            return;
        }

        var menuIcon = props.menuIcon || React.createElement(
            'svg',
            { version: '1.1',
                style: { transform: 'translate3d(0,0,0)', height: '100%', width: '100%', padding: '0px 2px' },
                viewBox: '0 0 3 4' },
            React.createElement('polygon', { points: '0,0 1.5,3 3,0 ',
                style: { fill: props.menuIconColor, strokeWidth: 0, fillRule: 'nonZero' } })
        );

        return React.createElement(
            'div',
            { className: 'z-show-menu', onMouseUp: _this2.handleShowMenuMouseUp.bind(_this2, props, column, index) },
            menuIcon
        );
    };

    this.handleShowMenuMouseUp = function (props, column, index, event) {
        event.nativeEvent.stopSort = true;

        _this2.showMenu(column, event);
    };

    this.showMenu = function (column, event) {

        var menuItem = function (column) {
            var visibility = this.props.columnVisibility;

            var visible = column.visible;

            if (column.name in visibility) {
                visible = visibility[column.name];
            }

            return {
                cls: visible ? 'z-selected' : '',
                selected: visible ? React.createElement(
                    'span',
                    { style: { fontSize: '0.95em' } },
                    '\u2713'
                ) : '',
                label: column.title,
                fn: this.toggleColumn.bind(this, column)
            };
        }.bind(_this2);

        function menu(eventTarget, props) {

            var columns = props.gridColumns;

            props.columns = ['selected', 'label'];
            props.items = columns.map(menuItem);
            props.alignTo = eventTarget;
            props.alignPositions = ['tl-bl', 'tr-br', 'bl-tl', 'br-tr'];
            props.style = {
                position: 'absolute'
            };

            var factory = this.props.columnMenuFactory || ReactMenu;

            var result = factory(props);

            return result === undefined ? ReactMenu(props) : result;
        }

        _this2.props.showMenu(menu.bind(_this2, event.currentTarget), {
            menuColumn: column.name
        });
    };

    this.showFilterMenu = function (column, event) {

        function menu(eventTarget, props) {

            var defaultFactory = this.props.filterMenuFactory;
            var factory = column.filterMenuFactory || defaultFactory;

            props.columns = ['component'];
            props.column = column;
            props.alignTo = eventTarget;
            props.alignPositions = ['tl-bl', 'tr-br', 'bl-tl', 'br-tr'];
            props.style = {
                position: 'absolute'
            };

            var result = factory(props);

            return result === undefined ? defaultFactory(props) : result;
        }

        _this2.props.showMenu(menu.bind(_this2, event.currentTarget), {
            menuColumn: column.name
        });
    };

    this.toggleColumn = function (column) {
        _this2.props.toggleColumn(column);
    };

    this.hideMenu = function () {
        _this2.props.showColumnMenu(null, null);
    };

    this.handleResizeMouseDown = function (column, event) {
        setupColumnResize(_this2, _this2.props, column, event);

        //in order to prevent setupColumnDrag in handleMouseDown
        // event.stopPropagation()

        //we are doing setupColumnDrag protection using the resizing flag on native event
        if (event.nativeEvent) {
            event.nativeEvent.resizing = true;
        }
    };

    this.handleFilterMouseUp = function (column, event) {
        event.nativeEvent.stopSort = true;

        _this2.showFilterMenu(column, event);
        // event.stopPropagation()
    };

    this.handleMouseUp = function (column, event) {
        if (_this2.state.dragging) {
            return;
        }

        if (_this2.state.resizing) {
            return;
        }

        if (event && event.nativeEvent && event.nativeEvent.stopSort) {
            return;
        }

        if (column.sortable && event.target.tagName !== "INPUT") {
            _this2.toggleSort(column);
        }
    };

    this.handleMouseOut = function (column) {
        _this2.setState({
            mouseOver: false
        });
    };

    this.handleMouseOver = function (column) {
        _this2.setState({
            mouseOver: column.name
        });
    };

    this.handleMouseDown = function (column, event) {
        if (event && event.nativeEvent && event.nativeEvent.resizing) {
            return;
        }

        if (!_this2.props.reorderColumns) {
            return;
        }

        setupColumnDrag(_this2, _this2.props, column, event);
    };

    this.onResizeDragStart = function (config) {
        _this2.setState({
            resizing: true
        });
        _this2.props.onColumnResizeDragStart(config);
    };

    this.onResizeDrag = function (config) {
        _this2.props.onColumnResizeDrag(config);
    };

    this.onResizeDrop = function (config, resizeInfo, event) {
        _this2.setState({
            resizing: false
        });

        _this2.props.onColumnResizeDrop(config, resizeInfo);
    };

    this.prepareProps = function (thisProps) {
        var props = {};

        assign(props, thisProps);

        _this2.prepareClassName(props);
        _this2.prepareStyle(props);

        var columnMap = {};
        (props.columns || []).forEach(function (col) {
            columnMap[col.name] = col;
        });

        props.columnMap = columnMap;

        return props;
    };

    this.prepareClassName = function (props) {
        props.className = props.className || '';
        props.className += ' ' + props.defaultClassName;

        if (_this2.state.dragging) {
            props.className += ' ' + props.draggingClassName;
        }
    };

    this.prepareStyle = function (props) {
        var style = props.style = {};

        assign(style, props.defaultStyle);
    };
}, _temp);


Header.propTypes = {
    columns: React.PropTypes.array
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

exports.default = Header;