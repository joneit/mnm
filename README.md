# mnm
Consumes "modified node modules" on the client side.

## Introduction
Introduces two globals objects, `module` and `module.exports`, plus a `require()` function for use on the client side as a simple and light-weight alternative to Browserify for consuming modified node modules. Not that there's anything wrong with Browserify, but when you only have a 2 to 3 file to include, this is fine.

## What are "modified node modules?"

Modified node modules are Node.js modules encapsulated in an IIFE. These files are thus simultaneously:

1. Node files consumed on the server side (via Node's `require` function).
2. Raw javascript files consumed on the client side (via `<script>` tags).

The purpose of the IIFE is to keep the module's contents private when included as is on the client side.

## What is mnm?
Used only on the cient side, `mnm` creates a light-weight `module` object with an empty `module.exports` object. These are fed as parameters to the IIFE in a "modified node module."

## Usage
There are two functions, one to cache the modules; and one to require them.
#### module.mnm()
Simply call `module.mnm('yourmodule')` between each of your (synchronous) `<script src="file.js">...</script>` include elements.

For the curious, all the `mnm` method is doing here is:

1. Add a new entry to the `module.modules` hash (using the name given) and set it to reference `module.exports` (_i.e.,_ whatever came back from the included script).
2. Reinitialize `module.exports` to a new empty object for use by the next script (af any).

Violà!

#### require()
There is also a simple `require()` function for dereferencing the modules hash. The only caveat for using this `require()` is that files need to be included "bottom-up" (so circular references are not permitted).

## Summary
So this is all pretty simple: Your `module.mnm()` calls are applied flatly in your HTML _at file include time_ while your `require()` calls appear in your modified node module files to fetch code _at execution time_.

The `require()` calls typcially appear in every node of the include tree, including in particular your main (root) script, but excluding the terminal nodes.

Your root script includes the tip of the include tree, typically wrapped in a window.onload event. This script could be in your HTML file at the bottom of your `<body>...</body>` element, or wrapped in a `window.onload` event. If wrapped, it could be included with a final `<script>` tag. This final tag is not cached (not followed by an `module.npm()` call) because it's never referenced in a `require()` call.

## Example
All together now, given a tree of modified node modules such as:

Module **math.js** (an API using `exports`):
```javascript
(function (module, exports) {
    exports.square = function(n) { return n * n; }
})(module, module.exports)
```

Module **yada.js** (an API using `module.exports`):
```javascript
(function (module, exports) {
    var square = require('math');
    
    module.exports = {
        something: 3,
        somethingElse: math.square
    };
})(module, module.exports)
```

(Actually the first parameter `module` in the above examples is not really needed in the above since it's a global, but I think it's clearer this way.)

Your main file (let's call it **index.html**) might look like this:
```html
<!DOCTYPE html>
<html>
    <head>
        <script src="math.js"></script>
        <script> module.mnm('math.js'); </script>
 
        <script src="yada.js"></script>
        <script> module.mnm('yada.js'); </script>
        
        <script>
            window.onload = function () {
                var yada = require('yada');
                
                var n = document.getElementById('n'),
                    doIt = document.getElementById('doIt'),
                    answer = document.getElementById('answer');
                
                doIt.addEventListener('click', function() {
                    answer.innerHTML = yada.square(n.value);
                });
            };
        </script>
    </head>
    <body>
        <input id="n">
        <input id="doIt" type="button" value="Square It">
        <span id="answer"></span>
    </body>
 </html>
 ```
