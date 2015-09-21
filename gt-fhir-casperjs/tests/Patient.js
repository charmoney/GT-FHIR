casper.test.begin('Patient resource test', function(test) {
    var conf = new GTFHIRConfiguration();
    var urlPatient = conf.url + '/resource?serverId=gatechrealease&resource=Patient';
    var selCRUDTab = '#resource-nav-tabs > li:nth-child(3) > a';
    var patientRead01   = null;
    var patientInsert   = null;
    var patientCreateID = -1;
    var patientUpdate   = null;
    var patientDelete   = null;
    var patientRead02   = null;

    // Patient Read Request 01
    casper.start(urlPatient, function() {
        casper.clickLabel('CRUD Operations');
        test.assertExists('#read-id', 'Read 01: CRUD form present');
        casper.fillSelectors('#tab-otheractions > div > div:nth-child(2)', {
            '#read-id': conf.ids.Patient
        }, false);
        casper.captureSelector('patient-read01-entered.png', '#tab-otheractions > div');
        casper.click('#read-btn');
        casper.waitForSelector("#resultTable",
            function pass() {
                test.pass("Read 01: Found #resultTable");
            },
            function fail() {
                test.fail("Read 01: Did not load element #resultTable");
            },
            10000
        );
    });

    // Patient Read Response 01
    casper.then(function() {
        casper.capture('patient-read01-result.png');
        test.assertSelectorHasText(
            '#resultTable > tbody > tr:nth-child(1) > td:nth-child(2)',
            'HTTP/1.1 200 OK',
            'Read 01: HTTP Code 200'
        );
        var resultJSON = casper.evaluate(function() {
            return $('#resultBodyActualPre').text();
        });
        patientRead01 = JSON.parse(resultJSON);
        test.assert(patientRead01.id == conf.ids.Patient, 'Read 01: Patient has expected ID');
        patientInsert = patientRead01;
        delete patientInsert.id;
        delete patientInsert.text;
        patientInsert.name[0].family = conf.uuid + patientInsert.name[0].family;
        // require('utils').dump(patientInsert);
    });

    // Patient Verify Request
    casper.thenOpen(urlPatient, function() {
        this.clickLabel('CRUD Operations');
        test.assertExists('#read-id', 'Verify: CRUD form present');
        casper.fillSelectors('#tab-otheractions > div > div:nth-child(14)', {
            '#resource-validate-body': JSON.stringify(patientInsert)
        }, false);
        // require('utils').dump(patientInsert);
        // this.echo(JSON.stringify(patientInsert));

        casper.captureSelector('patient-verify-entered.png', '#tab-otheractions > div');
        casper.click('#resource-validate-btn');
        this.waitForSelector("#resultTable",
            function pass() {
                test.pass("Verify: Found #resultTable");
            },
            function fail() {
                test.fail("Verify: Did not load element #resultTable");
            },
            10000
        );
    });
    // Patient Verify Response
    casper.then(function() {
        casper.capture('patient-verify-result.png');
        test.assertSelectorHasText(
            '#resultTable > tbody > tr:nth-child(1) > td:nth-child(2)',
            'HTTP/1.1 200 OK',
            'Verify: HTTP Code 200'
        );
        var resultJSON = casper.evaluate(function() {
            return $('#resultBodyActualPre').text();
        });
        var patientVerify = JSON.parse(resultJSON);
        // require('utils').dump(patientVerify);
        test.assert(1 == patientVerify.issue.length, 'Verify: 1 issue returned');
        test.assert('Validation succeeded' == patientVerify.issue[0].details, 'Verify: Validation succeeded');
        if (!(1 == patientVerify.issue.length && 'Validation succeeded' == patientVerify.issue[0].details)) {
            // Dump the verification issue(s) if it's not perfect
            require('utils').dump(patientVerify.issue);
        }
    });

    // Patient Create Request
    casper.thenOpen(urlPatient, function() {
        this.clickLabel('CRUD Operations');
        test.assertExists('#read-id', 'Create: CRUD form present');
        casper.fillSelectors('#tab-otheractions > div > div:nth-child(8)', {
            '#resource-create-body': JSON.stringify(patientInsert)
        }, false);
        // require('utils').dump(patientInsert);
        this.echo(JSON.stringify(patientInsert));

        casper.captureSelector('patient-create-entered.png', 'div.main');
        casper.click('#resource-create-btn');
        this.waitForSelector("#resultTable",
            function pass() {
                test.pass("Create: Found #resultTable");
            },
            function fail() {
                test.fail("Create: Did not load element #resultTable");
            },
            10000
        );
    });
    // Patient Create Response
    casper.then(function() {
        casper.captureSelector('patient-create-result.png', 'div.main');
        test.assertSelectorHasText(
            '#resultTable > tbody > tr:nth-child(1) > td:nth-child(2)',
            'HTTP/1.1 201 Created',
            'Create: HTTP Code 201'
        );
    });
    casper.then(function() {
        var resultType = casper.evaluate(function() {
            return $("#resultTable .headerName:contains('Content-Type') + .headerValue ").text();
        });
        var resultLocation = casper.evaluate(function() {
            return $("#resultTable .headerName:contains('Content-Location') + .headerValue ").text();
        });
        var resultRaw = casper.evaluate(function() {
            return $('#resultBodyActualPre').text();
        });
        // casper.echo(resultRaw);
        var patientCreate = null;
        if (0 === resultLocation.lastIndexOf('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Patient/', 0)) {
            patientCreateID = resultLocation.split(/[\\/]/).pop();
            test.assertMatch(patientCreateID, /[0-9]+/, 'Create Patient ID is a number');
            require('utils').dump(patientCreateID);
       } else if (0 === resultType.lastIndexOf('application/json', 0)) {
            test.pass('Create: Result content type application/json');
            patientCreate = JSON.parse(resultRaw);
            require('utils').dump(patientCreate);
        } else if (0 === resultType.lastIndexOf('text/plain', 0)) {
            if(0===resultRaw.trim().length) {
                test.pass('Delete: Result content type text/plain. No response body.');
            } else {
                test.fail('Update: Result content type text/plain with response body. Raw response: ' + resultRaw);
            }
        } else {
            test.fail('Create: Result content type unexpected: ' + resultType);
        }
    });

    // Patient Read Request 02
    casper.thenOpen(urlPatient, function() {
        casper.clickLabel('CRUD Operations');
        test.assertExists('#read-id', 'Read 02: CRUD form present');
        casper.fillSelectors('#tab-otheractions > div > div:nth-child(2)', {
            '#read-id': patientCreateID
        }, false);
        casper.captureSelector('patient-read02-entered.png', 'div.main');
        casper.click('#read-btn');
        casper.waitForSelector("#resultTable",
            function pass() {
                test.pass("Read 02: Found #resultTable");
            },
            function fail() {
                test.fail("Read 02: Did not load element #resultTable");
            },
            10000
        );
    });

    // Patient Read Response 02
    casper.then(function() {
        casper.capture('patient-read02-result.png');
        test.assertSelectorHasText(
            '#resultTable > tbody > tr:nth-child(1) > td:nth-child(2)',
            'HTTP/1.1 200 OK',
            'Read 02: HTTP Code 200'
        );
        var resultJSON = casper.evaluate(function() {
            return $('#resultBodyActualPre').text();
        });
        patientRead02 = JSON.parse(resultJSON);
        test.assert(patientRead02.id == patientCreateID, 'Read 02: Patient has expected ID');
        // require('utils').dump(patientRead02);
    });

    // Patient Update Request
    casper.thenOpen(urlPatient, function() {
        this.clickLabel('CRUD Operations');
        test.assertExists('#read-id', 'Update: CRUD form present');
        patientUpdate = patientRead02;
        delete patientUpdate.id;
        patientUpdate.name[0].given[0] = conf.uuid + patientUpdate.name[0].given[0];

        casper.fillSelectors('#tab-otheractions > div > div:nth-child(11)', {
            '#resource-update-id' : patientCreateID,
            '#resource-update-body': JSON.stringify(patientUpdate)
        }, false);
        // require('utils').dump(patientUpdate);
        this.echo(JSON.stringify(patientUpdate));

        casper.captureSelector('patient-update-entered.png', 'div.main');
        casper.click('#resource-update-btn');
        this.waitForSelector("#resultTable",
            function pass() {
                test.pass("Update: Found #resultTable");
            },
            function fail() {
                test.fail("Update: Did not load element #resultTable");
            },
            10000
        );
    });

    // Patient Update Response
    casper.then(function() {
        casper.captureSelector('patient-update-result.png', 'div.main');
        test.assertSelectorHasText(
            '#resultTable > tbody > tr:nth-child(1) > td:nth-child(2)',
            'HTTP/1.1 200 OK',
            'Update: HTTP Code 201'
        );
    });
    casper.then(function() {
        var resultType = casper.evaluate(function() {
            return $("#resultTable .headerName:contains('Content-Type') + .headerValue ").text();
        });
        var resultLocation = casper.evaluate(function() {
            return $("#resultTable .headerName:contains('Content-Location') + .headerValue ").text();
        });
        var resultRaw = casper.evaluate(function() {
            return $('#resultBodyActualPre').text();
        });
        // casper.echo(resultRaw);
        var patientUpdate = null;
        if (0 === resultLocation.lastIndexOf('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Patient/', 0)) {
            var patientUpdateID = resultLocation.split(/[\\/]/).pop();
            test.assertMatch(patientUpdateID, /[0-9]+/, 'Update Patient ID is a number');
            test.assertEquals(patientUpdateID, patientCreateID, 'Update Patient ID matches Create Patient ID');
            require('utils').dump(patientUpdateID);
       } else if (0 === resultType.lastIndexOf('application/json', 0)) {
            test.pass('Update: Result content type application/json');
            patientUpdate = JSON.parse(resultRaw);
            require('utils').dump(patientUpdate);
        } else if (0 === resultType.lastIndexOf('text/plain', 0)) {
            if(0===resultRaw.trim().length) {
                test.pass('Delete: Result content type text/plain. No response body.');
            } else {
                test.fail('Update: Result content type text/plain with response body. Raw response: ' + resultRaw);
            }
        } else {
            test.fail('Update: Result content type unexpected: ' + resultType);
        }
    });

    // Patient Delete Request
    casper.thenOpen(urlPatient, function() {
        this.clickLabel('CRUD Operations');
        test.assertExists('#read-id', 'Delete: CRUD form present');

        casper.fillSelectors('#tab-otheractions > div > div:nth-child(5)', {
            '#resource-delete-id' : patientCreateID
        }, false);
        this.echo(JSON.stringify(patientUpdate));

        casper.captureSelector('patient-delete-entered.png', 'div.main');
        casper.click('#resource-delete-btn');
        this.waitForSelector("#resultTable",
            function pass() {
                test.pass("Delete: Found #resultTable");
            },
            function fail() {
                test.fail("Delete: Did not load element #resultTable");
            },
            10000
        );
    });

    // Patient Delete Response
    casper.then(function() {
        casper.captureSelector('patient-delete-result.png', 'div.main');
        test.assertSelectorHasText(
            '#resultTable > tbody > tr:nth-child(1) > td:nth-child(2)',
            'HTTP/1.1 204 No Content',
            'Delete: HTTP Code 204'
        );
    });
    casper.then(function() {
        var resultType = casper.evaluate(function() {
            return $("#resultTable .headerName:contains('Content-Type') + .headerValue ").text();
        });
        var resultRaw = casper.evaluate(function() {
            return $('#resultBodyActualPre').text();
        });
        // casper.echo(resultRaw);
        if (0 === resultType.lastIndexOf('application/json', 0)) {
            test.fail('Delete: Result content type application/json');
            require('utils').dump(patientUpdate);
        } else if (0 === resultType.lastIndexOf('text/plain', 0)) {
            if(0===resultRaw.trim().length) {
                test.pass('Delete: Result content type text/plain. No response body.');
            } else {
                test.fail('Update: Result content type text/plain with response body. Raw response: ' + resultRaw);
            }
        } else {
            test.fail('Delete: Result content type unexpected: ' + resultType);
        }
    });

    // Patient Read Request 03
    casper.thenOpen(urlPatient, function() {
        casper.clickLabel('CRUD Operations');
        test.assertExists('#read-id', 'Read 03: CRUD form present');
        casper.fillSelectors('#tab-otheractions > div > div:nth-child(2)', {
            '#read-id': patientCreateID
        }, false);
        casper.captureSelector('patient-read03-entered.png', 'div.main');
        casper.click('#read-btn');
        casper.waitForSelector("#resultTable",
            function pass() {
                test.pass("Read 03: Found #resultTable");
            },
            function fail() {
                test.fail("Read 03: Did not load element #resultTable");
            },
            10000
        );
    });

    // Patient Read Response 03
    casper.then(function() {
        casper.capture('patient-read03-result.png');
        test.assertSelectorHasText(
            '#resultTable > tbody > tr:nth-child(1) > td:nth-child(2)',
            'HTTP/1.1 404 Not Found',
            'Read 03: HTTP Code 404'
        );
    });

    // Wrap it up
    casper.run(function() {
        test.done();
    });
});