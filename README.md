# mnm
Consumes "modified node modules" on the client side.

## What is `mnm`?
This is a way to continue to `require()` your modules in the browser without Browserifying your files and without further polluting the global namespace. Not that there's anything wrong with Browserify, but when you only have 2 or 3 files to include, this is fine.

Used only on the client side, `mnm` is a simple and light-weight alternative to Browserify for consuming _modified node modules._ It provides a Node.js-like `module` object and `require()` function.

## What are "modified node modules?"
Modified node modules are Node.js modules encapsulated in an IIFE. These files are thus simultaneously:

1. Node files consumed on the server side (via Node's `require` function).
2. Raw javascript files consumed on the client side (via `<script>` tags).

The purpose of the IIFE is to keep the module's contents private when included _as is_ on the client side. It is superfluous when consumed by Node.js (which provides its own closure) but innocuous.

## Usage
There are `module` and `exports` objects and a `require()` function, all used exactly as in Node.js. There is also a `module.cache()` function, called between between `<script>` tags to cache each module (in the behind-the-scenes `module.modules` hash).

##### `module`
This comes with an empty plain object, `module.exports`, which can be set to a whole new API object of your own creation, again exactly as in Node.js, _e.g.,_ `module.exports = yourAPI`.

##### `exports`
A formal parameter of the IIFE, this is thus a local reference to the actual parameter `module.exports`. Use it exactly as you would in a real Node.js module.

_Caution:_ It carries exactly the same caveat as in Node.js though, which is not to use it as an l-value for assigning a whole API. Doing so will uselessly set the local `exports` but not `module`'s. Instead use `module.exports` for that purpose.

##### `module.cache()`
Simply call `module.cache('yourmodule')` between each of your (synchronous) `<script src="file.js">...</script>` include elements.

For the curious, all that's happening here is:

1. The `module.modules` hash is getting a new entry with the name given, which is being set to reference the current `module.exports` (_i.e.,_ whatever came back from the script just included).
2. `module.exports` is being reinitialized to a new empty object for use by the next script.

_Violà!_

##### `require()`
There is also a simple `require()` function for dereferencing the modules hash. The only caveat for using this `require()` is that files need to be included "bottom-up" (so no circular references are allowed).

### Root script
The `require()` calls should appear in every node of the include tree excpet for the terminal nodes. In particular, at least one `require()` call must appear in your main (or "root") script. Obviously the file includes should occur before their references. Therefore, simply place this root script at the bottom of your `<body>...</body>` element; or wrap it in a `window.onload` (or DOM Ready) event.

> If you wish to place it in its own file and include it in your HTML file with a final `<script>` tag, note that because it's never referenced in a `require()` call, this final tag does not need to be cached (i.e., followed by an `module.npm()` call).

## Summary
So this is all pretty simple: Your `module.cache()` calls are applied flatly in your HTML _at file include time_ while your `require()` calls appear in your modified node module files to fetch code _at execution time_, including at least one such call from your root script.

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

(Actually the first parameter, `module,` in the above examples is not really needed because it's a global; and exports is only really needed when used. Nevertheless, I think it's clearer this way.)

Your main file (let's call it **index.html**) might look like this:
```html
<!DOCTYPE html>
<html>
    <head>
        <script src="math.js"></script>
        <script> module.cache('math.js'); </script>
 
        <script src="yada.js"></script>
        <script> module.cache('yada.js'); </script>
        
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
