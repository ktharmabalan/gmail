app.filter('ceil', function() {
    return function(input) {
        return Math.ceil(input);
    };
});

app.filter('trimText', function() {
    return function(s) {
        return (angular.isString(s) && s.length > 120) ? s.substring(0, 120) + '...' : s;
    }
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

app.filter('removeSpace', function() {
    return function(s) {
        s = (angular.isString(s) && s.length > 0 && s.match(/^\s+/g)) ? s.replace(/^\s+/g, '') : s;
        s = (angular.isString(s) && s.length > 0 && s.match(/\s+$/g)) ? s.replace(/\s+$/g, '') : s;
        return s;
    }
});

app.filter('removeQuotes', function() {
    return function(s) {
        s = (angular.isString(s) && s.length > 0 && s.match(/^\"+/g)) ? s.replace(/^\"+/g, '') : s;
        s = (angular.isString(s) && s.length > 0 && s.match(/\"+$/g)) ? s.replace(/\"+$/g, '') : s;
        return s;
    }
});

app.filter('removeArrows', function() {
    return function(s) {
        return (angular.isString(s) && s.length > 0 && s.match(/<.+>/g)) ? s.replace(/</g, '').replace(/>/g, '') : s;
    }
});

app.filter('joinNames', function() {
    return function(arr) {
        return arr.map(function(elem) {
            return elem.fileName;
        }).join(' ,');
    }
});

app.filter('displayDate', ['$filter', function($filter) {
    return function(date) {
        var date1 = $filter('date')(new Date(date), 'yyyy/MM/dd HH:mm:ss');
        var date2 = $filter('date')(new Date(), 'yyyy/MM/dd HH:mm:ss');
        var date3 = Math.round((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));

        if (date3 === 0) {
            return $filter('date')(new Date(date1), 'h:mm a');
        } else if (date3 > 0 && date3 < 7) {
            return $filter('date')(new Date(date1), 'EEEE');
        } else if (date3 >= 7) {
            return $filter('date')(new Date(date1), 'MMM d, y');
        } else {
            return $filter('date')(new Date(date1), 'MMM d, y');
        }
    }
}]);

app.filter('orderObjectBy', function() {
    return function(input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for (var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function(a, b) {
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return a - b;
        });
        return array;
    }
});

app.filter('bytes', function() {
    return function(bytes) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes) || bytes == 0) return '0';
        var units = {1: 'KB', 2: 'MB', 3: 'GB', 4: 'TB'},
            measure, floor, precision;
        if (bytes > 1099511627775) {
            measure = 4;
        } else if (bytes > 1048575999 && bytes <= 1099511627775) {
            measure = 3;
        } else if (bytes > 1024000 && bytes <= 1048575999) {
            measure = 2;
        } else if (bytes <= 1024000) {
            measure = 1;
        }
        floor = Math.floor(bytes / Math.pow(1024, measure)).toString().length;
        if (floor > 3) {
            precision = 0
        } else {
            precision = 3 - floor;
        }
        return (bytes / Math.pow(1024, measure)).toFixed(precision) + units[measure];
    }
});