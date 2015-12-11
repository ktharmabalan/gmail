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
    
    if (isset($_GET['search'])) {
        $search     = $_GET['search'];
        $maxResults = 2;
        
        if (isset($_GET['maxResults']) && is_numeric($_GET['maxResults']) && $_GET['maxResults'] >= 1) {
            $maxResults = round($_GET['maxResults']);
        }
        
        // echo "<pre>";
        switch ($search) {
            case 'threads':
                // Get Threads
                listThreads($service, $maxResults);
                // listLabels($service);
                
                break;
            case 'messages':
                listMessages($service, $maxResults);
                break;
            case 'labels':
                listLabels($service);
                break;
            default:
                break;
        }
        // echo "</pre>";
    }
}