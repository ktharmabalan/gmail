var app = angular.module("app", ['ngAnimate', 'ngRoute']);

app.config(['$compileProvider', function($compileProvider) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):|data:/);
    // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
}]);