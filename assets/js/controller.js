(function() {
    var app = angular.module("app", []);

    app.service('sharedProperties', [function() {
        var activeLabel;
        var topLabels;
        var activeThread;

        this.getActiveThread = function() {
        	return activeThread;
        }

        this.setActiveThread = function(thread) {
        	activeThread = thread;
        }

        this.getActiveLabel = function() {
            return activeLabel;
        }

        this.setActiveLabel = function(value) {
            activeLabel = value;
        }

        this.getActiveLabelName = function() {
            return activeLabel.name;
        }

        this.setActiveLabelName = function(label) {
            activeLabel.name = label.name;
        }

        this.getTopLabels = function() {
            return topLabels;
        }

        this.setTopLabels = function(value) {
            topLabels = value;
        }
    }]);

    app.controller('labelsController', ['$scope', '$http', 'sharedProperties', function($scope, $http, sharedProperties) {
        $http.get("/gmail/data.php?search=label&method=list").success(function(response) {
            $scope.labels = response;

            $scope.topLabels = [];

            angular.forEach($scope.labels, function(value, index) {
                if (value.name.indexOf("CATEGORY_") != -1) {
                    $scope.topLabels.push({
                        "name": value.name,
                        "value": value.name.replace("CATEGORY_", "")
                    });
                }
            });

            sharedProperties.setTopLabels($scope.topLabels);

            $scope.setSelectedLabel($scope.topLabels[0]);
        });

        $scope.setSelectedLabel = function(label) {
            $scope.selected = label;
            sharedProperties.setActiveLabel(label);
            sharedProperties.setActiveLabelName(label);
            $scope.getData("thread", "list", 'labelIds']);
        };

        $scope.isLabelSelected = function(label) {
            return $scope.selected === label;
        }

        $scope.getData = function(search, method, opt_params) {
        	console.log("/gmail/data.php?search=" + search + "&method=" + method + "params=" + opt_params);
        	$http.get("/gmail/data.php?search=" + search + "&method=" + method).success(function(response) {
        		console.log(response);
        	});
        // 	$http({
        // 		url: "/gmail/data.php",
        // 		method: "GET",
        // 		params: {
        // 			'search': search,
        // 			'method': method
        // 		}
        // 	}).
		      //   then(function(response) {
		      //   	console.log("Response 1");
		      //   	console.log(response.data);
		      //     // $scope.status = response.status;
		      //     // $scope.data = response.data;
		      //   }, function(response) {
		      //   	console.log("Response 2 " + response.data || "Request failed" + response.status);
		      //     // $scope.data = response.data || "Request failed";
		      //     // $scope.status = response.status;
		      // });
        };

    }]);

    app.controller('threadsController', ['$scope', '$http', '$sce', '$filter', 'sharedProperties', function($scope, $http, $sce, $filter, sharedProperties) {
        $http.get("/gmail/data.php?search=threads")
            .success(function(response) {
                $scope.threads = response.threadList;

                // EEE, d MMM yyyy h:mm:ss -Z
                // Thu, 3 Dec 2015 11:52:40 -0500

                // var extractField = function(json, fieldName) {
                //   return json.payload.headers.filter(function(header) {
                //     return header.name === fieldName;
                //   })[0].value;
                // };
                // var date = extractField(response, "Date");
                // var subject = extractField(response, "Subject");

                // var part = message.parts.filter(function(part) {
                //   return part.mimeType == 'text/html';
                // });


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
                });

                $scope.getShowingThreads = function() {
                    // .messages[0].labelIds.indexOf(selectedLabel())
                    // angular.forEach($scope.threads, function(value, key){
                    console.log($scope.selectedLabel());
                    // console.log($filter('filter')($scope.threads, angular.forEach($scope.threads, function(value, key){
                    // 	value.messages[0].labelIds.indexOf($scope.selectedLabel());
                    // })));
                    // });
                };

                $scope.renderHtml = function(html_code) {
                    return $sce.trustAsHtml(html_code);
                };

                $scope.setSelectedThread = function(thread) {
                    $scope.selected = thread;
                    sharedProperties.setSelectedThread(thread);
                };

                $scope.isThreadSelected = function(thread) {
                    return $scope.selected === thread;
                }

                // $scope.setLabel = function(label) {
                // 	$scope.labelActive = label;
                // 	sharedProperties.setLabel(label);
                // 	// $scope.getShowingThreads();
                // 	// $scope.setSelected();
                // 	console.log(label);
                // };

                $scope.getSelectedLabel = function() {
                    var labelSelected = sharedProperties.getActiveLabelName();

                    // angular.forEach(sharedProperties.getTopLabels(), function(value, index) {
                    // 	if(value.value == sharedProperties.getActiveLabel()) {
                    // 		// console.log(value.name + ": " + value.value + " : " + sharedProperties.getActiveLabel());
                    // 		labelSelected = value.name;
                    // 		// return labelSelected;
                    // 	}
                    // });

                    // switch($scope.labelActive) {
                    // 	case 'primary':
                    // 		$labelSelected = "CATEGORY_PERSONAL";
                    // 	break;
                    // 	case 'social':
                    // 		$labelSelected = "CATEGORY_UPDATES";
                    // 	break;
                    // 	case 'promotions':
                    // 		$labelSelected = "";
                    // 	break;
                    // }

                    // console.log($labelSelected);
                    return labelSelected;
                };

                // console.log(sharedProperties.getTopLabels()[0].value);
                // $scope.setLabel(sharedProperties.getTopLabels()[0].value);
                // $scope.setLabel($scope.topLabels[0].value);
                // $scope.setSelected($scope.threads[0]);
            });
    }]);


    // // Angular module named "app", and dependencies in []
    // var app = angular.module("app", ['ng-route']);

    // // Controller
    // app.controller("AppCtrl", function ($scope, jsonFilter) {
    // 	this.name = "World";

    // 	$scope.contacts = [
    // 		{
    // 			name: 'John Doe',
    // 			phone: '01234567890',
    // 			email: 'john@example.com'
    // 		},
    // 		{
    // 			name: 'Karan Bromwich',
    // 			phone: '09876543210',
    // 			email: 'karan@email.com'
    // 		}
    // 	];

    // 	// Handler, a function within the controller
    // 	$scope.clickHandler = function() {
    // 		this.isHidden = !this.isHidden;
    // 	};

    // 	$scope.styleDemo = function() {
    // 		if(!$scope.styler) {
    // 			return;
    // 		}

    // 		return {
    // 			background: 'red',
    // 			fontWeight: 'bold'
    // 		};
    // 	};
    // });

    // // Filter
    // app.filter('truncate', function() {
    // 	// filter returns a function
    // 	return function(input, limit) {
    // 		return (input.length > limit) ? input.substr(0, limit) + '...' : input;
    // 	};
    // });

    // // Routes
    // // accepts an anonymous function, that is injected with the $routeProvider service
    // app.config(function($routeProvider){
    // 	// add route with path as string and options for route as object
    // 	$routeProvider.when('/', {
    // 		// controller, templateUrl: path to html file for view
    // 		controller: 'indexCtl',
    // 		templateUrl: 'assets/partials/index.html'
    // 	}).when('/add-contact', {
    // 		contr
    // 	});

    // });

    // app.controller('indexCtrl', function($scope){

    // });
})();