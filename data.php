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
    $userId       = 'me';
    
    if (isset($_GET['search'])) {
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
        echo "Number of files to upload: " . ini_get('max_file_uploads') . "\n\r";
        echo "File upload max size " . ini_get('upload_max_filesize') . "\r\n";
        echo "File upload max size " . file_upload_max_size() . "\r\n";
        echo "Post max size " . ini_get('post_max_size') . "\n\r";

        // print_r(isset($_POST));
        if(isset($_POST['type']) && $_POST['type'] == 'sendMail') {
            // if($data->type == 'sendMail') 
            $post = sizeof($_POST) > 0 ? $_POST : [];
            $files = sizeof($_FILES) > 0 ? $_FILES : [];

            echo "Size of files: " . sizeof($files['files'][array_keys($files['files'])[0]]) . "\r\n";


            $file_size = 0;
            $file = array();
            if(sizeof($files) > 0) {
                for ($i=0; $i < sizeof($files['files'][array_keys($files['files'])[0]]); $i++) {
                    $f = null;
                    foreach ($files['files'] as $key => $value) {
                        $f[$key] = $value[$i];
                    }
                    $file[$i] = $f;

                    $file_size += $f['size'];
                }
            }

            // print_r($files['files']['size']);
            echo "Total file size: " . $file_size . "\r\n";
            
            print_r($post);
            print_r($file);
    
            // error_reporting(0);
            // $message = new MessageSend($post);

            // if(sizeof($files) > 0) {
            //     $message->setAttachments($file);
            // }

            try {
/*DEFINE("TESTFILE", $file[0]['name']);
if (!file_exists(TESTFILE)) {
  $fh = fopen(TESTFILE, 'w');
  fseek($fh, 1024*1024*20);
  fwrite($fh, "!", 1);
  fclose($fh);
}
$drive_service = new Google_Service_Drive($client);

  $drive_file = new Google_Service_Drive_DriveFile();
  $drive_file->title = "Big File";
  $chunkSizeBytes = 1 * 1024 * 1024;

  // Call the API with the media upload, defer so it doesn't immediately return.
  $client->setDefer(true);
  $request = $drive_service->files->insert($drive_file);

  // Create a media file upload to represent our upload process.
  $media = new Google_Http_MediaFileUpload(
      $client,
      $request,
      'text/plain',
      null,
      true,
      $chunkSizeBytes
  );
  $media->setFileSize(filesize(TESTFILE));

  // Upload the various chunks. $status will be false until the process is
  // complete.
  $status = false;
  $handle = fopen(TESTFILE, "rb");
  while (!$status && !feof($handle)) {
    // read until you get $chunkSizeBytes from TESTFILE
    // fread will never return more than 8192 bytes if the stream is read buffered and it does not represent a plain file
    // An example of a read buffered file is when reading from a URL
    $chunk = readVideoChunk($handle, $chunkSizeBytes);
    $status = $media->nextChunk($chunk);
  }

  // The final value of $status will be the data from the API for the object
  // that has been uploaded.
  $result = false;
  if ($status != false) {
    $result = $status;
  }

  fclose($handle);*/


/*$drive_service = new Google_Service_Drive($client);
$drive_file = new Google_Service_Drive_DriveFile();
$drive_file->title = "Big File";
$chunkSizeBytes = 1 * 1024 * 1024;

// Call the API with the media upload, defer so it doesn't immediately return.
$client->setDefer(true);
$request = $drive_service->files->insert($drive_file);

// Create a media file upload to represent our upload process.
$media = new Google_Http_MediaFileUpload(
  $client,
  $request,
  'text/plain',
  null,
  true,
  $chunkSizeBytes
);
$media->setFileSize(filesize($file[0]['tmp_name']));

// Upload the various chunks. $status will be false until the process is
// complete.
$status = false;
$handle = fopen($file[0]['tmp_name'], "rb");
while (!$status && !feof($handle)) {
  $chunk = fread($handle, $chunkSizeBytes);
  $status = $media->nextChunk($chunk);
 }

// The final value of $status will be the data from the API for the object
// that has been uploaded.
$result = false;
if($status != false) {
  $result = $status;
}

fclose($handle);
// Reset to the client to execute requests immediately in the future.
$client->setDefer(false);


print_r($status);*/




$userId = "me";
// $method = "POST";
// $headers = array();
// $postBody = null;
// $url = "/upload/gmail/v1/users/{$userId}/messages/send";
$url = "https://www.googleapis.com/upload/gmail/v1/users/{$userId}/messages/send?uploadType=multipart";

echo $url;
// $request = new Google_Http_Request($url, $method, $headers, $postBody);
$request = new Google_Http_Request($url);

echo "failed here";
$chunkSizeBytes = 1 * 1024 * 1024;

$media = new Google_Http_MediaFileUpload(
  $client,
  $request,
  'text/plain',
  null,
  true,
  $chunkSizeBytes
);
echo "failed here1";
$media->setFileSize(filesize($file[0]['tmp_name']));
$status = false;
$handle = fopen($file[0]['tmp_name'], "rb");
while (!$status && !feof($handle)) {
  $chunk = fread($handle, $chunkSizeBytes);
  $status = $media->nextChunk($chunk);
}
echo "failed here3";
print_r($status);
echo "failed here4";










                /*$this->execute(
                        'https://www.googleapis.com/upload/gmail/v1/users/' . $this->user_email . '/messages/send?uploadType=media',
                        'POST',
                        array(
                            'Content-Type' => 'message/rfc822'
                        ),
                        $data
                    );*/

                // The message needs to be encoded in Base64URL
                // $mime = rtrim(strtr(base64_encode($message->formatMessage()), '+/', '-_'), '=');
                // $msg = new Google_Service_Gmail_Message();
                // $msg->setRaw($mime);

                // $msg->setId();
                // $msg->setThreadId('15231854c99addab');
                // echo "\n\r" . strlen($msg->getPayload()) . " - " . strlen($mime);

                // $objSentMsg = $service->users_messages->send($userId, $msg);
                // $objSentMsg = $service->users_messages->send($userId, $msg, ['uploadType' => 'multipart']);

/*                $media = new Google_Http_MediaFileUpload(
                  $client,
                  $request,
                  'text/plain',
                  null,
                  true,
                  $chunkSizeBytes
                );

                $media->setFileSize(filesize(TESTFILE));
                $status = false;
                $handle = fopen(TESTFILE, "rb");
                while (!$status && !feof($handle)) {
                  $chunk = fread($handle, $chunkSizeBytes);
                  $status = $media->nextChunk($chunk);
                }*/


                // print('Message sent object');
                // print_r($objSentMsg);

            } catch (Exception $e) {
                print($e->getMessage());
            } 
        }
/*        else {
             // if($_POST['type'] == 'reply' || $_POST['type'] == 'forward')
            $data = json_decode(file_get_contents('php://input'));
            // print_r($data);     
            // print_r($_POST);

            if($data->type == 'modifyLabels') {
                // echo "HERE";
                $data = json_decode(file_get_contents('php://input'));
                // print_r($data);
                
                $messageId = $data->messageId;
                $labelsToAdd = $data->labelsToAdd;
                $labelsToRemove = $data->labelsToRemove;

                $result = message_label_modify($service, $userId, $messageId, $labelsToAdd, $labelsToRemove);
                print_r($result);
            }
        }*/
    }
}

// Returns a file size limit in bytes based on the PHP upload_max_filesize
// and post_max_size
function file_upload_max_size() {
  static $max_size = -1;

  if ($max_size < 0) {
    // Start with post_max_size.
    $max_size = parse_size(ini_get('post_max_size'));

    // If upload_max_size is less, then reduce. Except if upload_max_size is
    // zero, which indicates no limit.
    $upload_max = parse_size(ini_get('upload_max_filesize'));
    if ($upload_max > 0 && $upload_max < $max_size) {
      $max_size = $upload_max;
    }
  }
  return $max_size;
}

function parse_size($size) {
  $unit = preg_replace('/[^bkmgtpezy]/i', '', $size); // Remove the non-unit characters from the size.
  $size = preg_replace('/[^0-9\.]/', '', $size); // Remove the non-numeric characters from the size.
  if ($unit) {
    // Find the position of the unit in the ordered string which is the power of magnitude to multiply a kilobyte by.
    return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
  }
  else {
    return round($size);
  }
}

function readVideoChunk ($handle, $chunkSize)
{
    $byteCount = 0;
    $giantChunk = "";
    while (!feof($handle)) {
        // fread will never return more than 8192 bytes if the stream is read buffered and it does not represent a plain file
        $chunk = fread($handle, 8192);
        $byteCount += strlen($chunk);
        $giantChunk .= $chunk;
        if ($byteCount >= $chunkSize)
        {
            return $giantChunk;
        }
    }
    return $giantChunk;
}