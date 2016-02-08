'use strict';

/**
 * Mill takes a single string argument, which it then transforms into DOM elements, and returns an array.
 * There are rules to the input string, which are identical to the rules that the Emmet/ZenCoding plugin sets.
 * Furthermore typical css selectors work here as well.
 * @param {String} command
 * @returns {Array} elements
 */
function mill(command) {
    var elements = [];

    if (typeof command !== 'string') {
        return elements;
    }

    var elementTag = command.match(/^\w{1,}/),
    indexOfPlus = command.indexOf('+'),
    indexOfGreater = command.indexOf('>');

    elementTag = elementTag ? elementTag[0] : elementTag;

    if (elementTag) {
        // Use the front modifier.
        if (indexOfPlus >= 0 && (indexOfPlus < indexOfGreater || indexOfGreater < 0)) {
            // Creates siblings through the '+' modifier.
            var siblings = command.split(/\+(.+)?/);
            for (var sibIdx = 0, siblingArr; sibIdx < siblings.length; sibIdx++) {
                siblingArr = mill(siblings[sibIdx]);
                elements = elements.concat(siblingArr);
            }
            return elements;
        }
        var branch = command.split(/>(.+)?/);
        var current = branch[0];

        var baseElement = document.createElement(elementTag);

        // Handles addition of classes through the '.' modifier.
        var classes = current.match(/\.\w{1,}/g);
        if (classes) {
            for (var classIdx= 0; classIdx < classes.length; classIdx++) {
                baseElement.classList.add(classes[classIdx].replace('.', ''));
            }
        }

        // Handles addition of attributes through the '[]' modifier.
        var attributes = current.match(/\[.{1,}\]/g);
        if (attributes) {
            for (var attrIdx= 0, attr; attrIdx < attributes.length; attrIdx++) {
                attr = attributes[attrIdx];
                attr = attr.slice(1, attr.length - 1).split('=');
                var attrValue = attr[1]? attr[1].slice(1, attr[1].length - 1) : '';
                baseElement.setAttribute(attr[0], attrValue);
            }
        }

        // Handles multiplication of elements through the '*' modifier.
        var amount = current.match(/\*\d{1,}/);
        if (amount) {
            amount = parseInt(amount[0].replace('*', ''));
        } else { amount = 1; }

        // Handles addition of an id through the '#' modifier.
        // If a multiplication is present, ids are numbered.
        var id = current.match(/#\w{1,}/);
        id = id ? id[0] : id;

        for (var countIdx= 0, newEl; countIdx < amount; countIdx++) {
            newEl = baseElement.cloneNode(true);
            if (id) {
                newEl.setAttribute('id', amount > 1 ? id + '-' + (countIdx + 1) : id);
            }
            elements.push(newEl);
        }

        // Handles nested elements through the '>' modifier.
        var children = branch[1];
        if (children) {
            var childrenElements = mill(children);
            for (var elIdx= 0; elIdx < elements.length; elIdx++) {
                for (var childIdx= 0, newEl; childIdx < childrenElements.length; childIdx++) {
                    newEl = childrenElements[childIdx].cloneNode(true);
                    elements[elIdx].appendChild(newEl);
                }
            }
        }
    }

    return elements;
}