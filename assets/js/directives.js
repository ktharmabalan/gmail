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