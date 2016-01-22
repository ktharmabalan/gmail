app.directive('loading',   ['$http' ,function ($http) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs)
        {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (v)
            {
                if(v){
                    console.log('showing');
                    elm.show();
                }else{
                    console.log('hide');
                    elm.hide();
                }
            });
        }
    };
}]);

app.directive('sideLabels', function() {
    return {
        templateUrl: './assets/directives/side_labels.html',
        replace: true
    }
});

app.directive('messageDetails', function() {
    return {
        templateUrl: './assets/directives/message_details.html',
        replace: true
    }
});

app.directive('messageList', function() {
    return {
        templateUrl: './assets/directives/message_list.html',
        replace: true
    }
});

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

app.directive('popupNotFocused', ['$document', '$parse', function($document, $parse) {
    return {
        link: function( $scope, $element, $attributes ){

            var scopeExpression = $attributes.popupNotFocused,
                id = $attributes.referenceId,
                onDocumentClick = function(event){
                    var isChild = $element.find(event.target).length > 0;

                    console.log(event.target.id + ", " + id);
                    if(!isChild && event.target.id !== id) {
                        $scope.$apply(scopeExpression);
                    }
                };

            $document.on("click", onDocumentClick);

            $element.on('$destroy', function() {
                $document.off("click", onDocumentClick);
            });
        }
    }
}]);