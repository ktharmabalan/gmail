var app = angular.module("app", ['ngAnimate', 'ngRoute', 'ui.bootstrap']);

app.config(['$compileProvider', function($compileProvider) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):|data:/);
    // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
}]);