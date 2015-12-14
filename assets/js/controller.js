(function() {
    var app = angular.module("app", ['ngAnimate']);

    app.controller('mainController', ['$scope', '$http', '$sce', '$filter', function($scope, $http, $sce, $filter) {
        $scope.threadIds = [];
        $scope.threads = [];
        $scope.selectedThread;
        $scope.labels;
        $scope.topLabels = [];
        $scope.selectedLabel;

        $scope.setSelectedLabel = function(label) {
            $scope.selectedLabel = label;
            var obj = {'search': 'thread', 'method': 'list', 'labelIds': 'INBOX'};
            // obj.labelIds = obj.labelIds + "," + "SENT";
            // obj.labelIds = obj.labelIds + "," + label.name;
            // console.log(obj);
            $scope.getData(obj);
        }

        $scope.isLabelSelected = function(label) {
            return $scope.selectedLabel === label;
        }

        $scope.clearThreads = function() {
            $scope.threads = [];
        }

        $scope.setSelectedThread = function(thread) {
            var editedThread = thread;
            angular.forEach(thread.messages, function(v, i) {
                editedThread.messages[i].payload.headers['Date'] = new Date(v.payload.headers['Date']);
                // v.payload.headers['Date'] = new Date(v.payload.headers['Date']);
                angular.forEach(v.payload.parts, function(v1, i1) {
                    angular.forEach(v1.body, function(v2, i2) {
                        // console.log(v1.body);
                        if(v2 !== null) {
                            if (v2.data !== undefined) {
                                v2.data = window.atob(v2.data.replace(/-/g, '+').replace(/_/g, '/'));
                                console.log(v2.data);
                            }

                            if (v2.attachmentId != null) {
                                v2.attachmentId = v2.attachmentId.replace(/-/g, '+').replace(/_/g, '/');
                                v2.attachment.data = window.atob(v2.attachment.data.replace(/-/g, '+').replace(/_/g, '/'));
                                console.log(v2.attachment.data);
                            }
                        }
                    });

                    angular.forEach(v1.parts, function(v2, i2) {
                        angular.forEach(v2.body, function(v3, i3) {
                            if(v3 !== null) {
                                if (v3.data !== undefined) {
                                    v3.data = window.atob(v3.data.replace(/-/g, '+').replace(/_/g, '/'));
                                    console.log(v3.data);
                                }
                            }
                        });
                    });
                });
            });
            $scope.selectedThread = editedThread;
        }

        $scope.isThreadSelected = function(thread) {
            return $scope.selectedThread === thread;
        }

        $scope.addToThreads = function(thread) {
            angular.forEach(thread.messages, function(v, i) {
                v.payload.headers['Date'] = new Date(v.payload.headers['Date']);
                angular.forEach(v.payload.parts, function(v1, i1) {
                    angular.forEach(v1.body, function(v2, i2) {
                        // console.log(v1.body);
                        if(v2 !== null) {
                            if (v2.data !== undefined) {
                                v2.data = window.atob(v2.data.replace(/-/g, '+').replace(/_/g, '/'));
                                console.log(v2.data);
                            }

                            if (v2.attachmentId != null) {
                                v2.attachmentId = v2.attachmentId.replace(/-/g, '+').replace(/_/g, '/');
                                v2.attachment.data = window.atob(v2.attachment.data.replace(/-/g, '+').replace(/_/g, '/'));
                                console.log(v2.attachment.data);
                            }
                        }
                    });

                    angular.forEach(v1.parts, function(v2, i2) {
                        angular.forEach(v2.body, function(v3, i3) {
                            if(v3 !== null) {
                                if (v3.data !== undefined) {
                                    v3.data = window.atob(v3.data.replace(/-/g, '+').replace(/_/g, '/'));
                                    console.log(v3.data);
                                }
                            }
                        });
                    });
                });
            });
            $scope.threads.push(thread);
            $scope.setSelectedThread($scope.threads[0]);
        }

        $scope.renderHtml = function(html_code) {
            return $sce.trustAsHtml(html_code);
        };

        $scope.getData = function(args) {
            var url = "/gmail/data.php?";
            angular.forEach(args, function(value, index) {
                url += index + "=" + value + "&";
            });
            if(url.substr(url.length - 1) == "&") {
                url = url.slice(0, -1);
            }

            // console.log(url);

            $http.get(url).success(function(response) {
                if(args['search'] == "thread" && args['method'] == "list") {
                    $scope.clearThreads();
                    angular.forEach(response.threadList, function(value, index) {
                        $scope.getData({search: 'thread', method: 'get', id: value.id});
                    });
                } else if(args['search'] == "thread" && args['method'] == "get") {
                    $scope.addToThreads(response);
                } else if(args['search'] == "label" && args['method'] == "list") {
                    $scope.labels = response;
                    angular.forEach($scope.labels, function(value, index) {
                        if (value.name.indexOf("CATEGORY_") != -1) {
                            $scope.topLabels.push({
                                "name": value.name,
                                "value": value.name.replace("CATEGORY_", "")
                            });
                        }
                    });

                    $scope.setSelectedLabel($scope.topLabels[0]);
                }
            });
        };

        $scope.getData({'search': 'label', 'method': 'list'});
    }]);
    
/*    EEE, d MMM yyyy h:mm:ss -Z
    Thu, 3 Dec 2015 11:52:40 -0500

    var extractField = function(json, fieldName) {
      return json.payload.headers.filter(function(header) {
        return header.name === fieldName;
      })[0].value;
    };
    var date = extractField(response, "Date");
    var subject = extractField(response, "Subject");

    var part = message.parts.filter(function(part) {
      return part.mimeType == 'text/html';
    });

    	$scope.styleDemo = function() {
    		if(!$scope.styler) {
    			return;
    		}

    		return {
    			background: 'red',
    			fontWeight: 'bold'
    		};
    	};
    });

    // Filter
    app.filter('truncate', function() {
    	// filter returns a function
    	return function(input, limit) {
    		return (input.length > limit) ? input.substr(0, limit) + '...' : input;
    	};
    });

    // Routes
    // accepts an anonymous function, that is injected with the $routeProvider service
    app.config(function($routeProvider){
    	// add route with path as string and options for route as object
    	$routeProvider.when('/', {
    		// controller, templateUrl: path to html file for view
    		controller: 'indexCtl',
    		templateUrl: 'assets/partials/index.html'
    	}).when('/add-contact', {
    		contr
    	});

    });

    app.controller('indexCtrl', function($scope){

    });

    angular.forEach($scope.threads, function(value, index) {
        angular.forEach(value.messages, function(v, i) {
            // console.log(v.payload.headers['Date']);
            v.payload.headers['Date'] = new Date(v.payload.headers['Date']);
            // console.log(new Date(v.payload.headers['Date']));
            // console.log($filter('date')(new Date(v.payload.headers['Date']), "dd/MM/yyyy"));
            angular.forEach(v.payload.parts, function(v1, i1) {
                angular.forEach(v1.body, function(v2, i2) {
                    // console.log(v2.data);
                    // v2.data = decodeURIComponent(escape(window.atob(v2.data.replace(/-/g, '+').replace(/_/g, '/'))));
                    // if()
                    if (v2.data !== null) {
                        v2.data = window.atob(v2.data.replace(/-/g, '+').replace(/_/g, '/'));
                    }

                    if (v2.attachmentId != null) {
                        v2.attachmentId = v2.attachmentId.replace(/-/g, '+').replace(/_/g, '/');
                        v2.attachment.data = window.atob(v2.attachment.data.replace(/-/g, '+').replace(/_/g, '/'));
                    }

                    // if(v2.)
                    // console.log(atob(v2.data.replace(/-/g, '+').replace(/_/g, '/')));
                });

                angular.forEach(v1.parts, function(v2, i2) {
                    angular.forEach(v2.body, function(v3, i3) {
                        if (v3.data !== null) {
                            v3.data = window.atob(v3.data.replace(/-/g, '+').replace(/_/g, '/'));
                            // console.log(v3.data);
                        }
                    });
                });
            });
        });
    }, true);
*/
})();