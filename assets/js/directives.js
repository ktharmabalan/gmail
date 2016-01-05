app.directive('fileInput', ['$parse', function($parse) {
    return {
        restict: 'A',
        link: function(scope, elem, attrs) {
            elem.bind('change', function() {
                $parse(attrs.fileInput).assign(scope, elem[0].files);
                scope.$apply();
            });
        }
    }
}]);