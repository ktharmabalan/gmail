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
        fd.append('from', "25kajan@gmail.com");
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

/*    $scope.formatMessage = function(hasAttachments) {
        var mainBoundary = "__main_boundary__";
        var attachmentBoundary = "__attachment_boundary__";
        var charset = "utf-8";

        var msg = "";
        msg += 'MIME-Version: 1.0' + "\r\n";
        msg += 'Content-Type: Multipart/' + (hasAttachments ? 'mixed' : 'alternative') + '; boundary="' + mainBoundary + "\"\r\n";
        // msg = "Content-Type: message/rfc822;\n\r";
        msg += 'To: =?' + charset + '?B?' + base64_encode($this->to) + '?= <' + $this->toEmail + ">\r\n";
        msg += 'From: =?' + charset + '?B?' + base64_encode($this->from) + '?= <' + $this->fromEmail + ">\r\n";
        msg += 'Subject: =?' + charset + '?B?' + base64_encode($this->subject) + "?=\r\n";
        // msg += $this->cc !== null ? 'Cc: =?' + charset + '?B?' + base64_encode($this->cc) + '?= <' + $this->cc + ">\r\n" : '';
        // msg += $this->bcc !== null ? 'Bcc: =?' + charset + '?B?' + base64_encode($this->bcc) + '?= <' + $this->bcc + ">\r\n" : '';

        $references = "References: <CAHjsFs-bQvGthhoDYeD9T-pbLOsn-66uCQS8bach+7L3YFh71A@mail.gmail.com>\r\n";
        $reSubject  = 'Subject: =?' + charset + '?B?' + base64_encode("Fwd:a lot of files") + "?=\r\n";
        $inReplyTo  = "In-Reply-To: <CAHjsFs-bQvGthhoDYeD9T-pbLOsn-66uCQS8bach+7L3YFh71A@mail.gmail.com>\r\n";

        // msg += $references;
        // msg += $reSubject;
        // msg += $inReplyTo;

        msg += "\r\n--" + mainBoundary + "\r\n";

        // text/plain
        hasAttachments ? (msg += 'Content-Type: Multipart/alternative; boundary="' + attachmentBoundary + "\"\r\n") + (msg += "\r\n--" + attachmentBoundary + "\r\n") : '' ;
        msg += 'Content-Type: text/plain; charset=' + charset + "\r\n";
        // msg += 'Content-Transfer-Encoding: 7bit' + '\r\n\r\n';
        msg +=  strip_tags($this->message, '') + "\r\n";

        // text/html
        hasAttachments ? msg += "\r\n--" + attachmentBoundary + "\r\n" : msg += "\r\n--" + mainBoundary + "\r\n";
        msg += 'Content-Type: text/html; charset=' + charset + "\r\n";
        msg += 'Content-Transfer-Encoding: quoted-printable' + "\r\n\r\n";
        msg +=  $this->message + "\r\n";

        hasAttachments ? msg += "\r\n--" + attachmentBoundary + "--\r\n" : '' ;

        if(hasAttachments) {
            foreach ($this->attachments as $key => $value) {
                $filePath = $value['tmp_name'];
                $finfo = finfo_open(FILEINFO_MIME_TYPE); // return mime type ala mimetype extension
                $mimeType = finfo_file($finfo, $filePath);
                $fileName = $value['name'];
                $fileData = base64_encode(file_get_contents($filePath));

                msg += "\r\n--{mainBoundary}\r\n";
                msg += 'Content-Type: '. $mimeType .'; name="'. $fileName .'";' + "\r\n";            
                // msg += 'Content-ID: <' + $strSesFromEmail + '>' + "\r\n";            
                msg += 'Content-Description: ' + $fileName + ';' + "\r\n";
                msg += 'Content-Disposition: attachment; filename="' + $fileName + '"; size=' + filesize($filePath). ';' + "\r\n";
                msg += 'Content-Transfer-Encoding: base64' + "\r\n\r\n";
                msg += chunk_split(base64_encode(file_get_contents($filePath)), 76, "\n") + "\r\n";

                $this->attachmentSize += filesize($filePath);
            }
        }

        msg += "\r\n--" + mainBoundary + "--\r\n";

        return msg;
    }*/
}]);
