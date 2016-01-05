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
            // 'labelIds': $scope.selectedLabel.name,
            'maxResults': $scope.selectedLimit
        };

        if ($scope.selectedCategory !== undefined) {
            if(obj.labelIds !== undefined) {
                obj.labelIds = obj.labelIds + "," + $scope.selectedCategory.id;
            } else {
                obj.labelIds = $scope.selectedCategory.id;
            }
        }

        if ($scope.selectedLabel !== undefined) {
            if(obj.labelIds !== undefined) {
                obj.labelIds = obj.labelIds + "," + $scope.selectedLabel.name;
            } else {
                obj.labelIds = $scope.selectedLabel.name;
            }
        }

        console.log(obj);
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
        console.log("Selected Label");
        console.log($scope.selectedLabel);

        var obj = {
            'search': 'thread',
            'method': 'list',
            'labelIds': label.name,
            'maxResults': $scope.selectedLimit
        };
        if ($scope.selectedCategory !== undefined) {
            obj.labelIds = obj.labelIds + "," + $scope.selectedCategory.id;
            console.log(obj.labelIds);
        }
        $scope.getData(obj);
    }

    $scope.isLabelSelected = function(label) {
        return $scope.selectedLabel === label;
    }

    $scope.setSelectedCategory = function(category) {
        console.trace();
        console.log(category);
        $scope.selectedCategory = category;

        var obj = {
            'search': 'thread',
            'method': 'list',
            'labelIds': category.id,
            'maxResults': $scope.selectedLimit
        };
        if (category.id === "INBOX" && $scope.selectedLabel !== undefined) {
            obj.labelIds = obj.labelIds + "," + $scope.selectedLabel.name;
            console.log(obj.labelIds);
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
        console.log("Selected Thread");
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
            // }

            angular.forEach(v.payload.parts, function(value, key) {
                if (value.body !== null) {
                    if (value.body.data !== undefined && value.body.data !== null) {
                        value.body.data = window.atob(value.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    }

                    if (value.body.attachmentId !== undefined && value.body.attachmentId !== null) {
                        // value.body.attachmentId = window.atob(value.body.attachmentId.replace(/-/g, '+').replace(/_/g, '/'));
                    }
                }

                angular.forEach(value.parts, function(value1, key1) {
                    if (value1.body !== null) {
                        if (value1.body.data !== undefined && value1.body.data !== null) {
                            value1.body.data = window.atob(value1.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        }

                        if (value1.attachmentId !== undefined && value1.attachmentId !== null) {
                            value1.attachmentId = window.atob(value1.attachmentId.replace(/-/g, '+').replace(/_/g, '/'));
                        }
                    }

                    if (value1.mimeType === "text/html") {
                        htmlidx = key1;
                    }

                    if (value1.fileName !== null && value1.fileName !== undefined && value1.fileName !== '') {
                        v.attachments.push({'fileName': value1.fileName});
                        v.hasAttachments = true;
                        thread.hasAttachments = true;

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

        url += '&maxResults=' + $scope.selectedLimit;

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
            } else if (args['search'] == "thread" && args['method'] == "get") {
                $scope.addToThreads(response);
            } else if (args['search'] == "label" && args['method'] == "list") {
                $scope.labels = response;

                angular.forEach($scope.labels, function(value, index) {
                    if (value.name.indexOf("CATEGORY_") != -1) {
                        $scope.topLabels.push({
                            "name": value.name,
                            "value": value.name.replace("CATEGORY_", "")
                        });
                    }
                });
                
                $scope.selectedLabel = $scope.topLabels[0];
            } else if (args['search'] == "category" && args['method'] == "list") {
                $scope.categories = response;

                angular.forEach($scope.categories, function(value, key) {
                    if (value.id == "INBOX") {
                        $scope.setSelectedCategory($scope.categories[key]);
                
                        // $scope.getData({
                        //     'search': 'label',
                        //     'method': 'list'
                        // });
                    }
                });
                
                // $scope.getData({
                //     'search': 'label',
                //     'method': 'extra'
                // });
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
                    angular.forEach(message.attachments, function(value, key){
                        if(value.fileName === fileName) {
                            value.link = link;
                            value.contentDisposition = attachmentMap['contentDisposition'].replace(/;.+/g, '')
                        }
                    });
                    // message.attachments[message.attachments.]
                }
            }
        });
    };

    $scope.getData({
        'search': 'category',
        'method': 'list'
    });
}]);