<?php
require_once __DIR__ . '/../vendor/autoload.php';

define('APPLICATION_NAME', 'PHP mail app using Gmail API');
define('CREDENTIALS_PATH', '~/.credentials/gmail-php-quickstart.json');
define('CLIENT_SECRET_PATH', __DIR__ . '/../client_secret.json');
define('SCOPES', implode(' ', array(
  Google_Service_Gmail::GMAIL_READONLY,
  Google_Service_Gmail::GMAIL_SEND,
  Google_Service_Gmail::GMAIL_MODIFY,
  'https://www.googleapis.com/auth/drive')
));
// define('REDIRECT_URI', 'http://localhost/emailapp/index.php');