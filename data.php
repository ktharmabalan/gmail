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
            case 'category':
                if($method == "list") {
                    $result = label_list($service, $userId);
                }
                break;
            case 'attachment':
                if($method == "get") {
                    if(isset($_GET['messageId'])) {
                        $messageId = $_GET['messageId'];
                        $result = attachment_get($service, $userId, $messageId, $id);
                    }
                }
                break;
            case 'profile':
                if($method == "get") {
                    $result = profile_get($service, $userId);
                }
                break;
            default:
                break;
        }
        if($result != null) {
            printPre($result);
        }
    } else if(isset($_GET['send'])) {
        $userId       = 'me';
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
    */
      
        $message = new MessageSend();
        // $message->to = "Kajan";
        // $message->toEmail = "25kajan@gmail.com";
        // $message->from = "Kajanthan";
        // $message->fromEmail = "kajanthan91@hotmail.com";
        $message->from = "Kajan";
        $message->fromEmail = "25kajan@gmail.com";
        $message->to = "Kajanthan";
        $message->toEmail = "kajanthan91@hotmail.com";

        $message->subject = "Hi this is a test Subject";
        $message->message = "<div><pre>This is some text inside pre tag</pre></div><p>This is a paragraph.</p>";
        $message->cc = "kajanthan91@hotmail.com";
        $message->bcc = "25kajan@gmail.com";

        try {
            // The message needs to be encoded in Base64URL
            $mime = rtrim(strtr(base64_encode($message->formatMessage()), '+/', '-_'), '=');
            $msg = new Google_Service_Gmail_Message();
            $msg->setRaw($mime);
            // $objSentMsg = $service->users_messages->send($userId, $msg);

            // print('Message sent object');
            // print_r($objSentMsg);

        } catch (Exception $e) {
            print($e->getMessage());
        } 
    } else if (isset($_POST)) {
        $userId       = 'me';
        // $data = file_get_contents('php://input');
        // $data = json_decode(file_get_contents('php://input'));
        // print_r($data);
        $post = sizeof($_POST) > 0 ? $_POST : [];
        $files = sizeof($_FILES) > 0 ? $_FILES : [];

        $file = array();
        if(sizeof($files) > 0) {
            for ($i=0; $i < sizeof($files['files'][array_keys($files['files'])[0]]); $i++) {
                $f = null;
                foreach ($files['files'] as $key => $value) {
                    $f[$key] = $value[$i];
                }
                $file[$i] = $f;
            }
        }

        // print_r($post);
        // print_r($file);
        
        // error_reporting(0);
        $message = new MessageSend($post);

        if(sizeof($files) > 0) {
            $message->setAttachments($file);
        }

        try {
            // The message needs to be encoded in Base64URL
            $mime = rtrim(strtr(base64_encode($message->formatMessage()), '+/', '-_'), '=');
            $msg = new Google_Service_Gmail_Message();
            $msg->setRaw($mime);
            // echo "\n\r" . strlen($msg->getPayload()) . " - " . strlen($mime);

            // $objSentMsg = $service->users_messages->send($userId, $msg);

            // print('Message sent object');
            // print_r($objSentMsg);

        } catch (Exception $e) {
            print($e->getMessage());
        } 
    }
}