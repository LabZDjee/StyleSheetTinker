var passed = 0, failed = 0;

function tst(result) {
    if(result) {
        passed++;
        return "passed"
    }
    failed++;
    return "failed";
}

// Adds a getElementsByClassName function if the browser doesn't have one
// Limitation: only works with one class name
// Copyright: Eike Send http://eike.se/nd
// License: MIT License
if (!document.getElementsByClassName) {
  document.getElementsByClassName = function(search) {
    var d = document, elements, pattern, i, results = [];
    if (d.querySelectorAll) { // IE8
      return d.querySelectorAll("." + search);
    }
    if (d.evaluate) { // IE6, IE7
      pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
      elements = d.evaluate(pattern, d, null, 0, null);
      while ((i = elements.iterateNext())) {
        results.push(i);
      }
    } else {
      elements = d.getElementsByTagName("*");
      pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
      for (i = 0; i < elements.length; i++) {
        if ( pattern.test(elements[i].className) ) {
          results.push(elements[i]);
        }
      }
    }
    return results;
  }
}

var refSheet = new StyleSheetTinker({href: "tinker.css"});

appendInResults("1. get reference to linked stylesheet: " +
tst(refSheet && refSheet.getRules().length==3));

var refSheetRules = refSheet.getRulesBySelectorHint("\f.class1");

appendInResults("2. test getRulesBySelectorHint: " + tst(refSheetRules.length==1));

refSheetRules = refSheet.getRulesBySelectorHint(/\.class1$/);
appendInResults("3. test getRulesBySelectorHint: " + tst(refSheetRules.length==1));

var refSheet2 = new StyleSheetTinker({title: "local"});

appendInResults("4. get reference to local stylesheet: " +
  tst(refSheet2 && refSheet2.getRules().length==2));

var refSheetRules2 = refSheet2.getRulesBySelectorHint("class1");
appendInResults("5. test getRulesBySelectorHint: " + tst(refSheetRules2.length==2));

refSheet2.insertRule(".class10",
  "color: blue; text-shadow: 3px 2px black; background-color: red; border-radius: 12px; " +
  "transition-property: text-shadow, background-color, color; transition-duration: 5s;");
appendInResults("6. test insertRule: " + 
  tst(window.getComputedStyle(document.getElementsByClassName("class10")[0]).borderTopLeftRadius == "12px"));

refSheet2.insertRule(".class12", "color: black;");
refSheet2.insertRule(".class12", "color: red;");
refSheet2.insertRule(".class12", "color: yellow;");
appendInResults("7. test insertRule 3 times: " +
  tst(refSheet2.getRulesBySelectorHint("class12").length==3));

refSheet2.deleteRules(".class12", -1);
appendInResults("8. test deleteRules for all: " +
  tst(refSheet2.getRulesBySelectorHint(".class12").length==0));
refSheet2.insertRule(".class12", "color: black;");
refSheet2.insertRule(".class12", "color: red;");
refSheet2.insertRule(".class12", "color: yellow;");
refSheet2.deleteRules(".class12", 2);
appendInResults("9. test deleteRules for only last 2: " +
  tst(refSheet2.getRulesBySelectorHint("\f.class12").length==1));

appendInResults("10. test toString: " +
  tst(refSheet2.toString().indexOf("transition-property: text-shadow, background-color, color;")>0));

appendInResults("11. test stylesInRuleAsStr: " +
  tst(refSheet2.stylesInRuleAsStr(refSheet2.getRulesBySelectorHint("\f.class12")[0], "***")
    .indexOf("***color: black;")==0));

refSheet2.setRule(".class12", "color: purple;")
appendInResults("12. test setRule: " +
  tst(refSheet2.stylesInRuleAsStr(refSheet2.getRulesBySelectorHint("\f.class12")[0], "+=+")
    .indexOf("+=+color: purple;")==0 &&
    refSheet2.getRulesBySelectorHint("\f.class12").length==1));

var refSheetRule0=refSheet2.getRulesBySelectorHint("12")[0];

appendInResults("13. test accessStyleProperty just for reading: " +
  tst(refSheet2.accessStyleProperty(refSheetRule0, "color")=="purple"));

appendInResults("14. test accessStyleProperty with inconditional setting: " +
  tst(refSheet2.accessStyleProperty(refSheetRule0, "color", "green")=="purple" &&
      refSheet2.accessStyleProperty(refSheetRule0, "color")=="green"));

function accessStylePropertyTest(oldV, newV, rule) {
  return this==refSheet2 && oldV=="green" && newV=="yellow" && rule==refSheetRule0;
}
appendInResults("15. test accessStyleProperty with conditional setting: " +
  tst(refSheet2.accessStyleProperty(refSheetRule0, "color", "yellow", accessStylePropertyTest)=="green" &&
      refSheet2.accessStyleProperty(refSheetRule0, "color")=="yellow"));

var refSheet3 = new StyleSheetTinker({title: "otherLocal"});

var refSheetRules=refSheet.getRulesBySelectorHint();
refSheet3.injectRules(refSheetRules);
appendInResults("16. test getRulesBySelectorHint on all rules and injectRules: " +
  tst(refSheet3.toString()==refSheet.toString()));

refSheet3.clone(refSheet);
appendInResults("17. test clone: " +
  tst(refSheet3.toString()==refSheet.toString()));

if(failed) {
 appendInResults("<br>Not a full success: failed " + failed + " time(s) in " + (failed+passed) + " times");
} else {
 appendInResults("<br>Success!");
 refSheet2.accessStyleProperty(refSheet2.getRulesBySelectorHint("10")[1], "background-color", "green");
}

////////////////////