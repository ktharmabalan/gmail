<?php
require __DIR__ . '/constants.php';
require __DIR__ . '/classes.php';

function message_send() {

}

function profile_get($service, $userId, $optParams = array()) {
    $profile = $service->users->getProfile($userId, $optParams);

    if ($profile->getEmailAddress()) {
        return new Profile($profile);
    }
}

function requestAuthorization() {
    $client = getClient();
    return $client->createAuthUrl();
}

function send_message($service, $userId, $message) {
    try {
        $message = $service->users_messages->send($userId, $message);
        print 'Message with ID: ' . $message->getId() . ' sent.';
        return $message;
    } catch (Exception $e) {
        print 'An error occurred: ' . $e->getMessage();
    }
}

/**
 * Returns an authorized API client.
 * @return Google_Client the authorized client object
 */
function getClient()
{
    $client = new Google_Client();
    $client->setApplicationName(APPLICATION_NAME);
    $client->setScopes(SCOPES);
    $client->setAuthConfigFile(CLIENT_SECRET_PATH);
    $client->setAccessType('offline');
    $client->setRedirectUri('http://localhost/gmail/index.php');
    return $client;
}

function getAccessToken($client)
{
    $credentialsPath = expandHomeDirectory(CREDENTIALS_PATH);
    $accessToken     = file_get_contents($credentialsPath);
    $client->setAccessToken($accessToken);
    
    // Refresh the token if it's expired.
    if ($client->isAccessTokenExpired()) {
        $client->refreshToken($client->getRefreshToken());
        file_put_contents($credentialsPath, $client->getAccessToken());
    }
    
    return $client;
}

/**
 * Expands the home directory alias '~' to the full path.
 * @param string $path the path to expand.
 * @return string the expanded path.
 */
function expandHomeDirectory($path)
{
    $homeDirectory = getenv('HOME');
    if (empty($homeDirectory)) {
        $homeDirectory = getenv("HOMEDRIVE") . getenv("HOMEPATH");
    }
    return str_replace('~', realpath($homeDirectory), $path);
}

/**
 * Get list of Messages in user's mailbox.
 *
 * @param  Google_Service_Gmail $service Authorized Gmail API instance.
 * @param  string $userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @return array Array of Messages.
 */
function message_list($service, $maxResults)
{
    $user      = 'me';
    $pageToken = NULL;
    $messages  = array();
    
    $opt_param                     = array();
    $opt_param['includeSpamTrash'] = false;
    // $opt_param['maxResults'] = $maxResults;
    $opt_param['labelIds']         = 'INBOX';
    
    $messagesResponse = $service->users_messages->listUsersMessages($user, $opt_param);
    if ($messagesResponse->getMessages()) {
        $messageList = new MessageList();
        foreach ($messagesResponse->getMessages() as $message) {
            $messageList->addMessage(new MessageListItem($message->getThreadId(), $message->getId()));
        }
        return $messageList;
    }
}

/**
 * Get Message with given ID.
 *
 * @param  Google_Service_Gmail $service Authorized Gmail API instance.
 * @param  string $userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  string $messageId ID of Message to get.
 * @return Google_Service_Gmail_Message Message retrieved.
 */
function message_get($service, $userId, $messageId)
{
    try {
        $mimeTypes   = array(
            "image/png",
            "image/bmp",
            "image/gif",
            "image/jpeg",
            "image/tiff"
        );
        $messageItem = new MessageItem($service->users_messages->get($userId, $messageId));
        // printPre($messageItem);
        // foreach ($messageItem->payload as $key => $value) {
        //     echo $key;
        // }
        return $messageItem;
    }
    catch (Exception $e) {
        print 'An error occurred: ' . $e->getMessage();
    }
}

function label_get($service, $userId, $labelId, $opt_param = array()) {
    try {

        $label = $service->users_labels->get($userId, $labelId, $opt_param);
        return $label;
    } catch (Exception $e) {
        print 'An error occured: ' . $e->getMessage();
    }
}

function label_list_extra($service, $userId)
{
    $labels = array();
    
    $labelsResponse = $service->users_labels->listUsersLabels($userId);
    if ($labelsResponse->getLabels()) {
        $labels = array_merge($labels, $labelsResponse->getLabels());
    }

    $labelsList = array();

    foreach ($labels as $labelItem) {
        $label = label_get($service, $userId, $labelItem->getId());

        $labelObject = new Label(
            $label->getId(),
            $label->getName(),
            $label->getMessageListVisibility(),
            $label->getLabelListVisibility(),
            $label->getType(),
            $label->getMessagesTotal(),
            $label->getMessagesUnread(),
            $label->getThreadsTotal(),
            $label->getThreadsUnread()
        );

        array_push($labelsList, $labelObject);
        // echo $label->getName() . "<br>";
    }

    return $labelsList;
}

function label_list($service, $userId, $opt_param = array()) {
{
    $labels = array();
    
    $labelsResponse = $service->users_labels->listUsersLabels($userId);
    if ($labelsResponse->getLabels()) {
        $labels = array_merge($labels, $labelsResponse->getLabels());
    }

    $labelsList = array();

    foreach ($labels as $label) {
        $labelObject = new LabelSimple(
            $label->getId(),
            $label->getName(),
            $label->getMessageListVisibility(),
            $label->getLabelListVisibility(),
            $label->getType()
        );

        array_push($labelsList, $labelObject);
    }

    return $labelsList;
}
}

/**
 * Get all Threads in the user's mailbox.
 *
 * @param  Google_Service_Gmail $service Authorized Gmail API instance.
 * @param  string $userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @return array Array of Threads.
 */
function listThreads($service, $maxResults)
{
    $user                          = 'me';
    $pageToken                     = NULL;
    $opt_param                     = array();
    $opt_param['includeSpamTrash'] = false;
    // $opt_param['maxResults'] = $maxResults;
    $opt_param['maxResults']       = 5;
    $opt_param['labelIds']         = 'INBOX';
    
    $threads = array();
    
    $threadsResponse = $service->users_threads->listUsersThreads($user, $opt_param);
    if ($threadsResponse->getThreads()) {
        $threads = array_merge($threads, $threadsResponse->getThreads());
    }
    
    $threadsList = new ThreadList();
    $mimeTypes   = array(
        "image/png",
        "image/bmp",
        "image/gif",
        "image/jpeg",
        "image/tiff"
    );
    
    foreach ($threads as $thread) {
        
        $threadItem   = thread_get($service, $user, $thread->getId());
        $threadObject = new Thread($threadItem->getId(), $threadItem->getHistoryId(), $threadItem->getSnippet());
        
        $threadMessages = $threadItem->getMessages();
        
        foreach ($threadMessages as $threadMessage) {
            
            $threadMessageObject = new Message($threadMessage->getId(), $threadMessage->getHistoryId(), $threadMessage->getSizeEstimate(), $threadMessage->getSnippet(), $threadMessage->getThreadId());
            
            foreach ($threadMessage->getLabelIds() as $label) {
                $threadMessageObject->addLabels($label);
            }
            
            $payloads = $threadMessage->getPayload(); // gets parts
            
            $payloadObject = new Payload($payloads->getFilename(), $payloads->getMimeType(), $payloads->getPartId());
            
            $payloadBody = $payloads->getBody();
            
            $payloadBodyObject = new Body($payloadBody->getSize(), $payloadBody->getData(), $payloadBody->getAttachmentId());
            
            $payloadObject->setBody($payloadBodyObject);
            
            $payloadHeaders = $payloads->getHeaders();
            
            foreach ($payloadHeaders as $payloadHeader) {
                $payloadObject->addHeaders($payloadHeader->getName(), $payloadHeader->getValue());
            }
            
            $payloadParts = $payloads->getParts();
            foreach ($payloadParts as $payloadPart) {
                $payloadPartObject = new Part($payloadPart->getPartId(), $payloadPart->getMimeType(), $payloadPart->getFilename());
                
                $partHeaders = $payloadPart->getHeaders();
                foreach ($partHeaders as $partHeader) {
                    $payloadPartObject->addHeaders($partHeader->getName(), $partHeader->getValue());
                }
                
                $partBody = $payloadPart->getBody();
                
                $mimeType = $payloadPart->getMimeType();
                $fileName = $payloadPart->getFilename();

                $partBodyData = $partBody->getData();

                if($mimeType == "text/html") {
                    $partBodyData = stripStyle($partBodyData);
                }
                
                // get attachment
                if (in_array($mimeType, $mimeTypes)) {
                    $payloadObject->setHasAttachments(true);
                    
                    $messageId    = $threadMessage->getId();
                    $attachmentId = $partBody->getAttachmentId();
                    // $messageId = "1517ad66755a3a4e";
                    // $attachmentId = "ANGjdJ_NHguibEZ714ypsmh4AaLozb2ljIe9UnAwH9txKGemrt_5LedqDr3KZ6RLyw40lb5n584YB5ZKMOtiw5o9OT7ClArfD8PDezzdA7cOyf6HW0CNwK_L_vRDPiEoMBRfQljfntWQoC9oAr1C-PjC-wmMuEMDzhezghpQ5vqpKV4nBGhFZ8AHf4QAwvrtT0T8dgn3L6uKGce2WEAkUMKSdCDDAruntSb4cUA9joHouiJ9zFSzQz0Wwc4Ru2MSofkPMWi9F1f2pb1MdCgzUTMgfSEfoLbJGSYgNen5WES7t8OO8B1SPn2STcHOeNg";
                    $attachment   = getAttachment($service, $user, $messageId, $attachmentId);
                    $image        = getAttachmentAndWrite($service, $user, $messageId, $attachmentId, $fileName, $mimeType);
                    $payloadObject->addImage($image);

                    $payloadPartObject->addBody(new Body($partBody->getSize(), $partBodyData, $partBody->getAttachmentId(), $attachment, $image));
                } else {
                    $payloadPartObject->addBody(new Body($partBody->getSize(), $partBodyData, $partBody->getAttachmentId()));
                }
                // ----------------------------------------------------------
                $payloadPartsSub = $payloadPart->getParts();
                foreach ($payloadPartsSub as $payloadPartSub) {
                    
                    $payloadPartSubObject = new Part($payloadPartSub->getPartId(), $payloadPartSub->getMimeType(), $payloadPartSub->getFilename());
                    
                    $partHeaders = $payloadPartSub->getHeaders();
                    foreach ($partHeaders as $partHeader) {
                        $payloadPartSubObject->addHeaders($partHeader->getName(), $partHeader->getValue());
                    }
                    
                    $partBody = $payloadPartSub->getBody();

                    $partBodyData = $partBody->getData();

                    if($payloadPartSub->getMimeType() == "text/html") {
                        $partBodyData = stripStyle($partBodyData);
                    }
                    
                    $payloadPartSubObject->addBody(new Body($partBody->getSize(), $partBodyData, $partBody->getAttachmentId()));
                    
                    $payloadPartObject->addParts($payloadPartSubObject);
                }
                
                // -----------------------------------------------------------------------
                $payloadObject->addParts($payloadPartObject);
            }
            
            if ($payloadObject->getHasAttachments()) {
                foreach ($payloadObject->getParts() as $key => $parts) {
                    if ($parts->mimeType == "multipart/alternative") {
                        foreach ($parts->getParts() as $key1 => $part) {
                            if ($part->mimeType == "text/html") {
                                $data                                                    = subImagesInHtml($part, $payloadObject->getImages());
                                $payloadObject->parts[$key]->parts[$key1]->body[0]->data = $data;
                            }
                        }
                    }
                }
            }
            
            $threadMessageObject->setPayload($payloadObject);
            $threadObject->addMessage($threadMessageObject);
        }       
        $threadsList->addThread($threadObject);
    }
    echo json_encode($threadsList);
    // echo json_last_error_msg();
}

function getThreadList($service, $maxResults, $method = "") {
    $user                          = 'me';
    $pageToken                     = NULL;
    $opt_param                     = array();
    $opt_param['includeSpamTrash'] = false;
    // $opt_param['maxResults'] = $maxResults;
    // $opt_param['maxResults']       = 5;
    $opt_param['labelIds']         = ['INBOX'];
    // $opt_param['labelIds']         = ['INBOX', 'CATEGORY_PERSONAL'];
    
    $threadsResponse = $service->users_threads->listUsersThreads($user, $opt_param);   
    
    if ($threadsResponse->getThreads()) {
        $threadObject = null;

        if($method == "simple") {
            // $threadObject = array();
            $threadObject = new ThreadList();

            foreach ($threadsResponse->getThreads() as $thread) {
                $threadObject->addThread(new ThreadsSimple($thread->getId(), html_entity_decode($thread->getSnippet())));
                // array_push($threadObject, new ThreadsSimple($thread->getId(), html_entity_decode($thread->getSnippet())));
            }
        } else if($method == "minimal") {
            $threadObject = array();

            foreach ($threadsResponse->getThreads() as $thread) {
                // $messageResponse = $service->users_messages->
                $threadItem   = thread_get($service, $user, $thread->getId());
                printPre($threadItem);

            }
        } else if($method == "full") {
            listThreads($service, $maxResults);
        } else if($method == "allthreads") {
            $threadObject = new ThreadList();

            foreach ($threadsResponse->getThreads() as $thread) {
                // $messageResponse = $service->users_messages->
                $threadItem   = thread_get($service, $user, $thread->getId());
                // $threadObject->addThread(new ThreadItem($threadItem));
                printPre($threadItem);
            }
        }

        if($threadObject != null) {
            printPre($threadObject);
        }
    }
}

function thread_list($service, $opt_param = array()) {
    $user                          = 'me';
    $pageToken                     = NULL;
    // $opt_param                     = array();
    // $opt_param['includeSpamTrash'] = false;
    // // $opt_param['maxResults'] = $maxResults;
    // // $opt_param['maxResults']       = 5;
    // $opt_param['labelIds']         = ['INBOX'];
    // $opt_param['labelIds']         = ['INBOX', 'CATEGORY_PERSONAL'];
    
    $threadsResponse = $service->users_threads->listUsersThreads($user, $opt_param);   
    
    if ($threadsResponse->getThreads()) {
        $threadObject = new ThreadList($threadsResponse);
        return $threadObject;
    }
}

// function listSimpleThreads($service, $maxResults) {
//     $user                          = 'me';
//     $pageToken                     = NULL;
//     $opt_param                     = array();
//     $opt_param['includeSpamTrash'] = false;
//     // $opt_param['maxResults'] = $maxResults;
//     // $opt_param['maxResults']       = 5;
//     $opt_param['labelIds']         = 'INBOX';
    
//     // $threadObject = array();
//     $threadObject = new ThreadList();
    
//     $threadsResponse = $service->users_threads->listUsersThreads($user, $opt_param);
//     if ($threadsResponse->getThreads()) {
//         foreach ($threadsResponse->getThreads() as $thread) {
//             $threadObject->addThread(new ThreadsSimple($thread->getId(), html_entity_decode($thread->getSnippet())));
//             // array_push($threadObject, new ThreadsSimple($thread->getId(), html_entity_decode($thread->getSnippet())));
//         }
//     }

//     echo "<pre>";
//     print_r($threadObject);
//     echo "</pre>";
// }

function stripStyle($partBodyData) {
    $data = strtr($partBodyData, array(
        '-' => '+',
        '_' => '/'
    ));
    $data = base64_decode($data);
    
    $doc = new DOMDocument();
    @$doc->loadHTML($data);

    foreach ($doc->getElementsByTagName("style") as $style) {
        $style->parentNode->removeChild($style);
        $doc->saveHTML();
    }

    $encodedDom = base64_encode($doc->saveHTML());
    $encodedDom = strtr($encodedDom, array(
        '+' => '+',
        '/' => '_'
    ));
    return $encodedDom;
}

function subImagesInHtml($part, $images)
{
    $image_arr = array();
    
    foreach ($images as $id => $image) {
        // echo $id .":".$image."\n";
        $image_arr[$id] = $image;
    }
    
    // $part->body[0]->data
    $data = strtr($part, array(
        '-' => '+',
        '_' => '/'
    ));
    $data = base64_decode($data);
    
    $doc = new DOMDocument();
    @$doc->loadHTML($data);

    foreach ($doc->getElementsByTagName("img") as $item) {
        $item->setAttribute("src", $image_arr[$item->getAttribute("src")]);
    }

    foreach ($doc->getElementsByTagName("style") as $style) {
        // echo $style;
        $style->parentNode->removeChild($style);
        // print_r($style);
        $doc->saveHTML();
    }

    // echo htmlentities($doc->saveHTML());

    $encodedDom = base64_encode($doc->saveHTML());
    $encodedDom = strtr($encodedDom, array(
        '+' => '+',
        '/' => '_'
    ));
    return $encodedDom;
}

function printPre($data) {
    // echo "<pre>";
    print_r(json_encode($data));
    // echo "</pre>";
}

/**
 * Get Thread with given ID.
 *
 * @param  Google_Service_Gmail $service Authorized Gmail API instance.
 * @param  string $userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  string $threadId ID of Thread to get.
 * @return Google_Service_Gmail_Thread Retrieved Thread.
 */
function thread_get($service, $userId, $threadId)
{
    $user                          = $userId;
    $pageToken                     = NULL;
    $opt_param                     = array();
    $opt_param['includeSpamTrash'] = false;
    // $opt_param['maxResults'] = $maxResults;
    // $opt_param['maxResults']       = 5;
    $opt_param['labelIds']         = ['INBOX'];

    try {
        $mimeTypes   = array(
            "image/png",
            "image/bmp",
            "image/gif",
            "image/jpeg",
            "image/tiff"
        );
    
        $thread   = $service->users_threads->get($user, $threadId);
        $threadItem = new ThreadItem($thread);
        // // return $threadItem;
        // $threadItem->hasAttachments = false;

        // foreach ($threadItem->messages as $key => $message) {
        //     $images = [];
        //     $image;

        //     foreach ($message->payload->parts as $payload) {
        //         if(in_array($payload->mimeType, $mimeTypes)) {
        //             $image = attachment_get_with_images($service, $userId, $message->messageId, $payload->body->attachmentId, $payload->fileName, $payload->mimeType);
        //             $images[key($image)] = $image[key($image)];
        //         }
        //     }
        //     $threadItem->messages[$key]->images = $images;
        //     $threadItem->hasAttachments = true;
        //     // printPre($threadItem->messages[$key]->images);
        // }

        // if($threadItem->hasAttachments) {
        //     foreach ($threadItem->messages as $key => $message) {
        //         foreach ($message->payload->parts as $key1 => $payload) {
        //             foreach ($payload->parts as $key2 => $payload1) {
        //                 if($payload1->mimeType == "text/html") {
        //                     // printPre($threadItem->messages[$key]->payload->parts[$key1]->parts[$key2]);
        //                     $threadItem->messages[$key]->payload->parts[$key1]->parts[$key2]->body->data = subImagesInHtml($payload1->body->data, $threadItem->messages[$key]->images);
        //                     // printPre($threadItem->messages[$key]->payload->parts[$key1]);
        //                 }
        //             }
        //         }
        //     }
        // }

        // printPre($threadItem);

        return $threadItem;
        // printPre($threadObject);
    }
    catch (Exception $e) {
        print 'An error occurred: ' . $e->getMessage();
    }
}

function attachment_get($service, $userId, $messageId, $attachmentId, $opt_param = array())
{
    try {
        return new BodyItem($service->users_messages_attachments->get($userId, $messageId, $attachmentId, $opt_param));
        // $attachment = $service->users_messages_attachments->get($userId, $messageId, $attachmentId, $opt_param);
        // return $attachment;
    }
    catch (Exception $e) {
        print 'An error occurred: ' . $e->getMessage();
    }
}

function attachment_get_with_images($service, $userId, $messageId, $attachmentId, $fileName, $mimeType)
{
    try {
        $mimeExplode = explode("/", $mimeType);
        $mime        = $mimeExplode[0];
        
        $opt_param  = array();
        $attachment = $service->users_messages_attachments->get($userId, $messageId, $attachmentId, $opt_param);
        
        $attachmentObject = new Attachment($attachment->getAttachmentId(), $attachment->getData(), $attachment->getSize());
        // echo json_encode($attachmentObject);
        
        // Converting to standard RFC 4648 base64-encoding
        // see http://en.wikipedia.org/wiki/Base64#Implementations_and_history
        $attachment = strtr($attachment->getData(), array(
            '-' => '+',
            '_' => '/'
        ));
        
        $folder = $messageId;
        
        if (!file_exists(__DIR__ . "/../images/$folder")) {
            mkdir(__DIR__ . "/../images/$folder", 0777, true);
        }
        
        $fh = fopen(__DIR__ . "/../images/$folder/$fileName", "w+");
        // echo "File at: " . __DIR__ ."/file.png";
        fwrite($fh, base64_decode($attachment));
        fclose($fh);
        
        $file_explode = explode(".", $fileName);
        $file         = "cid:" . $file_explode[0];
        
        return array(
            $file => "./images/$folder/$fileName"
        );
        // return $attachment;
        
    }
    catch (Exception $e) {
        print 'An error occurred: ' . $e->getMessage();
    }
}

function loadPage($title = "Gmail Api")
{
?>
<!DOCTYPE html>
<html lang="en" ng-app="app">
<head>
<!--   <meta charset="utf-8">
  <meta http-equiv="X-UA-Comaptible" content="IE-endge">
  <meta name="viewport" content="width=device-width, initial-scale=1"> -->
  <title><?= htmlspecialchars($title) ?></title>
    <!-- css -->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="stylesheet" href="assets/css/vendor/bootstrap/bootstrap.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"> -->
    
    <!-- javascripts -->
    <script src="assets/js/vendor/jquery/jquery-2.1.4.min.js"></script>
    <script src="assets/js/vendor/bootstrap/bootstrap.min.js"></script>

    <script type="text/javascript" src="assets/js/vendor/angular/angular.min.js"></script>
    <script type="text/javascript" src="assets/js/vendor/angular/angular-animate.min.js"></script>
    <script type="text/javascript" src="assets/js/vendor/angular/angular-route.min.js"></script>
    
    <script type="text/javascript" src="assets/js/app.js"></script>
    <script type="text/javascript" src="assets/js/maincontroller.js"></script>
    <script type="text/javascript" src="assets/js/composecontroller.js"></script>
    <script type="text/javascript" src="assets/js/routes.js"></script>
    <script type="text/javascript" src="assets/js/directives.js"></script>
    <script type="text/javascript" src="assets/js/filters.js"></script>
    <script type="text/javascript" src="assets/js/script.js"></script>
</head>
<body>
  <?php
    require_once __DIR__ . '/../assets/partials/base.html';
    ?>
</body>
</html>
<?php
}
// require_once __DIR__ . '/../assets/partials/login.php';