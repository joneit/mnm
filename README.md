# mnm
Consumes "modified node modules" on the client side.
 
Supplies `module` and `module.exports` objects, plus a `require()` function for use on the client side, as a simple and light-weight alternative to Browserify for consuming modified node modules.

Modified node modules are encapsulated with an IIFE. Thes

You don't get Browserify's file concatenation, but for simple projects with 1 to 3 includes, this is fine (so long as your node modules are of the "modified" persuasion).

`npm` creates a light-weight `module` object with an empty `module.exports` object. These are fed as parameters to the IFFE in a "modified node module" (a node file with an enveloping IFFE).
 
These files are thus simultaneously:
1. node files; _and_
2. raw javascript files referenced via `<script>` tags on the client side.

In the latter case, simply call `module.mnm('yourmodule')` between each `<script src="file.js">...</script>` include element. All this does is (a) adds a new entry to the module hash (`module.modules` if you must know) using the given name and sets it to reference `module.exports`; and (b) resets `module.exports` to a new empty object for use by the next script (af any). Violà!

There is also a simple `require()` function for dereferencing the modules hash. The only caveat for using this `require()` is that files need to be included "bottom-up" (so circular references are not permitted).

So this is all pretty simple: Your `module.mnm()` calls are applied flatly in your HTML at file include time while your `require()` calls appear in your modified node module files at every node of the include tree, including in particular your main (root) script, but excluding the terminal nodes.

Your root script includes the tip of the include tree, typically wrapped in a window.onload event. This script could be in your HTML file at the bottom of your `<body>...</body>` element, or wrapped in a `window.onload` event. If wrapped, it could be included with a final `<script>` tag. (This `<script>` tag would not need to be followed by an `module.npm()` call inasmuch as it's never referenced in a `require()` call.)

All together now, given a tree of modified node modules such as:

Module math.js (an API using `exports`):
```javascript
(function (module, exports) {
    exports.square = function(n) { return n * n; }
})(module, module.exports)
```

Module yada.js (an API using `module.exports`):
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

Your main file might look like this:
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
