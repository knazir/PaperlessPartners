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

var config = {
  // User Settings (EDIT HERE)
  user:             '',
  password:         '',

  // Login
  LOGIN_PAGE:       'https://paperless.stanford.edu/',
  LOGIN_FORM:       'login',
  USERNAME_INPUT:   'username',
  PASSWORD_INPUT:   'password',

  // Two-step authentication
  TWO_STEP_FORM:    'multifactor_send',

  // Paperless
  course:           'cs106a',
  quarter:          'AUT2016',
  assignment:       2,
  PAPERLESS_URL:    'https://web.stanford.edu/class/cs198/cgi-bin/paperless',
  SUBMISSION_CLASS: 'latestSubmission',

  // Quarter Settings
  SPR:              0,
  SUM:              1,
  AUT:              2,
  WIN:              3,
  FIRST_QUARTER:    0,
  FIRST_YEAR:       2012,
  FIRST_VALUE:      97,
  DELAY:            100,

  // Other
  OUTPUT_DIR:       './tmp/downloads/'
};

/* * * * * * * * * *
 * PhantomJS Setup *
 * * * * * * * * * */
var page            = require('webpage').create(),
    system          = require('system'),
    step            = 0,
    loadInProgress  = false;

if (system.args.length < 6) {
  console.log('Please specify a sunet id, password, course, quarter, and assignment. Only specified ' +
               system.args.length + ' arguments.');
  phantom.exit(1);
}

/* Configure From Arguments */
config.user       = system.args[1];
config.password   = system.args[2];
config.course     = system.args[3];
config.quarter    = system.args[4];
config.assignment = system.args[5];
config.token      = system.args[6];

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
    page.render(config.OUTPUT_DIR + config.token + '/' + config.user + '/' + config.course + '/' + config.quarter +
                '/assignment' + config.assignment  + '/' + data.studentID + '/' + data.studentID + '_' +
                data.page + '.pdf');
  }
};

/* * * * * *
 * Utility *
 * * * * * */
var getQuarterCode = function() {
  // Spr2015 is the 0th quarter of pair-programming
  var goalQuarter = config[config.quarter.substr(0, 3)],
      goalYear    = parseInt(config.quarter.substring(3)),
      year        = config.FIRST_YEAR,
      quarter     = config.FIRST_QUARTER,
      result      = config.FIRST_VALUE;

  while (year !== goalYear || quarter !== goalQuarter) {
    quarter = (quarter + 1) % 4;
    if (quarter === config.WIN) {
      year++;
    }
    result++;
  }
  return result;
};

var getAssignmentURL = function() {
  return [
    config.PAPERLESS_URL, getQuarterCode(), config.course,
    'assignment', config.user, 'assignment' + config.assignment
  ].join('/');
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
  page.evaluate(function(config) {
    document.getElementById(config.USERNAME_INPUT).value = config.user;
    document.getElementById(config.PASSWORD_INPUT).value = config.password;
  }, config);
};

var submitLogin = function() {
  page.evaluate(function(config) {
    console.log('Logging in.');
    document.forms[config.LOGIN_FORM].submit();
  }, config);
};

var doTwoStep = function() {
  page.evaluate(function(config) {
    console.log('Waiting for two-step authentication.');
    document.forms[config.TWO_STEP_FORM].submit()
  }, config);
};

var loadAssignmentPage = function() {
  console.log('Loading assignment page.');
  page.open(getAssignmentURL());
};

var getSubmissionLinks = function() {
  return page.evaluate(function(config) {
    console.log('Converting all submissions to PDFs.');
    var submissions = document.getElementsByClassName(config.SUBMISSION_CLASS);

    return [].map.call(submissions, function (submission) {
      return submission.children[0].href;
    });
  }, config);
};

var makeRendererFunction = function makeRenderFunction(submissionLink) {
  var studentID = submissionLink.substring(submissionLink.lastIndexOf('/') + 1, submissionLink.lastIndexOf('_'));
  return function() {
    console.log('Grabbing submission for ' + studentID);

    page.open(submissionLink, function() {
      page.evaluate(function (config) {
        var files = document.getElementsByClassName('filelink');
        for (var i = 0; i < files.length; i++) {
          // Freezes value of "i" from closure
          (function render(i) {
            window.setTimeout(function () {
              files[i].children[0].click();
              var student = window.location.pathname;
              student = student.substring(student.lastIndexOf('/') + 1, student.lastIndexOf('_'));
              window.callPhantom({render: true, studentID: student, page: i});
            }, (i + 1) * config.DELAY);
          })(i);
        }
      }, config);
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
    phantom.exit();
  }
}, config.DELAY);