'use strict';

var React = require('react')
var assign = require('object-assign')
var normalize = require('react-style-normalizer')
import { findDOMNode } from 'react-dom';

import { DragSource, DropTarget } from 'react-dnd';
var TEXT_ALIGN_2_JUSTIFY = {
    right: 'flex-end',
    center: 'center'
}

function copyProps(target, source, list) {

    list.forEach(function (name) {
        if (name in source) {
            target[name] = source[name]
        }
    })

}

var PropTypes = React.PropTypes



const style = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move'
};

const cardSource = {
    beginDrag(props) {
        return {
            id: props.id,
            index: props.index
        };
    }
};

const cardTarget = {
    hover(props, monitor, component) {
        const tItem = monitor.getItem();
        if (!tItem) {
            return
        }
        const dragIndex = tItem.index;
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

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
        props.moveCard(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
    }
};



@DropTarget("CARD", cardTarget, connect => ({
    connectDropTarget: connect.dropTarget()
}))
@DragSource("CARD", cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class Cell extends React.Component {

    // displayName: 'ReactDataGrid.Cell',

    prepareClassName(props) {
        var index = props.index
        var columns = props.columns
        var column = props.column

        var textAlign = column && column.textAlign

        var className = props.className || ''

        className += ' ' + Cell.className

        if (columns) {
            if (!index && props.firstClassName) {
                className += ' ' + props.firstClassName
            }

            if (index == columns.length - 1 && props.lastClassName) {
                className += ' ' + props.lastClassName
            }
        }

        if (textAlign) {
            className += ' z-align-' + textAlign
        }

        return className
    }

    prepareStyle(props) {
        var column = props.column
        var sizeStyle = column && column.sizeStyle

        var alignStyle
        var textAlign = (column && column.textAlign) || (props.style || {}).textAlign

        if (textAlign) {
            alignStyle = { justifyContent: TEXT_ALIGN_2_JUSTIFY[textAlign] }
        }

        var style = assign({}, props.defaultStyle, sizeStyle, alignStyle, props.style)

        return normalize(style)
    }

    prepareProps(thisProps) {

        var props = assign({}, thisProps)

        if (!props.column && props.columns) {
            props.column = props.columns[props.index]
        }

        props.className = this.prepareClassName(props)
        props.style = this.prepareStyle(props)

        return props
    }

    render() {
        const { DndText, isDragging, connectDragSource, connectDropTarget } = this.props;
        const opacity = isDragging ? 0 : 1;

        var props = this.p = this.prepareProps(this.props)

        var column = props.column
        var textAlign = column && column.textAlign
        var text = props.renderText ?
            props.renderText(props.text, column, props.rowIndex) :
            props.text

        var contentProps = {
            className: 'z-content',
            style: {
                padding: props.contentPadding
            }
        }

        var content = props.renderCell ?
            props.renderCell(contentProps, text, props) :
            React.DOM.div(contentProps, text)

        var renderProps = assign({}, props)
        renderProps = {
            ...renderProps,
            opacity
        }
        delete renderProps.data

        return connectDragSource(connectDropTarget(
            <div {...renderProps} >
                {content}
                {props.children}
            </div>
        ));

        // return (
        //     <div {...renderProps}>
        //         {content}
        //         {props.children}
        //     </div>
        // );
    }
}

Cell.className = 'z-cell';

Cell.propTypes = {
    className: PropTypes.string,
    firstClassName: PropTypes.string,
    lastClassName: PropTypes.string,

    contentPadding: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]),

    column: PropTypes.object,
    columns: PropTypes.array,
    index: PropTypes.number,

    style: PropTypes.object,
    text: PropTypes.any,
    rowIndex: PropTypes.number,

    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    // DndIndex: React.PropTypes.number.isRequired,
    isDragging: React.PropTypes.bool.isRequired,
    id: React.PropTypes.any.isRequired,
    // DndText: React.PropTypes.string.isRequired,
    moveCard: React.PropTypes.func.isRequired
};

Cell.defaultProps ={
    text: '',

    firstClassName: 'z-first',
    lastClassName: 'z-last',

    defaultStyle: {}
};

export default Cell;
