# GT-FHIR CasperJS Automated Tests

These are automated CasperJS tests for the Georgia Tech FHIR Server.

## CasperJS

CasperJS is a navigation scripting & testing utility for PhantomJS and SlimerJS written in Javascript, useful for writing functional test suites.

http://casperjs.org/

## Usage

1. Install the CasperJS development version
  * http://docs.casperjs.org/en/latest/installation.html
1. Navigate to this `gt-fhir-casperjs` directory
1. Execute the tests

  ````
  casperjs test  tests/ --includes=inc.js
  ````
