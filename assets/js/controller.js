(function() {
    var app = angular.module("app", ['ngAnimate']);

    app.controller('mainController', ['$scope', '$http', '$sce', '$filter', function($scope, $http, $sce, $filter) {
        $scope.threadIds = [];
        $scope.threads = [];
        $scope.selectedThread;
        $scope.labels;
        $scope.topLabels = [];
        $scope.selectedLabel;
        $scope.sideLabels = [];

        // document.location.href = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,ANGjdJ9mM_7gY_g5KqYgs1EUazSxQdBbKqnOYmU6-smR74nrawcheupM-uS7vWmezWO7nONQukQVWoObrZbSsCA4byA7yfL9n9rNqduaryhvAuNdWdh_cxWYoBnPmOagTinH9xew5RQUlKoRUDXOmYopkFO2d9NwbbJT_IC9Ts9vr9iB6-G3-uT8JEQBtv6l5-F1d7H1Nd0lw8a_i5tDJdc0KFy_8Q-6Q5wJCG0J9g";

        // $scope.isUnread = function(thread) {
        //     angular.forEach(values, function(value, key){
                
        //     });
        // }

        $scope.setSelectedLabel = function(label) {
            $scope.selectedLabel = label;
            var obj = {'search': 'thread', 'method': 'list', 'labelIds': 'INBOX'};
            // obj.labelIds = obj.labelIds + "," + "SENT";
            obj.labelIds = obj.labelIds + "," + label.name; 
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
            // console.log(thread);
/*            angular.forEach(thread.messages, function(v, i) {
                v.payload.headers['Date'] = $filter('date')(new Date(v.payload.headers['Date']), 'medium');
                angular.forEach(v.payload, function(v1, i1) {
                    // console.log(v1);
                    // angular.forEach(v1.body, function(v2, i2) {
                    //     // console.log(v1.body);
                    //     if(v2 !== null) {
                    //         if (v2.data !== undefined) {
                    //             v2.data = window.atob(v2.data.replace(/-/g, '+').replace(/_/g, '/'));
                    //             console.log(v2.data);
                    //         }

                    //         if (v2.attachmentId != null) {
                    //             v2.attachmentId = v2.attachmentId.replace(/-/g, '+').replace(/_/g, '/');
                    //             v2.attachment.data = window.atob(v2.attachment.data.replace(/-/g, '+').replace(/_/g, '/'));
                    //             console.log(v2.attachment.data);
                    //         }
                    //     }
                    // });

                    // angular.forEach(v1.parts, function(v2, i2) {
                    //                 console.log(v2);

                    //     angular.forEach(v2.body, function(v3, i3) {
                    //         if(v3 !== null) {
                    //             if(v2.mimeType == "text/html") {
                    //                 if (v3.data !== undefined) {
                    //                     v3.data = window.atob(v3.data.replace(/-/g, '+').replace(/_/g, '/'));
                    //                     console.log(v3.data);
                    //                 }
                    //             }
                    //         }
                    //     });
                    // });
                });
            });*/
            $scope.selectedThread = thread;
        }

        $scope.isThreadSelected = function(thread) {
            return $scope.selectedThread === thread;
        }

        $scope.addToThreads = function(thread) {
            angular.forEach(thread.messages, function(v, i) {
                v.payload.headers['Date'] = $filter('date')(new Date(v.payload.headers['Date']), 'MM/dd/yy');

                if(v.payload.body !== null) {
                    if(v.payload.body.data !== undefined && v.payload.body.data !== null) {
                        v.payload.body.data = window.atob(v.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    }

                    if (v.payload.attachmentId !== undefined && v.payload.attachmentId !== null) {
                        v.payload.attachmentId = window.atob(v.payload.attachmentId.replace(/-/g, '+').replace(/_/g, '/'));
                    }
                }

                angular.forEach(v.payload.parts, function(value, key){
                    if(value.body !== null) {
                        if(value.body.data !== undefined && value.body.data !== null) {
                            value.body.data = window.atob(value.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        }

                        if (value.attachmentId !== undefined && value.attachmentId !== null) {
                            value.attachmentId = window.atob(value.attachmentId.replace(/-/g, '+').replace(/_/g, '/'));
                        }
                    }

                    angular.forEach(value.parts, function(value1, key1){
                        if(value1.body !== null) {
                            if(value1.body.data !== undefined && value1.body.data !== null) {
                                value1.body.data = window.atob(value1.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                            }

                            if (value1.attachmentId !== undefined && value1.attachmentId !== null) {
                                value1.attachmentId = window.atob(value1.attachmentId.replace(/-/g, '+').replace(/_/g, '/'));
                            }
                        }                       
                    });
                });

/*                angular.forEach(v.payload, function(v1, i1) {
                    // console.log(v1.body);
                    if(v1 !== null) {
                        if (v1.body.data !== undefined) {
                            v1.body.data = window.atob(v1.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        }

                        if (v1.attachmentId != null) {
                            v1.attachmentId = v1.attachmentId.replace(/-/g, '+').replace(/_/g, '/');
                            v1.attachment.data = window.atob(v1.attachment.data.replace(/-/g, '+').replace(/_/g, '/'));
                        }
                    }

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

                angular.forEach(v.payload.parts, function(value, key){
                    // if (value.mimeType == "text/html") {
                    //     if (value.headers['Content-Transfer-Encoding'] == "base64") {
                            if(value.body.data !== null) {
                                value.body.data = window.atob(value.body.data.replace(/-/g, '+').replace(/_/g, '/'))
                            }
                    //     }
                    // }

                    angular.forEach(value.parts, function(value1, key1){
                        // console.log(value1.body);
                        if(value1.body.data !== null) {
                            value1.body.data = window.atob(value1.body.data.replace(/-/g, '+').replace(/_/g, '/'))
                        }
                    });
                });*/
            });

           
            thread.messages.reverse();
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
        // $scope.getData({'search': 'label', 'method': 'list', 'extra': 'true'});
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