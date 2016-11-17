'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _class;

var _reactDom = require('react-dom');

var _reactDnd = require('react-dnd');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var assign = require('object-assign');
var normalize = require('react-style-normalizer');

var TEXT_ALIGN_2_JUSTIFY = {
    right: 'flex-end',
    center: 'center'
};

function copyProps(target, source, list) {

    list.forEach(function (name) {
        if (name in source) {
            target[name] = source[name];
        }
    });
}

var PropTypes = React.PropTypes;

var style = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move'
};

var cardSource = {
    beginDrag: function beginDrag(props) {
        return {
            id: props.id,
            index: props.index
        };
    }
};

var cardTarget = {
    drop: function drop(props, monitor, component) {
        var tItem = monitor.getItem();
        if (!tItem) {
            return;
        }
        var dragIndex = tItem.index;
        var hoverIndex = props.index;
        props.handleColumnOrder(dragIndex, hoverIndex);
    },
    hover: function hover(props, monitor, component) {
        var tItem = monitor.getItem();
        if (!tItem) {
            return;
        }
        var dragIndex = tItem.index;
        var hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Determine rectangle on screen
        var hoverBoundingRect = (0, _reactDom.findDOMNode)(component).getBoundingClientRect();

        // Get vertical middle
        var hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 3;

        // Determine mouse position
        var clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        var hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        // if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        //     return;
        // }

        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
            return;
        }

        // Time to actually perform the action
        // props.handleColumnOrder(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        // monitor.getItem().index = hoverIndex;
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
}

var Cell = (_dec = (0, _reactDnd.DropTarget)("CARD", cardTarget, collect), _dec2 = (0, _reactDnd.DragSource)("CARD", cardSource, function (connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}), _dec(_class = _dec2(_class = function (_React$Component) {
    _inherits(Cell, _React$Component);

    function Cell() {
        _classCallCheck(this, Cell);

        return _possibleConstructorReturn(this, (Cell.__proto__ || Object.getPrototypeOf(Cell)).apply(this, arguments));
    }

    _createClass(Cell, [{
        key: 'prepareClassName',


        // displayName: 'ReactDataGrid.Cell',

        value: function prepareClassName(props) {
            var index = props.index;
            var columns = props.columns;
            var column = props.column;

            var textAlign = column && column.textAlign;

            var className = props.className || '';

            className += ' ' + Cell.className;

            if (columns) {
                if (!index && props.firstClassName) {
                    className += ' ' + props.firstClassName;
                }

                if (index == columns.length - 1 && props.lastClassName) {
                    className += ' ' + props.lastClassName;
                }
            }

            if (textAlign) {
                className += ' z-align-' + textAlign;
            }

            return className;
        }
    }, {
        key: 'prepareStyle',
        value: function prepareStyle(props) {
            var column = props.column;
            var sizeStyle = column && column.sizeStyle;

            var alignStyle;
            var textAlign = column && column.textAlign || (props.style || {}).textAlign;

            if (textAlign) {
                alignStyle = { justifyContent: TEXT_ALIGN_2_JUSTIFY[textAlign] };
            }

            var style = assign({}, props.defaultStyle, sizeStyle, alignStyle, props.style);

            return normalize(style);
        }
    }, {
        key: 'prepareProps',
        value: function prepareProps(thisProps) {

            var props = assign({}, thisProps);

            if (!props.column && props.columns) {
                props.column = props.columns[props.index];
            }

            props.className = this.prepareClassName(props);
            props.style = this.prepareStyle(props);

            return props;
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                isDragging = _props.isDragging,
                isOver = _props.isOver,
                connectDragSource = _props.connectDragSource,
                connectDropTarget = _props.connectDropTarget;

            var opacity = isDragging ? 0 : 1;

            var props = this.p = this.prepareProps(this.props);

            var column = props.column;
            var textAlign = column && column.textAlign;
            var text = props.renderText ? props.renderText(props.text, column, props.rowIndex) : props.text;

            var contentProps = {
                className: 'z-content',
                style: {
                    padding: props.contentPadding
                }
            };

            contentProps.className = !isOver ? contentProps.className : contentProps.className + ' column-drag-hover';

            var content = props.renderCell ? props.renderCell(contentProps, text, props) : React.DOM.div(contentProps, text);

            var renderProps = assign({}, props);
            renderProps = _extends({}, renderProps, {
                opacity: opacity
            });
            delete renderProps.data;

            return connectDragSource(connectDropTarget(React.createElement(
                'div',
                renderProps,
                content,
                props.children
            )));

            // return (
            //     <div {...renderProps}>
            //         {content}
            //         {props.children}
            //     </div>
            // );
        }
    }]);

    return Cell;
}(React.Component)) || _class) || _class);


Cell.className = 'z-cell';

Cell.propTypes = {
    className: PropTypes.string,
    firstClassName: PropTypes.string,
    lastClassName: PropTypes.string,

    contentPadding: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    column: PropTypes.object,
    columns: PropTypes.array,
    index: PropTypes.number,

    style: PropTypes.object,
    text: PropTypes.any,
    rowIndex: PropTypes.number,

    connectDragSource: React.PropTypes.func,
    // connectDropTarget: React.PropTypes.func,
    isDragging: React.PropTypes.bool,
    id: React.PropTypes.any,
    handleColumnOrder: React.PropTypes.func
};

Cell.defaultProps = {
    text: '',

    firstClassName: 'z-first',
    lastClassName: 'z-last',

    defaultStyle: {}
};

exports.default = Cell;