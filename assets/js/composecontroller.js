app.controller('composeController', ['$scope', '$http', function($scope, $http) {
    $scope.to = "kajanthan91@hotmail.com";
    $scope.cc = "25kajan@gmail.com";
    $scope.bcc = "kajanthan91@hotmail.com";
    $scope.subject = "This is the subject";
    $scope.message = "<div><pre><p>This is paragraph</p></pre><script>//console.log('Hello World');</script></div>";
    $scope.files;
    $scope.response;

    $scope.removeFile = function(file, index) {
        console.log(index);
        console.log(file);
        console.log($scope.files);
        $scope.files.splice(index, 1);
    };

    $scope.sendEmail = function() {
        var fd = new FormData();

        // var files = Object.keys($scope.files).map(function (key) {return $scope.files[key]});
        angular.forEach($scope.files, function(file){
            // fd.append('files[]', $scope.files);
            fd.append('files[]', file);
        });
        
        fd.append('to', $scope.to);
        fd.append('cc', $scope.cc);
        fd.append('bcc', $scope.bcc);
        fd.append('subject', $scope.subject);
        fd.append('mes', $scope.message);

        $http.post(
            '/gmail/data.php',
            fd,
            {
                transformRequest:angular.identity(),
                // headers:{'Content-Type':'application/x-www-form-urlencoded'}
                // headers:{'Content-Type':'multipart/form-data'}
                headers:{'Content-Type':undefined}
            }
        )
        .success(function(d) {
            $scope.response = d;
            console.log(d);
        });
    };
}]);