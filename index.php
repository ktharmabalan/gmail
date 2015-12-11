<?php
// require __DIR__ . '/libs/constants.php';
require __DIR__ . '/libs/functions.php';

if(isset($_GET['code'])) {
    $authCode = trim($_GET['code']);

    $client = getClient();
    // Exchange authorization code for an access token.
    $accessToken = $client->authenticate($authCode);

    $credentialsPath = expandHomeDirectory(CREDENTIALS_PATH);
    // Store the credentials to disk.
    if(!file_exists(dirname($credentialsPath))) {
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
    $client = getClient();
    $authUrl = $client->createAuthUrl();

    echo "<a href='$authUrl'>Log in</a>";
  }
}

if(file_exists($credentialsPath)) {
  // Get the API client and construct the service object.
  $client = getClient();
  $client = getAccessToken($client);
  $service = new Google_Service_Gmail($client);

  // echo "<pre>";
  // // Get Threads
  // listThreads($service);
  // // listLabels($service);

  // echo "</pre>";

  loadPage("Hello World");
}

/*function getThreads() {
  // Print the labels in the user's account.
  $user = 'me';
  $pageToken = NULL;
  $messages = array();
  $opt_param = array();

  do {
    try {
      if ($pageToken) {
        $opt_param['pageToken'] = $pageToken;
      }
      $messagesResponse = $service->users_messages->listUsersMessages($user, $opt_param);
      if ($messagesResponse->getMessages()) {
        $messages = array_merge($messages, $messagesResponse->getMessages());
        $pageToken = $messagesResponse->getNextPageToken();
      }
    } catch (Exception $e) {
      print 'An error occurred: ' . $e->getMessage();
    }
  } while ($pageToken);

  foreach ($messages as $message) {
    print 'Message with ID: ' . $message->getId() . '<br/>';
  }
}*/