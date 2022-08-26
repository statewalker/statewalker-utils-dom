# @statewalker/utils-dom: DOM Utilities

This package contains DOM manipulation utilities used in other packages.
* `getElementInvalidation(element)` - returns a Promise instance associated with the given DOM element; the returned promise is resolved when the element is removed from the DOM tree 
* `bindView(iterator, action, options)` - creates and returns a DOM element which is updated each time when the given iterator returns a new value
* `replaceDomContent(element, node)` - replaces the content of the given DOM element by the given DOM node (element or text node).
* `toDomNode(value, doc)` - transforms the given value to a DOM node; if the given value is already a DOM node then it is returned "as is", without modifications.


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

The `action(...)` callback method recieve the following structure:
* `params` : parameters object
* `params.init` - sets the initialization function; it is called when the view is attached to the DOM
* `params.done` - sets the finalization function which is called when the view is removed from the DOM
* `params.update` - sets a new function to call on each value update; the function defined with the `update` method has the following signature: `(view, value, oldValue) => { ... }`


```javascript
import { bindView } from '@statewalker/utils-dom'

// Generate a new sequence of values to update
const it = generateValues(50, 2000);
// Create a new view to append to the document.
const view = bindView(it, ({ init, update, done }) => {
  
  // Initializes our view:
  init((view) => view.innerHTML = "Initializing...");
  
  // Destroy the view and clean up all associated resources:
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

## `toDomNode(value, doc)`

This method transforms the given value to a DOM node; if the given value is already a DOM node then it is returned "as is", without modifications. It is especially useful to render values on the DOM.

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