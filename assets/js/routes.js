app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: './assets/partials/index.html',
            controller: 'mainController'
        })
        .when('/compose', {
            templateUrl: './assets/partials/compose.html',
            controller: 'composeController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);