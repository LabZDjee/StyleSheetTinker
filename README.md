# StyleSheetTinker

Bunch of functions bundled in an **object** called `StyleSheetTinker` in order to access a **DOM CSS stylesheet** and manage its rules (insert, delete, both, alter)

This is particularly useful when dynamic changes should be operated on interconnected **CSS** selectors

At construction this **object** references a stylesheet, external (defined by its `href` in a `link` element), or internal (defined by its `title` in a `style` element)

## Constructor

Constructor of the `StyleSheetTinker` **object**: takes an object as parameter which can contain as properties:

- either `href`: *CSS* file name (with extension, and possibly part of path in case of ambiguity)
- or `title`: stylesheet title (normally an internal stylesheet, as title for external stylesheets is of very special use)

`title` takes precedence over `href`: if both declared, so they cannot be combined in case of external stylesheet with `title` attribute *(to be honest this case of title as a selector for persistent, preferred, and alternate external stylesheets greatly eludes us...)*

## Methods

### `getRulesBySelectorHint`(selectorHint) 

get array of rules as objects whose `selectorText` values match a **selectorHint** in a style sheet returns empty array if not successful
**selectorHint**:

- if `undefined` all rules are selected
- can be a substring to search
- an entire string to search in which case **selectorHint** should start with '\f' which is of course *not* part of the search
- a regular expression 

### `includesRule`(rule)

returns `true` if **rule** (as an object) is part of this `StyleSheetTinker` object 

### `insertRule`(selector, contents)

inserts a rule at the end of the stylesheet with a **selector** and a **contents** as strings
**contents** is a normal *CSS* list of declarations without curly braces around
(semi-column with space separated)
	example: "`vertical-align: middle; overflow: hidden;`"

### `deleteRules`(selector, backNumber) 

deletes rules corresponding to a *CSS* **selector** as string in stylesheet
if **selector** is undefined, all rules are deleted
deletion starts from last matching rule in the array of rules
parameter **backNumber** governs how many are removed at maximum:

- **backNumber** can be `0` (none remove whatsoever, which is a legit value)
- **backNumber** can be higher than the number of rules or a negative value: all removed
- **backNumber** can be `null`, `undefined`, not of type `number`: only *last* one removed if any

### `setRule`(selector, contents, backNumber) 

combined sequence of `deleteRules` then `insertRule` (see above)
useful to avoid an overload of rules when same rule redefined frequently
in this case, it's probably careful to set **backNumer** to 1 in order to preserve a possible hierarchy

### `accessStyleProperty`(rule, property, newValue, testFunction) 

gets and possibly sets value of a style property from a **rule** object (this style property is looked for in  the `.style` object of the rule)
**rule**: an object from cssRules/rules
**property**: style property as string primitive, in kebab case (e.g. `font-family`) or camel case (e.g. `fontFamily`)
**newValue**: if a string primitive, sets the property to this new value (e.g. "`120px`") - if not a string, ignored
**testFunction**: if **newValue** is a string primitive and **testFunction** is a `Function`, applies it with as arguments: the `StyleSheetTinker` object, the present value, the new value and **rule** as arguments and only make changes property to **newValue** if this function returns `true` - this function is called through `call` so `this` in the function references the current `StyleSheetTinker` object
**return**: `null` in case of failure, otherwise the old value of the property
<u>important caveat</u>: use *atomic* style properties (e.g `background-color`) not *shorthands* (e.g `background`) as *shorthands* are very browser dependent

### `injectRules`(rules) 

injects array of rule objects through parameter **rules** at the end of style sheet

### `clone`(originStyleSheetTinker) 

clones styles from **originStyleSheetTinker** `StyleSheetTinker` object into current style sheet (which is previously emptied of any style)

### `stylesInRuleAsStr`(rule, prepend) 

gets information about styles in a rule object one property and property value by line

**syntax** per item: `<property>: <propertyValue>;`

**prepend**: optional string to add before each line (usually white spaces)

### `toString`()

dumping all the stylesheet rules as a string

 respects *CSS* syntax

## Structure of a stylesheet considered in this implementation 

- all stylesheets are contained into `document.styleSheets`
- linked stylesheets have a `href` property with the entire path and filename to the *CSS* file
- internal stylesheets are identified by their `title` property in this implementation 
- a stylesheet contains a property named `cssRules` (but formerly it was `rules` on some browsers)
- this property bears a list of **rules**
- each rule has a property `selectorText` containing selector as a string (e.g. "`div.aClass p`"). Note= with IE, Edge this field is read-only
- each rule also has a property `cssText` containing the entire rule (selector+style) as a string `e.g. ".frame { width: 100%; background: green; }"`
- it has also a property `style` containing all the information on *CSS* styles as camel cased properties shorthands are not always kept (depends on browser so be careful), they are developed in their components, like font which is developed into font-style, font-weight, font-size, font-height, font-family

## DOM resources this implementation uses

- `document.styleSheets`
- `insertRule`
- `addRule`
- `deleteRule`

