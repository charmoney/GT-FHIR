function GTFHIRConfiguration() {
    this.ids = {
        Patient: 33
    };
    this.url = 'http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp';
    // https://www.uuidgenerator.net/
    this.uuid = '_3b2e29c7-27bb-4445-9409-64eb61c2ae4d_';
}

casper.options.viewportSize = {
    width: 1280,
    height: 650
};

// casper.on('page.error', function(msg, trace) {
//     this.echo('Error: ' + msg, 'ERROR');
//     for (var i = 0; i < trace.length; i++) {
//         var step = trace[i];
//         this.echo('   ' + step.file + ' (line ' + step.line + ')', 'ERROR');
//     }
// });