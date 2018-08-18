/*
 * bunch of functions bundled in an object in order to access a DOM stylesheet
 * and manage its rules (insert, delete, both)
 * at construction this object references a stylesheet, external (defined by its 'href' in a 'link' element)
 * or internal (defined by its 'title' in a 'style' element)
 * 
 * external resources used:
 *    document.styleSheets
 *    insertRule
 *    addRule
 *    deleteRule
 * 
 * structure of a stylesheet considered in this implementation:
 *  - all stylesheets are contained into 'document.styleSheets'
 *  - linked stylesheets have a 'href' property with the entire path and filename to the css file
 *  - internal stylesheets are identified by their 'title' property in this implementation 
 *  - a stylesheet contains a property named 'cssRules' (but formerly it was 'rules' on some browsers)
 *  - this property bears a list of rules
 *  - each rule has a property 'selectorText' containing selector as a string (e.g. "div.aClass p")
 *  - each rule also has a property 'cssText' containing the entire rule (selector+style) as a string
 *    e.g. ".frame { width: 100%; background: green; }"
 *  - it has also a property 'style' containing all the information on CSS styles as camel cased properties
 *    shorthands are not always kept (depends on browser so be careful),
 *    they are developed in their components, like font which is developed
 *     into font-style, font-weight, font-size, font-height, font-family
 */

 /* the object: */
var StyleSheetTinker = (function() {

  var cssRuleCode = document.all ? "rules" : "cssRules"; // accounts for IE and else

/*
 * get stylesheet reference (href) given its filename (in fact the ending portion string of the filename)
 * returns null if not found
 */
  function getStyleSheetByHref(fileName) {
    function endsWith(str, suffix) {return str.indexOf(suffix, str.length - suffix.length);}
    for (var i = 0; i < document.styleSheets.length; i++) {
      var sheet = document.styleSheets[i];
      if (sheet.href && endsWith(sheet.href, fileName)) return sheet;
    }
    return null;
  }

/*
 * get stylesheet reference given its title
 * returns null if not found
 */
  function getStyleSheetByTitle(title) {
    for (var i = 0; i < document.styleSheets.length; i++) {
      var sheet = document.styleSheets[i];
      if (sheet.title && sheet.title == title) return sheet;
    }
    return null;
  }

  /*
  * Constructor of the object: takes a 'ref' object as parameter which can contain as properties:
  *  - either 'href': CSS file name (with extension, and possibly part of path in case of ambiguity)
  *  - or 'title': stylesheet title (normally an internal stylesheet, as title for external
  *   stylesheets is of very special use)
  * 'title' takes precedence over 'href': if both declared, so they cannot be combined in case of external
  * stylesheet with 'title' (to be honest this case of title as a selector for persistent, preferred, and alternate external stylesheets
  * greatly eludes us...)
  */
  return function(ref) {
    var proto = Object.getPrototypeOf(this);
    this.styleSheet = null;
    if (ref.href) this.styleSheet = getStyleSheetByHref(ref.href);
    if (ref.title) this.styleSheet = getStyleSheetByTitle(ref.title);
    /*
     * in order to simply get all rules
     */
    if(!proto.getRules)
     proto.getRules = function(){
      if(this.styleSheet)
       return this.styleSheet[cssRuleCode];
      return null;
     }
    return this; // not needed, but a useful reminder
  }; 
})();

// utility that returns true if 'rule' (as an object) is part of this object
StyleSheetTinker.prototype.includesRule = function(rule) {
  rules = this.getRules();
  for(i in rules)
   if(rules[i] == rule)
    return true;
  return false;
}

/*
 * inserts a rule at the end of the stylesheet with a selector and a contents as strings
 * contents is a normal CSS list of declarations without curly braces around
 * (semi-column with space separated)
 *  example: "vertical-align: middle; overflow: hidden;"
 */
StyleSheetTinker.prototype.insertRule = function(selector, contents) {
  if(this.styleSheet) {
    if(this.styleSheet.insertRule)
     this.styleSheet.insertRule(selector + "{" + contents + "}", this.getRules().length);
    else if(this.styleSheet.addRule)
     this.styleSheet.addRule(selector, contents);
  }
}

/*
 * deletes rules corresponding to a selector as string in stylesheet
 * if selector is undefined, all rules are deleted
 * deletion starts from last matching rule in the array of rules
 * parameter 'backNumber' governs how many are removed at maximum
 *  backNumber can be 0 (none remove whatsoever, which is a legit value)
 *  backNumber can be higher than the number of rules or a negative value: all removed
 *  backNumber can be null, undefined, not of type 'number': only last one removed if any
 */
StyleSheetTinker.prototype.deleteRules = function(selector, backNumber) {
  if(this.styleSheet) {
    var rules = this.getRules();
    if(typeof backNumber != "number")
     backNumber = 1;
    else if(backNumber<=0)
     backNumber = rules.length;
    else
     backNumber |= 0; // polishes as an integral value
    if(typeof selector == "undefined")
     backNumber = rules.length;
    if(this.styleSheet.deleteRule)
     for(var i=rules.length-1; i>=0 && backNumber; i--) {
      if(typeof selector == "undefined" || rules[i].selectorText == selector) {
        this.styleSheet.deleteRule(i);
        backNumber--;
      }
     }
  }
}

/*
 * combined sequence of deleteRules then insertRule (see above)
 * useful to avoid an overload of rules when same rule redefined frequently
 * in this case, it's probably careful to set backNumer to 1 in order to preserve a possible hierarchy
 */
StyleSheetTinker.prototype.setRule = function(selector, contents, backNumber) {
  this.deleteRules(selector, backNumber);
  this.insertRule(selector, contents)
}

/*
 * Utility for getting information about styles in a rule
 * one property and property value by line
 * syntax per item: <property>: <propertyValue>;
 * prepend: optional string to add before each line (usually white spaces)
 */
StyleSheetTinker.prototype.stylesInRuleAsStr = function(rule, prepend) {
  var result = "";
  if (this.includesRule(rule)) {
    if (!prepend || !prepend instanceof String) prepend = "";
    var stylePart = /.*{(.*)}/.exec(rule.cssText)[1];
    var subParts = stylePart.split(";");
    for (index in subParts) {
      var part = subParts[index].trim();
      if (part.length) result += prepend + part + ";\n";
    }
  }
  return result;
}

/*
 * utility for dumping all the stylesheet rules as a string
 * respects CSS syntax
 */
StyleSheetTinker.prototype.toString = function() {
  var rules = this.getRules();
  var result="";
  for(var i=0; i<rules.length; i++) {
   result += rules[i].selectorText + " {\n" + 
             this.stylesInRuleAsStr(rules[i], " ") + (i<rules.length-1?"}\n":"}");
  }
  return result;
}

  /*
   * get array of rules whose selectorText values match a selectorHint in a style sheet
   * returns empty array if not successful
   * selectorHint:
   *  - if undefined all rules are selected
   *  - can be a substring to search
   *  - an entire string to search in which case selectorHint should start with '\f' which
   *    is of course not part of the search
   *  - a regular expression 
   */
StyleSheetTinker.prototype.getRulesBySelectorHint = function(selectorHint) {
    var results = [];

    if (!this.styleSheet) {
      return results;
    }
    var typeOfSearch;
    if(typeof selectorHint == "undefined") {
      typeOfSearch = 0;
    } else if (selectorHint instanceof RegExp) {
      typeOfSearch = 3;
    } else if (selectorHint.charAt(0) == "\f") {
      selectorHint = selectorHint.substring(1);
      typeOfSearch = 1;
    } else {
      typeOfSearch = 2;
    }
    var rules = this.getRules();
    for (var i = 0; i < rules.length; i++)
      switch (typeOfSearch) {
        case 0:
          results.push(rules[i]);
          break;
        case 1:
          if (rules[i].selectorText == selectorHint)
           results.push(rules[i]);
          break;
        case 2:
          if (rules[i].selectorText.indexOf(selectorHint) != -1)
           results.push(rules[i]);
          break;
        case 3:
          if (selectorHint.test(rules[i].selectorText))
           results.push(rules[i]);
          break;
      }
    return results;
  };

// get and possibly set value of a style property from a rule (this style property is looked for in 
//  the .style object of the rule)
// rule: an object from cssRules/rules
// property: style property as string primitive, in kebab case (e.g. font-family) or camel case (e.g. fontFamily)
// newValue: if a string primitive, sets the property to this new value (e.g. "120px")
//           if not a string, ignored
// testFunction: if newValue is a string primitive and testFunction is a Function, applies it
//   with as arguments: the object, the present value, the new value and rule
//   and only changes property to newValue if this function returns true
//   this function is called through 'call' so 'this' in the function references the current object
// return: null in case of failure, otherwise the old value of the property
// important caveat: use atomic style properties (e.g background-color) not shorthands (e.g background)
//    as shorthands are very browser dependent
StyleSheetTinker.prototype.accessStyleProperty = function(rule, property, newValue, testFunction) {
  function toCamelCase(str) {
    // no kebab, no snake, and no spaces: don't process
    if(!/[-_ ]/.test(str))
     return str;
    // lower cases the string
    return str.toLowerCase()
      // replaces any - or _ characters with a space 
      .replace( /[-_]+/g, ' ')
      // uppercases the first character in each group immediately following a space 
      // (delimited by spaces) 
      .replace( / (.)/g, function(c) { return c.toUpperCase(); })
      // removes spaces 
      .replace( / /g, '' );
  }
  var oldValue;
  if(!this.includesRule(rule) || typeof property != "string") {
    property = undefined;
  }
  if(typeof property != "undefined") {
   property = toCamelCase(property);
   oldValue = rule.style[property];
  }
  if(typeof property == "undefined" || typeof oldValue == "undefined")
   return null;
  if(typeof newValue == "string") {
   if(!(testFunction instanceof Function) ||
      testFunction.call(this, oldValue, newValue, rule)){
    rule.style[property]=newValue;
   }
  }
  return(oldValue);
}

//
// injects array of 'rules' at the end of style sheet
//
StyleSheetTinker.prototype.injectRules = function(rules) {
  var index;
  for(var i=0; i<rules.length; i++) {
    var rule=rules[i];
    var stylePart = /.*{(.*)}/.exec(rule.cssText)[1];
    var subParts = stylePart.split(";");
    var css="";
    for (var index in subParts) {
      var part = subParts[index].trim();
      if (part.length) css += part + "; ";
    }
    this.setRule(rules[i].selectorText, css, 0);
  }
}

//
// clones styles from 'originStyleSheetTinker' style sheet into current style sheet
//
StyleSheetTinker.prototype.clone = function(originStyleSheetTinker) {
  var refSheetRules=originStyleSheetTinker.getRulesBySelectorHint();
  this.deleteRules();
  this.injectRules(refSheetRules);
}