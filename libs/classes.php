<?php
function stripStyles($partBodyData) {
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

class Profile {
    var $email;
    var $threads;
    var $messages;
    var $historyId;

    function __construct($profile) {
        $this->email = $profile->getEmailAddress();
        $this->historyId = $profile->getHistoryId();
        $this->messages = $profile->getMessagesTotal();
        $this->threads = $profile->getThreadsTotal();    
    }
}

class MessageSend {
    var $charset;
    var $to;
    var $toEmail;
    var $cc;
    var $bcc;
    var $from;
    var $fromEmail;
    var $subject;
    var $message;
    var $boundary;
    var $dateTime;
    var $attachments;
    var $hasAttachments;
    var $attachmentSize;
    var $boundary1;

    function __construct($post = []) {
        $this->charset = 'utf-8';
        $this->hasAttachments = false;
        $this->attachments = array();
        $this->boundary = uniqid(rand(), true);
        $this->dateTime = date('M d, Y h:i:s A');
        $this->attachmentSize = 0;

        if(sizeof($post) > 0) {
            // print_r($post['to']);

            $this->from = "Kajan";
            $this->fromEmail = "25kajan@gmail.com";
            $post['to'] ? $this->to = $post['to'] : '';
            $post['to'] ? $this->toEmail = $post['to'] : '';
            $post['subject'] ? $this->subject = $post['subject'] : '';
            $post['mes'] ? $this->message = $post['mes'] : '';
            $post['cc'] ? $this->cc = $post['cc'] : '';
            $post['bcc'] ? $this->bcc = $post['bcc'] : '';
        }
    }

    function setAttachments($attachments) {
        $this->hasAttachments = true;
        $this->attachments = $attachments;
        $this->boundary1 = uniqid(rand(), true);
        // foreach ($attachments as $key => $value) {
        //     print_r($value);
        // }
    }

    function formatMessage() {
        $msg = "";
        // $msg = "POST https://www.googleapis.com/upload/gmail/v1/users/me/messages/send\n\r";
        // $msg .= 'Content-Type: Multipart/' . ($this->hasAttachments ? 'mixed' : 'alternative') . '; boundary="' . $this->boundary . "\"\r\n";
        // $msg .= 'Content-Type: Multipart/' . ($this->hasAttachments ? 'related' : 'alternative') . '; boundary="' . $this->boundary . "\"\r\n";
        // $msg .= 'MIME-Version: 1.0' . "\r\n";


        // $msg .= "\r\n--" . $this->boundary . "\r\n";
        // $msg .= "Content-Type: message/rfc822;\n\r";



        $msg .= 'To: =?' . $this->charset . '?B?' . base64_encode($this->to) . '?= <' . $this->toEmail . ">\r\n";
        $msg .= 'From: =?' . $this->charset . '?B?' . base64_encode($this->from) . '?= <' . $this->fromEmail . ">\r\n";
        $msg .= 'Subject: =?' . $this->charset . '?B?' . base64_encode($this->subject) . "?=\r\n";

/*        $msg .= 'To: ' .$this->toEmail . "\r\n";
        $msg .= 'From: ' . $this->fromEmail . "\r\n";
        $msg .= 'Subject: ' . $this->subject . "\r\n";*/


        // $msg .= $this->cc !== null ? 'Cc: =?' . $this->charset . '?B?' . base64_encode($this->cc) . '?= <' . $this->cc . ">\r\n" : '';
        // $msg .= $this->bcc !== null ? 'Bcc: =?' . $this->charset . '?B?' . base64_encode($this->bcc) . '?= <' . $this->bcc . ">\r\n" : '';


        // $threadId   = "";
        // $messageId  = "";
        // References + ' ' + MessageID
        $references = "References: <CAHjsFs-bQvGthhoDYeD9T-pbLOsn-66uCQS8bach+7L3YFh71A@mail.gmail.com>\r\n";
        $reSubject  = 'Subject: =?' . $this->charset . '?B?' . base64_encode("Fwd:a lot of files") . "?=\r\n";
        $inReplyTo  = "In-Reply-To: <CAHjsFs-bQvGthhoDYeD9T-pbLOsn-66uCQS8bach+7L3YFh71A@mail.gmail.com>\r\n";

        // $msg .= $references;
        // $msg .= $reSubject;
        // $msg .= $inReplyTo;


        $msg .= 'MIME-Version: 1.0' . "\r\n";
        $msg .= 'Content-Type: Multipart/' . ($this->hasAttachments ? 'related' : 'alternative') . '; boundary="' . $this->boundary . "\"\r\n";

        $msg .= "\r\n--" . $this->boundary . "\r\n";

        // text/plain
        $this->hasAttachments ? ($msg .= 'Content-Type: Multipart/alternative; boundary="' . $this->boundary1 . "\"\r\n") . ($msg .= "\r\n--" . $this->boundary1 . "\r\n") : '' ;
        $msg .= 'Content-Type: text/plain; charset=' . $this->charset . "\r\n";
        // $msg .= 'Content-Transfer-Encoding: 7bit' . '\r\n\r\n';
        $msg .=  strip_tags($this->message, '') . "\r\n";

        // text/html
        $this->hasAttachments ? $msg .= "\r\n--" . $this->boundary1 . "\r\n" : $msg .= "\r\n--" . $this->boundary . "\r\n";
        $msg .= 'Content-Type: text/html; charset=' . $this->charset . "\r\n";
        $msg .= 'Content-Transfer-Encoding: quoted-printable' . "\r\n\r\n";
        $msg .=  $this->message . "\r\n";

        $this->hasAttachments ? $msg .= "\r\n--" . $this->boundary1 . "--\r\n" : '' ;

        if($this->hasAttachments) {
            foreach ($this->attachments as $key => $value) {
                $filePath = $value['tmp_name'];
                $finfo = finfo_open(FILEINFO_MIME_TYPE); // return mime type ala mimetype extension
                $mimeType = finfo_file($finfo, $filePath);
                $fileName = $value['name'];
                $fileData = base64_encode(file_get_contents($filePath));

                $msg .= "\r\n--{$this->boundary}\r\n";
                $msg .= 'Content-Type: '. $mimeType .'; name="'. $fileName .'";' . "\r\n";            
                // $msg .= 'Content-ID: <' . $strSesFromEmail . '>' . "\r\n";            
                $msg .= 'Content-Description: ' . $fileName . ';' . "\r\n";
                $msg .= 'Content-Disposition: attachment; filename="' . $fileName . '"; size=' . filesize($filePath). ';' . "\r\n";
                $msg .= 'Content-Transfer-Encoding: base64' . "\r\n\r\n";
                $msg .= chunk_split(base64_encode(file_get_contents($filePath)), 76, "\n") . "\r\n";

                $this->attachmentSize += filesize($filePath);
            }
        }

        $msg .= "\r\n--" . $this->boundary . "--\r\n";

        // echo $msg;
        // echo $this->attachmentSize;
        // echo "\r\n" . strlen($msg);
        // echo "\r\n" . strlen(rtrim(strtr(base64_encode($msg), '+/', '-_'), '='));

        return $msg;
    }
}

/*class MessageSend {
    var $charset;
    var $to;
    var $toEmail;
    var $from;
    var $fromEmail;
    var $subject;
    var $message;
    var $date;
    var $cc;
    var $bcc;

    function __construct() {
        $this->date = date('M d, Y h:i:s A');
        $this->charset = "utf-8";
    }

    function formatMessage() {
        $mes = "";
        $boundary = uniqid(rand(), true);
        $mes .= 'To: ' . '=?' . $this->charset . '?B?' . base64_encode($this->to) . '?= <' . $this->toEmail . '>' . "\r\n";
        $mes .= 'From: ' . '=?' . $this->charset . '?B?' . base64_encode($this->from) . '?= <' . $this->fromEmail . '>' . "\r\n";
        $mes .= $this->cc !== null ? 'Cc: ' . '=?' . $this->charset . '?B?' . base64_encode($this->cc) . '?= <' . $this->cc . '>' . "\r\n" : '';
        $mes .= $this->bcc !== null ? 'Bcc: ' . '=?' . $this->charset . '?B?' . base64_encode($this->bcc) . '?= <' . $this->bcc . '>' . "\r\n" : '';
        $mes .= 'Subject: ' . '=?' . $this->charset . '?B?' . base64_encode($this->subject) . '?=' . "\r\n";
        $mes .= 'MIME-Version: 1.0' . "\r\n";
        $mes .= 'Content-Type: Multipart/Alternative; boundary="' . $boundary . '"' . "\r\n";

        // start of message
        // text/plain
        $mes .= "\r\n--{$boundary}\r\n";
        $mes .= 'Content-Type: text/plain; charset=' . $this->charset . "\r\n";
        $mes .= 'Content-Transfer-Encoding: 7bit' . "\r\n\r\n";
        $mes .= strip_tags($this->message) . "\r\n";

        // text/html
        $mes .= "\r\n--{$boundary}\r\n";
        $mes .= 'Content-Type: text/html; charset=' . $this->charset . "\r\n";
        $mes .= 'Content-Transfer-Encoding: quoted-printable' . "\r\n\r\n";
        $mes .= $this->message . "\r\n";

        // end of message
        $mes .= "\r\n--{$boundary}--\r\n";
        // echo "<pre>";
        // echo $mes;
        // echo "</pre>";
        return rtrim(strstr(base64_encode($mes), '+/', '-_'), "=");
    }
}*/

class MessageListItem {
    var $threadId;
    var $messageId;

    function __construct($threadId, $messageId) {
        $this->threadId = $threadId;
        $this->messageId = $messageId;
    }
}

class MessageList {
    var $messageList = array();

    function __construct() {}

    function addMessage($message) {
        array_push($this->messageList, $message);
    }
}

class ThreadList
{
    var $threadList = array();
    var $nextPageToken;
    var $resultSizeEstimate;
    
    function __construct($response) {
        $this->nextPageToken = $response->getNextPageToken();
        $this->resultSizeEstimate = $response->getResultSizeEstimate();

        foreach ($response->getThreads() as $thread) {
            $this->addThread(new ThreadListItem($thread));
        }
    }

    function addThread($thread)
    {
        array_push($this->threadList, $thread);
    }
}

class Thread
{
    var $threadId;
    var $historyId;
    var $snippet;
    var $messages = array();
    
    function __construct($threadId, $historyId, $snippet)
    {
        $this->threadId  = $threadId;
        $this->historyId = $historyId;
        $this->snippet   = $snippet;
    }
    
    // function addMessage($messageId, $historyId, $internalDate, $labelIds, $sizeEstimate, $snippet, $threadId) {
    // 	array_push($this->messages, new Message($messageId, $historyId, $internalDate, $labelIds, $sizeEstimate, $snippet, $threadId));
    // }
    
    function addMessage($message)
    {
        array_push($this->messages, $message);
    }
}

class ThreadListItem {
    var $threadId;
    var $historyId;
    var $snippet;

    function __construct($thread) {
        $this->threadId  = $thread->getId();
        $this->historyId = $thread->getHistoryId();
        // $this->snippet   = $thread->getSnippet();
        $this->snippet   = html_entity_decode($thread->getSnippet());
    }
}
class ThreadItem {
    var $threadId;
    var $historyId;
    var $snippet;
    var $messages = array();

    function __construct($thread) {
        $this->threadId  = $thread->getId();
        $this->historyId = $thread->getHistoryId();
        // $this->snippet   = $thread->getSnippet();
        $this->snippet   = html_entity_decode($thread->getSnippet());

        foreach ($thread->getMessages() as $message) {
            $this->addMessage($message);
        }
        // $this->messages = $thread->getMessages();
    }
    
    function addMessage($message)
    {
        array_push($this->messages, new MessageItem($message));
    }
}

class MessageItem {
    var $historyId;
    var $messageId;
    var $sizeEstimate;
    var $snippet;
    var $threadId;
    var $labelIds = array();
    var $payload;
    var $raw;
    
    // function __construct($messageId, $historyId, $internalDate, $labelIds, $sizeEstimate, $snippet, $threadId) {
    function __construct($message)
    {
        $this->messageId    = $message->getId();
        $this->historyId    = $message->getHistoryId();
        $this->sizeEstimate = $message->getSizeEstimate();
        $this->snippet      = $message->getSnippet();
        $this->threadId     = $message->getThreadId();
        $this->addLabels($message->getLabelIds());
        $this->setPayload($message->getPayload());
        $this->setRaw($message->getRaw());
    }
    
    function addLabels($labels)
    {
        foreach ($labels as $label) {
            array_push($this->labelIds, $label);
        }
    }
    
    function setPayload($payload)
    {
        // , $this->messageId, $this->threadId
        $this->payload = new PayloadItem($payload);
    }   

    function setRaw($raw) {
        $this->raw = $raw;
    }
}
    
// $mimeTypes   = array(
//     "image/png",
//     "image/bmp",
//     "image/gif",
//     "image/jpeg",
//     "image/tiff"
// );

class PayloadItem {
    var $body;
    var $fileName;
    var $headers = array();
    var $mimeType;
    var $partId;
    var $parts = array();

// , $messageId, $threadId
    function __construct($payload) {
        $this->fileName = $payload->getFilename();
        $this->mimeType = $payload->getMimeType();
        $this->partId = $payload->getPartId();
        $this->addHeaders($payload->getHeaders());
        // if(in_array($payload->getMimeType(), $mimeTypes)) {

        // }
        $this->body = new PayloadBodyItem($payload->getBody(), $payload->getMimeType());
        if($payload->getParts()) {
            foreach ($payload->getParts() as $part) {
                array_push($this->parts, new PayloadItem($part));
            }
        }
    }

    function addHeaders($headers) {
        foreach ($headers as $header) {
            $this->headers[$header->getName()] = $header->getValue();
        }
    }
}

class BodyItem {
    var $attachmentId;
    var $data;
    var $size;

    function __construct($body) {
        $this->attachmentId = $body->getAttachmentId();
        $this->data = $body->getData();
        $this->size = $body->getSize();
    }
}

class PayloadBodyItem {
    var $attachmentId;
    var $data;
    var $size;

    function __construct($body, $mimeType) {
        $this->attachmentId = $body->getAttachmentId();
        $this->data = $mimeType == "text/html" ? stripStyles($body->getData()) : $body->getData();
        $this->size = $body->getSize();
    }
}

class AttachmentItem {
    function __construct($attachment) {}
}

class HeaderItem {
    var $name;
    var $value;

    function __construct($header) {
        $this->name = $header->getName();
        $this->value = $header->getValue();
    }
}

class Message
{
    var $historyId;
    var $messageId;
    var $sizeEstimate;
    var $snippet;
    var $threadId;
    var $labelIds = array();
    var $payload;
    
    // function __construct($messageId, $historyId, $internalDate, $labelIds, $sizeEstimate, $snippet, $threadId) {
    function __construct($messageId, $historyId, $sizeEstimate, $snippet, $threadId)
    {
        $this->messageId    = $messageId;
        $this->historyId    = $historyId;
        $this->sizeEstimate = $sizeEstimate;
        $this->snippet      = $snippet;
        $this->threadId     = $threadId;
        // $this->labelIds = $labelIds;
    }
    
    function addLabels($labels)
    {
        array_push($this->labelIds, $labels);
    }
    
    function setPayload($payload)
    {
        $this->payload = $payload;
    }
}

class Payload
{
    var $filename;
    var $mimeType;
    var $partId;
    var $headers = array();
    var $body = array();
    var $parts = array();
    var $hasAttachments;
    var $images = array();
    
    function __construct($filename, $mimeType, $partId)
    {
        $this->filename       = $filename;
        $this->mimeType       = $mimeType;
        $this->partId         = $partId;
        $this->hasAttachments = false;
    }
    
    function addHeaders($name, $value)
    {
        $this->headers[$name] = $value;
    }
    
    // function addHeaders($headers) {
    // 	array_push($this->headers, $headers);
    // }
    
    function setBody($body)
    {
        $this->body = $body;
    }
    
    function addParts($parts)
    {
        array_push($this->parts, $parts);
    }
    
    function setHasAttachments($hasAttachments)
    {
        $this->hasAttachments = $hasAttachments;
    }
    
    function getHasAttachments()
    {
        return $this->hasAttachments;
    }
    
    function addImage($image)
    {
        array_push($this->images, $image);
    }
    
    function getImages()
    {
        return $this->images;
    }
    
    function getParts()
    {
        return $this->parts;
    }
}

class Body
{
    var $size;
    var $data;
    var $attachmentId;
    var $attachment;
    var $image;
    
    function __construct($size, $data, $attachmentId, $attachment = null, $image = null)
    {
        $this->size         = $size;
        $this->data         = $data;
        $this->attachmentId = $attachmentId;
        $this->attachment   = $attachment;
        $this->image        = $image;
    }
}

class Header
{
    var $name;
    var $value;
    
    function __construct($name, $value)
    {
        $this->name  = $name;
        $this->value = $value;
    }
}

class Part
{
    var $partId;
    var $mimeType;
    var $filename;
    var $headers = array();
    var $body = array();
    var $parts = array();
    
    function __construct($partId, $mimeType, $filename)
    {
        $this->partId   = $partId;
        $this->mimeType = $mimeType;
        $this->filename = $filename;
    }
    
    // function addHeaders($headers) {
    // 	array_push($this->headers, $headers);
    // }
    
    function addHeaders($name, $value)
    {
        $this->headers[$name] = $value;
    }
    
    function addBody($body)
    {
        array_push($this->body, $body);
    }
    
    function addParts($parts)
    {
        array_push($this->parts, $parts);
    }
    
    function getBody()
    {
        return $this->body;
    }
    
    function setBody($body)
    {
        $this->body = $body;
    }
    
    function getParts()
    {
        return $this->parts;
    }
}

class PartHeader
{
    var $name;
    var $value;
    
    function __construct($name, $value)
    {
        $this->name  = $name;
        $this->value = $value;
    }
}

class PartBody
{
    var $size;
    var $data;
    var $attachmentId;
    var $attachment;
    
    function __construct($size, $data)
    {
        $this->size = $size;
        $this->data = $data;
    }
    
    function setAttachmentId($attachment)
    {
        $this->attachment = $attachment;
    }
}

class Label
{
    var $labelId;
    var $name;
    var $messageListVisibility;
    var $labelListVisibility;
    var $type;
    var $messagesTotal;
    var $messagesUnread;
    var $threadsTotal;
    var $threadsUnread;
    
    function __construct($labelId, $name, $messageListVisibility, $labelListVisibility, $type, $messagesTotal, $messagesUnread, $threadsTotal, $threadsUnread)
    {
        $this->labelId = $labelId;
        $this->name = $name;
        $this->messageListVisibility = $messageListVisibility;
        $this->labelListVisibility = $labelListVisibility;
        $this->type = $type;
        $this->messagesTotal = $messagesTotal;
        $this->messagesUnread = $messagesUnread;
        $this->threadsTotal = $threadsTotal;
        $this->threadsUnread = $threadsUnread;
    }
}

class LabelSimple {
    var $id;
    var $name;
    var $messageListVisibility;
    var $labelListVisibility;
    var $type;
       
    function __construct($id, $name, $messageListVisibility, $labelListVisibility, $type) {
        $this->id = $id;
        $this->name = $name;
        $this->messageListVisibility = $messageListVisibility;
        $this->labelListVisibility = $labelListVisibility;
        $this->type = $type;
    }
}

class Attachment
{
    var $attachmentId;
    var $data;
    var $size;
    
    function __construct($attachmentId, $data, $size)
    {
        $this->attachmentId = $attachmentId;
        $this->data         = $data;
        $this->size         = $size;
    }
}

class ThreadsSimple {
    var $id;
    var $snippet;

    function __construct($id, $snippet) {
        $this->id = $id;
        $this->snippet = $snippet;
    }
}