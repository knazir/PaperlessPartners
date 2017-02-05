/* A tool that collects and compiles a collection of all assignment submissions
 * from Paperless for a single assignment. A directory is created for each final
 * student submission and one PDF with all SL feedback is created per file submitted.
 *
 * This is currently only runnable if you have PhantomJS installed. The only
 * two-step authentication supported for now is the push notification.
 *
 * @author Kashif Nazir (knazir) 2/2017
 */
"use strict";

var CONFIG = {
  // User Settings (EDIT HERE)
  USER:             '',
  PASSWORD:         '',

  // Login
  LOGIN_PAGE:       'https://paperless.stanford.edu/',
  LOGIN_FORM:       'login',
  USERNAME_INPUT:   'username',
  PASSWORD_INPUT:   'password',

  // Two-step authentication
  TWO_STEP_FORM:    'multifactor_send',

  // Paperless
  CLASS:            'cs106a',
  QUARTER:          'AUT2016',
  ASSIGNMENT:       2,
  PAPERLESS_URL:    'https://web.stanford.edu/class/cs198/cgi-bin/paperless',
  SUBMISSION_CLASS: 'latestSubmission',

  // Quarter Settings
  SPR:              0,
  SUM:              1,
  AUT:              2,
  WIN:              3,
  FIRST_QUARTER:    0,
  FIRST_YEAR:       2015,
  FIRST_VALUE:      109,
  DELAY:            100,

  // Other
  OUTPUT_DIR:       './submissions/'
};

/* * * * * * * * * *
 * PhantomJS Setup *
 * * * * * * * * * */
var page = require('webpage').create(),
    step = 0,
    loadInProgress = false;

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

page.onLoadStarted = function() {
  loadInProgress = true;
};

page.onLoadFinished = function() {
  loadInProgress = false;
};

page.onCallback = function(data) {
  if (data.render) {
    page.render(CONFIG.OUTPUT_DIR + data.studentID + '/' + data.studentID + '_' + data.page + '.pdf');
  }
};

/* * * * * *
 * Utility *
 * * * * * */
var getQuarterCode = function() {
  // Spr2015 is the 0th quarter of pair-programming
  var goalQuarter = CONFIG[CONFIG.QUARTER.substr(0, 3)],
      goalYear    = parseInt(CONFIG.QUARTER.substring(3)),
      year        = CONFIG.FIRST_YEAR,
      quarter     = CONFIG.FIRST_QUARTER,
      result      = CONFIG.FIRST_VALUE;

  while (year !== goalYear || quarter !== goalQuarter) {
    quarter = (quarter + 1) % 4;
    if (quarter === CONFIG.WIN) {
      year++;
    }
    result++;
  }
  return result;
};

var getAssignmentURL = function() {
  var result = [
    CONFIG.PAPERLESS_URL, getQuarterCode(), CONFIG.CLASS,
    'assignment', CONFIG.USER, 'assignment' + CONFIG.ASSIGNMENT
  ].join('/');
  return result;
};

/* * * * *
 * Steps *
 * * * * */
var loadLoginPage =   function() {
  console.log('Loading Stanford login page.');
  page.open('https://paperless.stanford.edu/');
};

var enterCredentials = function() {
  console.log('Entering credentials.');
  page.evaluate(function(CONFIG) {
    document.getElementById(CONFIG.USERNAME_INPUT).value = CONFIG.USER;
    document.getElementById(CONFIG.PASSWORD_INPUT).value = CONFIG.PASSWORD;
  }, CONFIG);
};

var submitLogin = function() {
  page.evaluate(function(CONFIG) {
    console.log('Logging in.');
    document.forms[CONFIG.LOGIN_FORM].submit();
  }, CONFIG);
};

var doTwoStep = function() {
  page.evaluate(function(CONFIG) {
    console.log('Waiting for two-step authentication.');
    document.forms[CONFIG.TWO_STEP_FORM].submit()
  }, CONFIG);
};

var loadAssignmentPage = function() {
  console.log('Loading assignment page.');
  page.open(getAssignmentURL());
};

var getSubmissionLinks = function() {
  return page.evaluate(function(CONFIG) {
    console.log('Converting all submissions to PDFs.');
    var submissions = document.getElementsByClassName(CONFIG.SUBMISSION_CLASS);

    return [].map.call(submissions, function (submission) {
      return submission.children[0].href;
    });
  }, CONFIG);
};

var makeRendererFunction = function makeRenderFunction(submissionLink) {
  var studentID = submissionLink.substring(submissionLink.lastIndexOf('/') + 1);
  return function() {
    console.log('Grabbing submission for ' + studentID);

    page.open(submissionLink, function() {
      page.evaluate(function (CONFIG) {
        var files = document.getElementsByClassName('filelink');
        for (var i = 0; i < files.length; i++) {
          // Freezes value of "i" from closure
          (function render(i) {
            window.setTimeout(function () {
              files[i].children[0].click();
              var student = window.location.pathname;
              student = student.substring(student.lastIndexOf('/') + 1, student.lastIndexOf('_'));
              window.callPhantom({render: true, studentID: student, page: i});
            }, (i + 1) * CONFIG.DELAY);
          })(i);
        }
      }, CONFIG);
    });
  }
};

var renderPDFs = function() {
  var assignmentLinks = getSubmissionLinks();

  for (var i = 0; i < assignmentLinks.length; i++) {
    steps.push(makeRendererFunction(assignmentLinks[i]));
  }
};


/* * * * * * *
 * Run Steps *
 * * * * * * */
var steps = [loadLoginPage, enterCredentials, submitLogin, doTwoStep, loadAssignmentPage, renderPDFs];

setInterval(function() {
  if (!loadInProgress && typeof steps[step] === 'function') {
    steps[step]();
    step++;
  }
  if (typeof steps[step] !== 'function') {
    console.log('Finished');
    phantom.exit();
  }
}, CONFIG.DELAY);