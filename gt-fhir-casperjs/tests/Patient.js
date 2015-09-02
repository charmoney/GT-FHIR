casper.test.begin('Patient resource test', function(test) {
    var conf = new GTFHIRConfiguration();
    var urlPatient = conf.url + '/resource?serverId=gatechrealease&resource=Patient';
    var selCRUDTab = '#resource-nav-tabs > li:nth-child(3) > a';
    var patientRead01 = null;
    var patientInsert = null;

    // Patient Read Request 01
    casper.start(urlPatient, function() {
        casper.clickLabel('CRUD Operations');
        test.assertExists('#read-id', 'Read 01: CRUD form present');
        casper.fillSelectors('#tab-otheractions > div > div:nth-child(2)', {
            '#read-id': conf.ids.Patient
        }, false);
        casper.captureSelector('patient-read-entered.png', '#tab-otheractions > div');
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
        casper.capture('patient-read-result.png');
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
        if(!(1 == patientVerify.issue.length && 'Validation succeeded' == patientVerify.issue[0].details)) {
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
        // this.echo(JSON.stringify(patientInsert));

        casper.captureSelector('patient-create-entered.png', '#tab-otheractions > div');
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
        casper.capture('patient-create-result.png');
        test.assertSelectorHasText(
            '#resultTable > tbody > tr:nth-child(1) > td:nth-child(2)',
            'HTTP/1.1 200 OK',
            'Create: HTTP Code 200'
        );
        var resultJSON = casper.evaluate(function() {
            return $('#resultBodyActualPre').text();
        });
        var patientCreate = JSON.parse(resultJSON);
        require('utils').dump(patientCreate);
    });

    // Wrap it up
    casper.run(function() {
        test.done();
    });
});