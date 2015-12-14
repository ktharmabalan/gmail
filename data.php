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
                    if(isset($_get['extra'])) {
                        $result = label_list_extra($service, $userId);
                    } else {
                        $result = label_list($service, $userId);
                    }
                } else if($method == "get") {
                    $result = label_get($service, $userId, $id);
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
    }
}