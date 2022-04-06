sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'estarap/estaabaprap/test/integration/pages/MainListReport' ,
        'estarap/estaabaprap/test/integration/pages/MainObjectPage',
        'estarap/estaabaprap/test/integration/OpaJourney'
    ],
    function(JourneyRunner, MainListReport, MainObjectPage, Journey) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('estarap/estaabaprap') + '/index.html'
        });

        
        JourneyRunner.run(
            {
                pages: { onTheMainPage: MainListReport, onTheDetailPage: MainObjectPage }
            },
            Journey.run
        );
        
    }
);