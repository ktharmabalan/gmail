app.filter('ceil', function() {
  return function(input) {
    return Math.ceil(input);
  };
});

app.filter('capitalize', function() {
    return function(s) {
        return (angular.isString(s) && s.length > 0) ? s[0].toUpperCase() + s.substr(1).toLowerCase() : s;
    }
});

app.filter('removeCategory', function() {
    return function(s) {
        return (angular.isString(s) && s.length > 0 && s.indexOf('CATEGORY_') > -1) ? s.toUpperCase().replace('CATEGORY_', '') : s;
    }
});

app.filter('removeEmail', function() {
    return function(s) {
        return (angular.isString(s) && s.length > 0 && s.match(/<.+>/g)) ? s.replace(/<.+>/g, '') : s;
    }
});

app.filter('removeArrows', function() {
    return function(s) {
        return (angular.isString(s) && s.length > 0 && s.match(/<.+>/g)) ? s.replace(/</g, '').replace(/>/g, '') : s;
    }
});

app.filter('joinNames', function() {
    return function(arr) {
        return arr.map(function(elem){
            return elem.fileName;
        }).join(' ,');
    }
});