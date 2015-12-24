(function() {
    var app = angular.module("app", ['ngAnimate', 'ngRoute']);

    app.controller('mainController', ['$scope', '$http', '$sce', '$filter', function($scope, $http, $sce, $filter) {
        $scope.threadResponse = [];
        $scope.threads = [];
        $scope.selectedThread;
        $scope.labels;
        $scope.topLabels = [];
        $scope.selectedLabel;
        $scope.categories;
        $scope.selectedCategory;
        $scope.resultLimits = [10, 15, 20];
        $scope.selectedLimit = $scope.resultLimits[0];

        $scope.isLimitSelected = function(limit) {
            return $scope.selectedLimit === limit;
        }

        $scope.limitChanged = function() {
            var obj = {
                'search': 'thread',
                'method': 'list',
                'labelIds': $scope.selectedLabel.name,
                'maxResults': $scope.selectedLimit
            };
            if ($scope.selectedCategory !== undefined) {
                obj.labelIds = obj.labelIds + "," + $scope.selectedCategory.id;
            }
            $scope.getData(obj);
        }

        $scope.isUnread = function(thread) {
            var unread = false;
            angular.forEach(thread.messages, function(value, key) {
                if (value.labelIds.indexOf("UNREAD") !== -1) {
                    unread = true;
                }
            });
            return unread;
        }

        $scope.setSelectedLabel = function(label) {
            $scope.selectedLabel = label;
            var obj = {
                'search': 'thread',
                'method': 'list',
                'labelIds': label.name,
                'maxResults': $scope.selectedLimit
            };
            if ($scope.selectedCategory !== undefined) {
                obj.labelIds = obj.labelIds + "," + $scope.selectedCategory.id;
            }
            $scope.getData(obj);
        }

        $scope.isLabelSelected = function(label) {
            return $scope.selectedLabel === label;
        }

        $scope.setSelectedCategory = function(category) {
            $scope.selectedCategory = category;
            var obj = {
                'search': 'thread',
                'method': 'list',
                'labelIds': category.id,
                'maxResults': $scope.selectedLimit
            };
            if (category.id === "INBOX") {
                obj.labelIds = obj.labelIds + "," + $scope.selectedLabel.name;
            }
            $scope.getData(obj);
        }

        $scope.isCategorySelected = function(category) {
            return $scope.selectedCategory === category;
        };

        $scope.getSelectedCategory = function() {
            return $scope.selectedCategory;
        }

        $scope.clearThreads = function() {
            $scope.threads = [];
        }

        $scope.setSelectedThread = function(thread) {
            if (thread.hasAttachments) {
                angular.forEach(thread.messages, function(value, key) {
                    angular.forEach(value.payload.parts, function(value1, key1) {
                        if (value1.partId > 0 && value1.body.attachmentId !== null) {
                            $scope.getData({
                                'search': 'attachment',
                                'method': 'get',
                                'messageId': value.messageId,
                                'id': value1.body.attachmentId,
                                'fileName': value1.fileName,
                                threadidx: $scope.threads.indexOf(thread),
                                messageidx: key
                            });
                        }
                    });
                });
            }
            $scope.selectedThread = thread;
        }

        $scope.isThreadSelected = function(thread) {
            return $scope.selectedThread === thread;
        }

        $scope.addToThreads = function(thread) {
            thread.hasAttachments = false;
            angular.forEach(thread.messages, function(v, i) {
                v.hasAttachments = false;
                v.attachments = [];
                v.attachmentMap = [];

                v.payload.headers['Date'] = $filter('date')(new Date(v.payload.headers['Date']), 'MM/dd/yy');

                if (v.payload.body !== null) {
                    if (v.payload.body.data !== undefined && v.payload.body.data !== null) {
                        v.payload.body.data = window.atob(v.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    }

                    if (v.payload.attachmentId !== undefined && v.payload.attachmentId !== null) {
                        v.payload.attachmentId = window.atob(v.payload.attachmentId.replace(/-/g, '+').replace(/_/g, '/'));
                    }
                }

                // if (v.payload.fileName !== null && v.payload.fileName !== undefined && v.payload.fileName !== '') {
                //     v.attachments.push({'fileName': v.payload.fileName});
                //     v.hasAttachments = true;
                //     thread.hasAttachments = true;
                //     // console.log(v.payload);
                // }

                angular.forEach(v.payload.parts, function(value, key) {
                    if (value.body !== null) {
                        if (value.body.data !== undefined && value.body.data !== null) {
                            value.body.data = window.atob(value.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        }

                        if (value.body.attachmentId !== undefined && value.body.attachmentId !== null) {
                            // value.body.attachmentId = window.atob(value.body.attachmentId.replace(/-/g, '+').replace(/_/g, '/'));
                            // console.log(value.body.attachmentId);
                        }
                    }

                    angular.forEach(value.parts, function(value1, key1) {
                        if (value1.body !== null) {
                            if (value1.body.data !== undefined && value1.body.data !== null) {
                                value1.body.data = window.atob(value1.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                            }

                            if (value1.attachmentId !== undefined && value1.attachmentId !== null) {
                                value1.attachmentId = window.atob(value1.attachmentId.replace(/-/g, '+').replace(/_/g, '/'));
                                // console.log(value1.attachmentId);
                            }
                        }

                        if (value1.mimeType === "text/html") {
                            htmlidx = key1;
                        }

                        if (value1.fileName !== null && value1.fileName !== undefined && value1.fileName !== '') {
                            v.attachments.push({'fileName': value1.fileName});
                            v.hasAttachments = true;
                            thread.hasAttachments = true;
                            // console.log(value1);

                            v.attachmentMap[value1.fileName] = {
                                attachmentId: value1.body.attachmentId,
                                contentDisposition: value1.headers['Content-Disposition'],
                                partId: value1.partId,
                                mimeType: value1.mimeType,
                                cid: $filter('removeArrows')(value1.headers['Content-ID']),
                                messageidx: i,
                                partsidx: key1,
                                htmlidx: htmlidx
                            };
                        }
                    });

                    if (value.fileName !== null && value.fileName !== undefined && value.fileName !== '') {
                        v.attachments.push({'fileName': value.fileName});
                        v.hasAttachments = true;
                        thread.hasAttachments = true;
                        // console.log(value);

                        v.attachmentMap[value.fileName] = {
                            attachmentId: value.body.attachmentId,
                            contentDisposition: value.headers['Content-Disposition'],
                            partId: value.partId,
                            mimeType: value.mimeType,
                            cid: $filter('removeArrows')(value.headers['Content-ID']),
                            messageidx: i,
                            partsidx: key,
                            htmlidx: htmlidx
                        };
                    }
                });
            });

            // thread.messages.reverse();
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
            if (url.substr(url.length - 1) == "&") {
                url = url.slice(0, -1);
            }
            // console.log(url);

            $http.get(url).success(function(response) {
                if (args['search'] == "thread" && args['method'] == "list") {
                    $scope.selectedThread = null;
                    $scope.clearThreads();
                    $scope.threadResponse = response;
                    angular.forEach(response.threadList, function(value, index) {
                        $scope.getData({
                            search: 'thread',
                            method: 'get',
                            id: value.threadId
                        });
                    });
                    // console.log($scope.threadResponse);
                } else if (args['search'] == "thread" && args['method'] == "get") {
                    $scope.addToThreads(response);
                } else if (args['search'] == "label" && args['method'] == "list") {
                    $scope.labels = response;
                    $scope.categories = response;
                    angular.forEach($scope.labels, function(value, index) {
                        if (value.name.indexOf("CATEGORY_") != -1) {
                            $scope.topLabels.push({
                                "name": value.name,
                                "value": value.name.replace("CATEGORY_", "")
                            });
                        }
                    });

                    $scope.selectedLabel = $scope.topLabels[0];
                    // $scope.setSelectedCategory($scope.categories[0]);
                    angular.forEach($scope.categories, function(value, key) {
                        if (value.id == "INBOX") {
                            $scope.setSelectedCategory($scope.categories[key]);
                        }
                    });
                } else if (args['search'] == "label" && args['method'] == "extra") {
                    var test = [];
                    angular.forEach(response, function(value, key) {
                        test[value.name] = value;
                    });

                    angular.forEach($scope.categories, function(value, key) {
                        if (test[value.name]) {
                            if (test[value.name].threadsUnread > 0) {
                                $scope.categories[key].unread = test[value.name].threadsUnread;
                            }
                        }
                    });

                    angular.forEach($scope.topLabels, function(value, key) {
                        if (test[value.name]) {
                            if (test[value.name].threadsUnread > 0) {
                                $scope.topLabels[key].unread = test[value.name].threadsUnread;
                            }
                        }
                    });
                } else if (args['search'] == "attachment" && args['method'] == "get") {
                    var fileName = args['fileName'];

                    var threadidx = args['threadidx'];
                    var messageidx = args['messageidx'];

                    var message = $scope.threads[threadidx].messages[messageidx];
                    var attachmentMap = message.attachmentMap[fileName];

                    var mimeType = attachmentMap['mimeType'];
                    var partsidx = attachmentMap['partsidx'];
                    var htmlidx = attachmentMap['htmlidx'];

                    var re = new RegExp("cid:" + fileName.replace(/\..+/g, ''), "g");
                    var link = 'data:' + mimeType + ';base64,' + response.data.replace(/-/g, '+').replace(/_/g, '/');

                    if(attachmentMap['contentDisposition'] === 'INLINE') {
                        $scope.threads[threadidx].messages[messageidx].payload.parts[0].parts[htmlidx].body.data = $scope.threads[threadidx].messages[messageidx].payload.parts[0].parts[htmlidx].body.data.replace(re, link);
                    } else if(attachmentMap['contentDisposition'].replace(/;.+/g, '') === 'attachment') {
                        // console.log(attachmentMap['contentDisposition']);
                        // console.log(attachmentMap);
                        angular.forEach(message.attachments, function(value, key){
                            if(value.fileName === fileName) {
                                value.link = link;
                                value.contentDisposition = attachmentMap['contentDisposition'].replace(/;.+/g, '')
                            }
                        });
                        // message.attachments[message.attachments.]
                        console.log(message.attachments);
                    }
                }
            });
        };

        $scope.getData({
            'search': 'label',
            'method': 'list'
        });
        $scope.getData({
            'search': 'label',
            'method': 'extra'
        });
    }]);

    app.directive('fileInput', ['$parse', function($parse) {
        return {
            restict: 'A',
            // scope: true,
            link: function(scope, elem, attrs) {
                // console.log(elem);
                elem.bind('change', function() {
                    $parse(attrs.fileInput).assign(scope, elem[0].files);
                    scope.$apply();
                    // console.log(elem[0].files);
                });
            }
        }
    }]);

    app.filter('ceil', function() {
      return function(input) {
        return Math.ceil(input);
      };
    });

    app.controller('composeController', ['$scope', '$http', function($scope, $http) {
        $scope.to = "kajanthan91@hotmail.com";
        $scope.cc = "25kajan@gmail.com";
        $scope.bcc = "kajanthan91@hotmail.com";
        $scope.subject = "This is the subject";
        $scope.message = "<div><pre><p>This is paragraph</p></pre><script>console.log('Hello World');</script></div>";
        $scope.files;
        $scope.response;

/*        $scope.filesChanged = function(elem) {
            $scope.files = elem.files;
            $scope.$apply();
        }*/

        $scope.removeFile = function(file, index) {
            console.log(index);
            console.log(file);
            console.log($scope.files);
            $scope.files.splice(index, 1);

            // delete $scope.files[file];
            // delete $scope.files[index];
            // $scope.files.splice(file);

            // $scope.$on('removeStep', function(event, data) {
            //   $scope.plan.steps.splice(data, 1);
            // });
        };

        // $scope.$watchCollection('files', function (newVal, oldVal) {
        //     // console.log(newVal, oldVal);
            
        // });

        $scope.sendEmail = function() {
            var fd = new FormData();

            // var files = Object.keys($scope.files).map(function (key) {return $scope.files[key]});
            angular.forEach($scope.files, function(file){
                // fd.append('files[]', $scope.files);
                fd.append('files[]', file);
            });
            
            fd.append('to', $scope.to);
            fd.append('cc', $scope.cc);
            fd.append('bcc', $scope.bcc);
            fd.append('subject', $scope.subject);
            fd.append('mes', $scope.message);



            // var data = {
            //         'to': $scope.to,
            //         'cc': $scope.cc,
            //         'bcc': $scope.bcc,
            //         'subject': $scope.subject,
            //         'mes': $scope.message
            //         // ,'files': $scope.files
            //         ,'files': fd
            //     };

                $http.post(
                    '/gmail/data.php',
                    fd
                    // {
                    //     'to': $scope.to,
                    //     'cc': $scope.cc,
                    //     'bcc': $scope.bcc,
                    //     'subject': $scope.subject,
                    //     'mes': $scope.message
                    //     // ,'files': $scope.files
                    //     ,'files': $scope.fd
                    // }
                    ,
                    {
                        transformRequest:angular.identity(),
                        // headers:{'Content-Type':'application/x-www-form-urlencoded'}
                        // headers:{'Content-Type':'multipart/form-data'}
                        headers:{'Content-Type':undefined}
                    }
                )
                .success(function(d) {
                    $scope.response = d;
                    console.log(d);
                });



            // $http({
            //         method: 'POST',
            //         url: '/gmail/data.php',
            //         data: {
            //             'to': $scope.to,
            //             'cc': $scope.cc,
            //             'bcc': $scope.bcc,
            //             'subject': $scope.subject,
            //             'mes': $scope.message
            //         },
            //         headers: {
            //             'Content-Type': 'application/x-www-form-urlencoded'
            //         }
            //     }).success(function(data, status, headers, config) {
            //         $scope.response = 
            //         data
            //         // {
            //         //     "Response": resp,
            //         //     "Status": status,
            //         //     "Headers": headers,
            //         //     "Config": config

            //         // }
            //         ;
            //         console.log($scope.response);
            //     });

            // var res = $http.post('/gmail/data.php', data).success(function(data, status, headers, config) {
            //     $scope.response = 
            //     data
            //     // {
            //     //     "Response": resp,
            //     //     "Status": status,
            //     //     "Headers": headers,
            //     //     "Config": config

            //     // }
            //     ;
            //     console.log($scope.response);
            // });
        };
    }]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: './assets/partials/index.html',
                controller: 'mainController'
            })
            .when('/compose', {
                templateUrl: './assets/partials/compose.html',
                controller: 'composeController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);

    app.config(['$compileProvider', function($compileProvider) {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):|data:/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }]);

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