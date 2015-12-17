<?php
// require __DIR__ . '/libs/constants.php';
require __DIR__ . '/libs/functions.php';

if (isset($_GET['code'])) {
    $authCode = trim($_GET['code']);
    
    $client      = getClient();
    // Exchange authorization code for an access token.
    $accessToken = $client->authenticate($authCode);
    
    $credentialsPath = expandHomeDirectory(CREDENTIALS_PATH);
    // Store the credentials to disk.
    if (!file_exists(dirname($credentialsPath))) {
        mkdir(dirname($credentialsPath), 0700, true);
    }
    file_put_contents($credentialsPath, $accessToken);
    
} else {
    // Load previously authorized credentials from a file.
    $credentialsPath = expandHomeDirectory(CREDENTIALS_PATH);
    if (file_exists($credentialsPath)) {
        $accessToken = file_get_contents($credentialsPath);
    } else {
        // Request authorization from the user.
        $client  = getClient();
        $authUrl = $client->createAuthUrl();
        
        echo "<a href='$authUrl'>Log in</a>";
    }
}

if (file_exists($credentialsPath)) {
    // Get the API client and construct the service object.
    $client  = getClient();
    $client  = getAccessToken($client);
    $service = new Google_Service_Gmail($client);
    $optParams = array();
    
    if (isset($_GET['search'])) {
        $userId       = 'me';
        $search     = $_GET['search'];
        $method     = $_GET['method'];

        if(isset($_GET['q'])) {
            $optParams['q'] = $_GET['q'];
        }

        if(isset($_GET['pageToken'])) {
            $optParams['pageToken'] = $_GET['pageToken'];
        }

        if(isset($_GET['includeSpamTrash'])) {
            $includeSpamTrash = $_GET['includeSpamTrash'];
        }

        if(isset($_GET['labelIds'])) {
            $labelIds = array();
            $labelIds = explode(",", $_GET['labelIds']);
            $optParams['labelIds'] = $labelIds;
        }

        if(isset($_GET['id'])) {
            $id     = $_GET['id'];
        }
            
        $maxResults = 10;
        
        if (isset($_GET['maxResults']) && is_numeric($_GET['maxResults']) && $_GET['maxResults'] >= 1) {
            $maxResults = round($_GET['maxResults']);
        }

        $optParams['maxResults'] = $maxResults;
        // echo "<pre>";
        // print_r($optParams);
        // echo "</pre>";

        $result = null;
        switch ($search) {
            case 'thread':
                // Get Threads
                if($method == "list") {
                    $result = thread_list($service, $optParams);
                } else if($method == "get") {
                    $result = thread_get($service, $userId, $id);
                }
                break;
            case 'message':
                if($method == "list") {
                    $result = message_list($service, $maxResults);
                } else if($method == "get") {
                    $result = message_get($service, $userId, $id);
                }
                break;
            case 'label':
                if($method == "list") {
                    $result = label_list($service, $userId);
                } else if($method == "get") {
                    $result = label_get($service, $userId, $id);
                } else if($method =='extra') {
                    $result = label_list_extra($service, $userId);
                }
                break;
            case 'attachment':
                if($method == "get") {
                    if(isset($_GET['messageId'])) {
                        $messageId = $_GET['messageId'];
                        $result = attachment_get($service, $userId, $messageId, $id);
                    }
                }
            default:
                break;
        }
        if($result != null) {
            printPre($result);
        }
    } else if(isset($_GET['send'])) {
        /*
            $data = strtr($part, array(
                '-' => '+',
                '_' => '/'
            ));
            $decoded = base64_decode($data);

            $encoded = base64_encode($data->saveHTML());
            $encoded = strtr($encoded, array(
                '+' => '+',
                '/' => '_'
            ));

            labelIds (array)

            Message (Google_Service_Gmail_Message) {
                labelIds (array)
                payload (Google_Service_Gmail_MessagePart)
                snippet
                sizeEstimate
            }

            Payload (Google_Service_Gmail_MessagePart) {
                body (Google_Service_Gmail_MessagePart)
                filename
                headers (Google_Service_Gmail_MessagePartHeader)
                mimeType
                parts (Google_Service_Gmail_MessagePart)
                partId
            }

            Body (Google_Service_Gmail_MessagePart) {
                attachmentId 
                data
                size
            }

            Header (Google_Service_Gmail_MessagePartHeader) {
                name
                value
            }
        */

        //  ----------------------------------------------
        $userId       = 'me';
        $message = new Google_Service_Gmail_Message();
        $message->setLabelIds(array('INBOX', 'SENT'));
        $message->setSnippet('');
        // $message->setSizeEstimate();

        $payload = new Google_Service_Gmail_MessagePart();
        // $payload->setFilename();
        $payload->setMimeType('multipart/mixed');

        $payloadHeaders = array();

        $payloadHeader = new Google_Service_Gmail_MessagePartHeader();
        $payloadHeader->setName('To');
        $payloadHeader->setValue('25kajan@gmail.com');
        array_push($payloadHeaders, $payloadHeader);

        $payloadHeader = new Google_Service_Gmail_MessagePartHeader();
        $payloadHeader->setName('From');
        $payloadHeader->setValue('25kajan@gmail.com');
        array_push($payloadHeaders, $payloadHeader);

        $payloadHeader = new Google_Service_Gmail_MessagePartHeader();
        $payloadHeader->setName('Subject');
        $payloadHeader->setValue('This is the subject');
        array_push($payloadHeaders, $payloadHeader);

        $payloadHeader = new Google_Service_Gmail_MessagePartHeader();
        $payloadHeader->setName('Content-Type');
        $payloadHeader->setValue('multipart/related');
        array_push($payloadHeaders, $payloadHeader);

        $payload->setHeaders($payloadHeaders);

        $payloadBody = new Google_Service_Gmail_MessagePartBody();
        $payload->setBody($payloadBody);

        $payloadParts = array();

        $payloadPart = new Google_Service_Gmail_MessagePart();
        $payloadPart->setPartId(0);
        $payloadPart->setMimeType('text/html');
        // $payloadPart->setFilename();

        $payloadPartHeaders = array();
        $payloadPartHeader = new Google_Service_Gmail_MessagePartHeader();
        $payloadPartHeader->setName('Content-Type');
        $payloadPartHeader->setValue('text/html; charset=utf-8');
        array_push($payloadPartHeaders, $payloadPartHeader);

        $payloadPartHeader = new Google_Service_Gmail_MessagePartHeader();
        $payloadPartHeader->setName('Content-Transfer-Encoding');
        $payloadPartHeader->setValue('base64');
        array_push($payloadPartHeaders, $payloadPartHeader);

        $payloadPart->setHeaders($payloadPartHeaders);

        $payloadPartsBody = new Google_Service_Gmail_MessagePartBody();
        // attachmentId 
        // data
        // size
        $payloadPart->setBody($payloadPartsBody);

        array_push($payloadParts, $payloadPart);

        $payload->setParts($payloadParts);

        // $payloadHeader->setName('Content-Type');
        // // multipart/alternative; boundary=089e0111e0708ed8ae051a04b3e7
        // $payloadHeader->setValue('multipart/alternative');
        // $payload->setHeaders(array($payloadHeader));



            // Payload (Google_Service_Gmail_MessagePart) {
            //     body (Google_Service_Gmail_MessagePart)
            //     filename
            //     headers (Google_Service_Gmail_MessagePartHeader)
            //     mimeType
            //     parts (Google_Service_Gmail_MessagePart)
            //     partId
            // }

        $message->setPayload($payload);

        // echo "<pre>";
        // print_r($message);
        // echo "</pre>";
        send_message($service, $userId, $message);
    }
}