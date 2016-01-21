app.controller('composeController', ['$scope', '$http', '$uibModalInstance', '$sce', 'data', function($scope, $http, $uibModalInstance, $sce, data) {
    // console.log(data);
    $scope.data = data;
    // console.log($scope.data);

    $scope.dataModal = {};
    
    $scope.message = $scope.data.message;
    // console.log($scope.message);

    if($scope.data.modalType === 'send') {
        $scope.dataModal.title = 'New Message';
        $scope.dataModal.subject = 'Sample';
        $scope.dataModal.to = '25kajan@gmail.com';
        $scope.dataModal.message = "This is the body content";
        
    } else if($scope.data.modalType === 'reply') {
        $scope.dataModal.title = 'Reply';
        $scope.dataModal.subject = 'Re: ' + $scope.data.message.initialSubject;
        $scope.dataModal.to = $scope.data.message.payload.headers['To'];
        $scope.dataModal.cc = $scope.data.message.payload.headers['Cc'];
        $scope.dataModal.bcc = $scope.data.message.payload.headers['Bcc'];
        
        if($scope.data.message.payload.parts.length === 2) {
            if($scope.data.message.payload.parts[0].mimeType === 'text/html') {
                $scope.dataModal.message = $scope.data.message.payload.parts[0].body.data;
            } else if($scope.data.message.payload.parts[1].mimeType === 'text/html') {
                $scope.dataModal.message = $scope.data.message.payload.parts[1].body.data;
            }
        } else if($scope.data.message.payload.parts.length > 2) {
            if($scope.data.message.payload.parts[0].parts[0].mimeType === 'text/html') {
                $scope.dataModal.message = $scope.data.message.payload.parts[0].parts[0].body.data;
            } else if($scope.data.message.payload.parts[0].parts[1].mimeType === 'text/html') {
                $scope.dataModal.message = $scope.data.message.payload.parts[0].parts[1].body.data;
            }
        }
         // else if($scope.data.message.payload.parts[0].)
    } else if($scope.data.modalType === 'forward') {
        $scope.dataModal.title = 'Forward';
        $scope.dataModal.subject = 'Fwd: ' + $scope.data.message.initialSubject;
        $scope.dataModal.to = $scope.data.message.payload.headers['To'];
        $scope.dataModal.cc = $scope.data.message.payload.headers['Cc'];
        $scope.dataModal.bcc = $scope.data.message.payload.headers['Bcc'];

        var header = $scope.data.message.payload.headers;
        var forwardMessage = "---------- Forwarded message ----------\n\r";
        forwardMessage += "From: " + header['From'] + "\n\r";
        forwardMessage += "Date: " + header['Date'] + "\n\r";
        forwardMessage += "Subject: " + $scope.message.initialSubject + "\n\r";
        forwardMessage += "To: " + header['To'] + "\n\r";

        // console.log(forwardMessage);

        if($scope.data.message.payload.parts.length === 2) {
            if($scope.data.message.payload.parts[0].mimeType === 'text/html') {
                $scope.dataModal.message = $scope.data.message.payload.parts[0].body.data;
            } else if($scope.data.message.payload.parts[1].mimeType === 'text/html') {
                $scope.dataModal.message = $scope.data.message.payload.parts[1].body.data;
            }
        } else if($scope.data.message.payload.parts.length > 2) {
            if($scope.data.message.payload.parts[0].parts[0].mimeType === 'text/html') {
                $scope.dataModal.message = $scope.data.message.payload.parts[0].parts[0].body.data;
            } else if($scope.data.message.payload.parts[0].parts[1].mimeType === 'text/html') {
                $scope.dataModal.message = $scope.data.message.payload.parts[0].parts[1].body.data;
            }
        }
    }

    // console.log($scope.dataModal);

    // $scope.modalInit = function() {
    //     if($scope.modalType === "send") {

    //     }
    // };


    $scope.to = "25kajan@gmail.com";
    // kajanthan91@hotmail.com
    // $scope.cc = "25kajan@gmail.com";
    // $scope.bcc = "kajanthan91@hotmail.com";
    $scope.subject = "This is the subject";
    $scope.message = "<div><p>This is paragraph</p></div>";
    $scope.files;
    $scope.response;

    $scope.ok = function() {
        $scope.sendEmail();
        // $uibModalInstance.close();
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.removeFile = function(file, index) {
        console.log(index);
        console.log(file);
        console.log($scope.files);
        $scope.files.splice(index, 1);
    };

    $scope.sendEmail = function() {

        // console.log($scope.dataModal.message.box);
        var fd = new FormData();

        // var files = Object.keys($scope.files).map(function (key) {return $scope.files[key]});
        angular.forEach($scope.files, function(file) {
            fd.append('files[]', file);
        });
    
        if($scope.files !== undefined && $scope.files !== null) {
            fd.append('numberOfFiles', $scope.files.length);
        }

/*        angular.forEach($scope.data.message.attachments, function(file){
            // fd.append('files[]', $scope.files);
            fd.append('files[]', file);
            // console.log(file);
        });*/

        fd.append('type', 'sendMail');
        // fd.append('purpose', $scope.data.modalType);
/*        fd.append('to', $scope.to);
        fd.append('cc', $scope.cc);
        fd.append('bcc', $scope.bcc);
        fd.append('subject', $scope.subject);
        fd.append('mes', $scope.message);*/

        fd.append('to', $scope.dataModal.to);
        fd.append('cc', $scope.dataModal.cc);
        fd.append('bcc', $scope.dataModal.bcc);
        fd.append('subject', $scope.dataModal.subject);
        fd.append('mes', $scope.dataModal.message);

        $http.post(
            '/gmail/data.php',
            fd,
            {
                transformRequest: angular.identity(),
                // headers:{'Content-Type':'application/x-www-form-urlencoded'}
                // headers:{'Content-Type':'multipart/form-data'}
                headers: {
                    'Content-Type': undefined
                }
            }
        )
        .success(function(d) {
            $scope.response = d;
            console.log(d);
        });
    };

    $scope.renderHtml = function(html_code) {
        return $sce.trustAsHtml(html_code);
    };
}]);
