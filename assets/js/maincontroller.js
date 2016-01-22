app.controller('mainController', ['$scope', '$http', '$sce', '$filter', '$uibModal', 'mailProvider', function($scope, $http, $sce, $filter, $uibModal, mailProvider) {
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
    $scope.isCategoryCollapsed = true;
    $scope.isMoreCollapsed = true;

    $scope.display = function(displayContent) {
        console.log(displayContent);
    }

    $scope.collapseMessageBody = function($event, message, index) {
        if((angular.element("#ignore-click-"+index).find($event.target).length === 0) && (angular.element("#ignore-click-actions-"+index).find($event.target).length === 0)) {
            message.collapseBody =! message.collapseBody;
        }
    }

    $scope.toggleMessageHeaders = function(message) {
        console.log(message.showHeaders);
        message.showHeaders=!message.showHeaders;
    }

    $scope.hideMessageHeaders = function(message) {
        message.showHeaders=false;
    }

    $scope.isLimitSelected = function(limit) {
        return $scope.selectedLimit === limit;
    }

    $scope.limitChanged = function() {
        var obj = {
            'search': 'thread',
            'method': 'list'
            // ,
            // 'labelIds': $scope.selectedLabel.name,
            // 'maxResults': $scope.selectedLimit
        };

        if ($scope.selectedCategory !== undefined) {
            if (obj.labelIds !== undefined) {
                obj.labelIds = obj.labelIds + "," + $scope.selectedCategory.id;
            } else {
                obj.labelIds = $scope.selectedCategory.id;
            }
        }

        if ($scope.selectedLabel !== undefined) {
            if (obj.labelIds !== undefined) {
                obj.labelIds = obj.labelIds + "," + $scope.selectedLabel.name;
            } else {
                obj.labelIds = $scope.selectedLabel.name;
            }
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
            'labelIds': label.name
            // ,
            // 'maxResults': $scope.selectedLimit
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
        // console.log(category);
        $scope.selectedCategory = category;
        // console.log(JSON.stringify(category));
        // console.log(category.messagesTotal);
        // console.log(category.messagedUnread);
        // console.log(category.threadsTotal);
        // console.log(category.threadsUnread);

        var obj = {
            'search': 'thread',
            'method': 'list',
            'labelIds': category.id
            // ,
            // 'maxResults': $scope.selectedLimit
        };
        if (category.id === "INBOX" && $scope.selectedLabel !== undefined) {
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
        thread.attachments = [];

        angular.forEach(thread.messages, function(v, i) {
/*            if(v.labelIds.indexOf('TRASH') === -1) {
                thread.messages.splice(i);
                console.log(v.labelIds.indexOf('TRASH'));
                // console.log(v.labelIds);
            } else if(v.labelIds.indexOf('TRASH') !== -1) {*/
                v.hasAttachments = false;
                v.attachments = [];
                v.attachmentMap = [];
                v.idx = thread.messages.indexOf(v); //i;

                // v.payload.headers['Date'] = $filter('date')(new Date(v.payload.headers['Date']), 'MM/dd/yy');
                v.initialSubject = thread.messages[0].payload.headers['Subject'];

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
                            v.attachments.push({
                                'fileName': value1.fileName
                            });
                            v.hasAttachments = true;
                            thread.attachments.push({
                                'fileName': value1.fileName
                            });
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
                        v.attachments.push({
                            'fileName': value.fileName
                        });
                        v.hasAttachments = true;
                        thread.attachments.push({
                            'fileName': value.fileName
                        });
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
            // }
        });

        // thread.messages.reverse();
        $scope.threads.push(thread);
        $scope.setSelectedThread($scope.threads[0]);
    }

    $scope.$watchCollection($scope.threads, function(newCollection, oldCollection, scope) {
        $scope.threads = $filter('orderObjectBy')($scope.threads, 'messages[0].payload.headers[\'Date\']');
    });

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

        $scope.canceler = $q.defer();

        $http.get(url).success(function(response) {
            if (args['search'] == "thread" && args['method'] == "list") {
                $scope.selectedThread = null;
                $scope.clearThreads();
                $scope.threadResponse = response;
                // angular.forEach(response.threadList, function(value, index) {
                    $scope.getData({
                        search: 'thread',
                        method: 'get',
                        // id: value.threadId,
                        id: '15231854c99addab'
                    });
                // });
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
            } else if (args['search'] == "label" && args['method'] == "get") {
                $scope.categories.push(response);
                if (response.id == "INBOX") {
                    $scope.setSelectedCategory(response);

                    // $scope.getData({
                    //     'search': 'label',
                    //     'method': 'list'
                    // });
                }
                // console.log(response);
            } else if (args['search'] == "category" && args['method'] == "list") {
                $scope.categories = [];
                $scope.categories = response;

                // console.log(response);
                // console.log($scope.categories);
                angular.forEach(response, function(value, key) {
                    if (value.id === "INBOX") {
                        // console.log("Select Inbox");
                        $scope.setSelectedCategory(value);
                    }
                    // $scope.getData({
                    //     'search': 'label',
                    //     'method': 'get',
                    //     'id': value['id']
                    // });
                    // console.log(value);
                    // $scope.categories.push(value);
                    // if(value['labelListVisibility'] === "labelShow") {
                    //     console.log(value);
                    // }
                });

                // angular.forEach($scope.categories, function(value, key) {

                //     if (value.id == "INBOX") {
                //         $scope.setSelectedCategory($scope.categories[key]);

                //         // $scope.getData({
                //         //     'search': 'label',
                //         //     'method': 'list'
                //         // });
                //     }
                // });

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

                if (attachmentMap['contentDisposition'] === 'INLINE') {
                    $scope.threads[threadidx].messages[messageidx].payload.parts[0].parts[htmlidx].body.data = $scope.threads[threadidx].messages[messageidx].payload.parts[0].parts[htmlidx].body.data.replace(re, link);
                } else if (attachmentMap['contentDisposition'].replace(/;.+/g, '') === 'attachment') {
                    angular.forEach(message.attachments, function(value, key) {
                        if (value.fileName === fileName) {
                            value.link = link;
                            value.contentDisposition = attachmentMap['contentDisposition'].replace(/;.+/g, '');
                            value.size = response.size;
                            // console.log(value);
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

    $scope.open = function(type, message, size) {
        var data = {
            modalType: type,
            message: type != 'send' ? message : null
        };

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: './assets/partials/compose.html',
            controller: 'composeController',
            size: size,
            backdrop: 'static'
                ,
                resolve: {
                  data: function () {
                    return data;
                  }
                }
        });

        modalInstance.result.then(function(response) {
            // console.log(response);
        }, function() {
            console.log('Modal dismissed at: ' + new Date());
        });
    };

    $scope.modifyLabels = function(messageId, labelsToAdd, labelsToRemove) {
        // console.log(labelsToAdd);
        // console.log(labelsToRemove);

        var data = {
            'type': 'modifyLabels',
            'messageId': messageId,
            'labelsToAdd': labelsToAdd !== undefined ? labelsToAdd : [],
            'labelsToRemove': labelsToRemove !== undefined ? labelsToRemove : []
        };

        // console.log(data);
        
        $http.post(
            '/gmail/data.php',
            data
        )
        .success(function(d) {
            $scope.response = d;
            console.log(d);
        });
    };
}]);
