(angular.module('tummytrials.setupctrl',
                ['tummytrials.text', 'tummytrials.setupdata',
                 'tummytrials.experiments'])

.controller('Setup2Ctrl', function($scope, Text, SetupData) {
    Text.all_p()
    .then(function(text) {
        $scope.text = text;
        $scope.setupdata = SetupData;
        if(!$scope.setupdata.symptom) {
            $scope.setupdata.symptom = [];
            for (var i = 0; i < text.setup2.symptoms.length; i++)
                $scope.setupdata.symptom[i] = false;
        }
    });
})

.controller('Setup3Ctrl', function($scope, Text, SetupData) {
    Text.all_p()
    .then(function(text) {
        $scope.text = text;
        $scope.setupdata = SetupData;
    });
})

.controller('Setup4Ctrl', function($scope, Text, SetupData) {
    Text.all_p()
    .then(function(text) {
        $scope.text = text;
        $scope.setupdata = SetupData;
    });
})

.controller('Setup5Ctrl', function($scope, $state, Text, SetupData,
                                    Experiments) {
    function datestr(d)
    {
        var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        var mons = ["Jan","Feb","Mar","Apr","May","Jun",
                    "Jul","Aug","Sep","Oct","Nov","Dec"];
        return days[d.getDay()] + ", " + mons[d.getMonth()] + " " + d.getDate();
    }

    function create_study_p(text)
    {
        // Return a promise to create the study; i.e., add document to
        // database. Data comes from SetupData. Caller warrants that all
        // the data is there.
        //
        var exper = {};
        var sd = new Date(SetupData.startdate);
        var durms = SetupData.duration * 24 * 60 * 60 * 1000;
        var ed = new Date(sd.getTime() + durms);

        exper.name = 'Trial beginning ' + datestr(sd);
        exper.start_time = Math.floor(sd.getTime() / 1000);
        exper.end_time = Math.floor(ed.getTime() / 1000);
        exper.status = 'active';
        exper.comment = '';
        exper.symptoms = [];
        for (var i = 0; i < text.setup2.symptoms.length; i++)
            if (SetupData.symptom[i])
                exper.symptoms.push(text.setup2.symptoms[i].symptom);
        var tix = Number(SetupData.trigger);
        exper.trigger = text.setup3.triggers[tix].trigger;
        exper.reminders = []; // XXX need to add these
        exper.reports = [];
        return Experiments.add(exper);
    }

    Text.all_p()
    .then(function(text) {
        $scope.text = text;
        $scope.setupdata = SetupData;

        // Function to create study when all data is available.
        //
        function begin_study()
        {
            create_study_p(text)
            .then(function(experid) {
                $state.go('mytrials');
            });
        }
        $scope.begin_study = begin_study;

        // Set some values in the scope for the template to use:
        //
        // study_data_complete:  (bool) All study data has been specified
        // chosen_topic:         (string) Description of the study
        // chosen_symptoms:      (string array) Symptoms to follow
        // chosen_date_range:    (string) Start and end dates

        $scope.study_data_complete = true;

        if ($scope.setupdata.trigger) {
            var tix = Number($scope.setupdata.trigger);
            var lowtrigger = text.setup3.triggers[tix].trigger.toLowerCase();
            $scope.chosen_topic =
                text.setup5.topic.replace('{TRIGGER}', lowtrigger);
        } else {
            $scope.chosen_topic = text.setup5.notopic;
            $scope.study_data_complete = false;
        }

        $scope.chosen_symptoms = [];
        for (var i = 0; i < text.setup2.symptoms.length; i++)
            if ($scope.setupdata.symptom[i])
                $scope.chosen_symptoms.push(text.setup2.symptoms[i].symptom);
        if ($scope.chosen_symptoms.length < 1) {
            $scope.chosen_symptoms.push(text.setup5.nosymptom);
            $scope.study_data_complete = false;
        }

        if ($scope.setupdata.startdate && $scope.setupdata.duration) {
            // Start date looks something like this, here in Seattle:
            // "2015-08-31T07:00:00.000Z"
            //
            var sd = new Date($scope.setupdata.startdate);
            // Last day of study (not first day after study).
            var durms = ($scope.setupdata.duration - 1) * 24 * 60 * 60 * 1000;
            var ed = new Date(sd.getTime() + durms);
            $scope.chosen_date_range = datestr(sd) + ' — ' + datestr(ed);
        } else {
            $scope.chosen_date_range = text.setup5.nolength;
            $scope.study_data_complete = false;
        }
    });
})

);