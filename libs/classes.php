<?php
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
    
    function __construct() {}

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

class ThreadItem {
    var $threadId;
    var $historyId;
    var $snippet;
    var $messages = array();

    function __construct($thread) {
        $this->threadId  = $thread->getId();
        $this->historyId = $thread->getHistoryId();
        $this->snippet   = $thread->getSnippet();

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
        $this->payload = new PayloadItem($payload);
    }   

    function setRaw($raw) {
        $this->raw = $raw;
    }
}

class PayloadItem {
    var $body;
    var $fileName;
    var $headers = array();
    var $mimeType;
    var $partId;
    var $parts = array();

    function __construct($payload) {
        $this->fileName = $payload->getFilename();
        $this->mimeType = $payload->getMimeType();
        $this->partId = $payload->getPartId();
        $this->addHeaders($payload->getHeaders());
        $this->body = new PayloadBodyItem($payload->getBody());
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

class PayloadBodyItem extends BodyItem {
    // var $attachmentId;
    // var $data;
    // var $size;

    // function __construct($body) {
    //     $this->attachmentId = $body->getAttachmentId();
    //     $this->data = $body->getData();
    //     $this->size = $body->getSize();
    // }
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