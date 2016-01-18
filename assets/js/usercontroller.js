app.controller('userController', ['$scope', '$http', function($scope, $http) {
	$scope.getData = function(args) {
        var url = "/gmail/data.php?";
        angular.forEach(args, function(value, index) {
            url += index + "=" + value + "&";
        });
        if (url.substr(url.length - 1) == "&") {
            url = url.slice(0, -1);
        }

        $http.get(url).success(function(response) {
        	if (args['search'] == "profile" && args['method'] == "get") {
                console.log(response);
                $scope.username = response['email'];
            }
        });
    };

    $scope.getData({
        'search': 'profile',
        'method': 'get'
    });
}]);