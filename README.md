# @statewalker/utils-dom: DOM Utilities

This package contains the following DOM utilities used in other packages:
* `bindView(iterator, action, options)` - creates and returns a DOM element which is updated each time when the given iterator returns a new value
* `getElementInvalidation(element)` - returns a Promise instance associated with the given DOM element; the returned promise is resolved when the element is removed from the DOM tree 
* `replaceDomContent(element, node)` - replaces the content of the given DOM element by the given DOM node (element or text node).
* `trackDomNode(node, { onAdd, onRemove, getContainer })` - tracks the node and calls the specified onAdd/onRemove methods when the node is attached/removed from the DOM
* `toDomNode(value, doc)` - transforms the given JavaScript value to a DOM node; text, numbers and boolean values are tranformed to Text instances; objects are serialized (with the JSON.stringify method) and also transformed to Text instances; DOM nodes are returned "as is", without modifications.

## `getElementInvalidation(element)`

This method returns a Promise instance associated with the given DOM element; the returned promise is resolved when the element is removed from the DOM tree.

This method returns a single Promise instance for the specific DOM element. This Promise is stored in the `invalidation` field of the element.


```javascript

const div = document.createElement("div");
document.body.appendChild(div);

// Get the invalidation promise associated with the given element:
const invalidation = getElementInvalidation(div);
...
// This function is called when the DOM element is detached from the DOM tree:
const onDetach = () => console.log('The element was detached from DOM...');
invalidation.then(onDetach);

// Check that the second time this method returns the same invalidation instance:
const invalidation2 = getElementInvalidation(div);
assert(invalidation === invalidation2);

// Shows this message:
// 'The element was detached from DOM...'
```


## `bindView(iterator, action, options)`

This utility function allows to update HTML elements when the specified iterator yields a new value.
It also allows to easily initialize the element and cleanup associated resources when this element is detached from DOM.


```javascript
const elm: Element = bindView(
  // Async iterator returning new values to visualize:
  iterator : AsyncIterator,

  // The function returning the element
  action : Function,

  // Optional parameters:
  options : Object = {
    // Function used to handle errors
    handleError = console.error,

    // This function returns the root element to listen
    getRoot
    
  } : object = {}
)
```

The `action(...)` callback method recieves the following structure:
* `params` : parameters object
* `params.init` - sets the initialization function; it is called when the view is attached to the DOM
* `params.done` - sets the finalization function which is called when the view is removed from the DOM
* `params.update` - sets a new function to call on each value update; the function defined with the `update` method has the following signature: `(view, value, oldValue) => { ... }`

Example 1: in this example the activation method registers only one method to init/done/update the created view.
```javascript
import { bindView } from '@statewalker/utils-dom'

// Generate a new sequence of values to update
// (see below for the implementation of the "generateValues" method):
const it = generateValues(50, 2000);

// Create a new view to append to the document.
const view = bindView(it, ({ init, update, done }) => {
  // View initialization:
  init((view) => view.innerHTML = "Initializing...");
  // Destroys the view and cleans up all associated resources:
  done((view) => view.innerHTML = "Destroying...");
  // This method is called each time when the iterator returns a new value:
  update((view, value, oldValue) => {
    view.innerText = `Counter: ${value}!`;
  })
  // Create and returns the view to update:
  return document.createElement("div");
})

// Append the resulting view to the document:
document.body.appendChild(view);
```


Example 2: in this example the activation method registers two methods
for each of the "init/done/update" stages:
```javascript
import { bindView } from '@statewalker/utils-dom'

// Generate a new sequence of values to update:
// (see below for the implementation of the "generateValues" method):
const it = generateValues(50, 2000);

// In this example the activation function registers two callbacks 
// for each of the "init/update/done" stages:
// - one method changes the conntent of the view
// - the second method prints some messages in the log
const div = bindView(it, ({ init, update, done }) => {
  
  // View initialization:
  init((view) => view.innerHTML = "Initializing...");
  // The second function to call on the view initialization:
  init(() => console.log("Init."))
  
  // Destroys the view and cleans up all associated resources:
  done((view) => view.innerHTML = "Destroying...");
  // The second method to call on initialization:
  done(() => console.log("Done."))

  // This method is called each time when the iterator returns a new value:
  update((view, value, oldValue) => {
    view.innerText = `Counter: ${value}!`;
  })
  // Print the values returned by the iterator:
  done((view, newValue, oldValue) => console.log("- Update:", { oldValue, newValue }));

  // Create and returns the view to update:
  return document.createElement("div");
})
// Append the resulting view to the document:
document.body.appendChild(div);

```

The `generateValues` method used in the examples above:
```javascript
// This function generates values used to update the view
async function* generateValues(count = 100, maxTimeout = 1000) {
  for (let i = 0; i < count; i++) {
    yield i;
    await new Promise(r => setTimeout(Math.random() * maxTimeout));
  }
}

```

## `replaceDomContent(element, node)` 

This method replaces the content of the given DOM element by the given DOM node (element or text node).

Example:
```javascript
import { replaceDomContent } from '@statewalker/utils-dom'

const root = document.querySelector("#root");

const div = document.createElement("div");
div.innerText = 'Hello, world';
replaceDomContent(root, div);

```

## `trackDomNode(node, { onAdd, onRemove, getContainer })`

This method tracks the node and calls the specified onAdd/onRemove methods when the node is attached/removed from the DOM.

Parameters: 
* `node` - the DOM node to track
* `params` - an object containing method parameters
* `params.onAdd` - an optional callback method invoked after the node is attached to DOM; it takes the node as the single parameter
* `params.onRemove` - an optional callback method invoked when the node is removed from DOM; it recieves two parameters: the node itself and a boolean flag showing if the node was notified as attached or not (if the onAdd method was called before)
* `params.getContainer` - returns the container to track for the specified node


## `toDomNode(value, doc)`

This method transforms the given JavaScript value to a DOM node; text, numbers and boolean values are tranformed to Text instances; objects are serialized (with the JSON.stringify method) and also transformed to Text instances; DOM nodes are returned "as is", without modifications.

Example:
```javascript
import { toDomNode } from '@statewalker/utils-dom'

const root = document.querySelector("#root");

// Transforms string a Text instance:
root.appendChild(toDomNode("Hello, world")) 

// Transforms the given number to a Text instance:
root.appendChild(toDomNode(12345)) 

// Returnes the DOM node without modifications: 
const h3 = toDomNode(document.createElement("h3"));
h3.innerHTML = "Hello, there!"
root.appendChild(h3)

```