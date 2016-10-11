<?php

$configFile = dirname(__FILE__) . '/config.php';

if (file_exists($configFile))
{
    include $configFile;
}
else
{
    die("Please rename the config-sample.php file to config.php and add your Flickr API key and secret to it\n");
}

spl_autoload_register(function($className)
{
    $className = str_replace ('\\', DIRECTORY_SEPARATOR, $className);
    include (dirname(__FILE__) . '/DPZ/Flickr.php');
});

use \DPZ\Flickr;

// Build the URL for the current page and use it for our callback
$callback = sprintf('%s://%s:%d%s',
    (@$_SERVER['HTTPS'] == "on") ? 'https' : 'http',
    $_SERVER['SERVER_NAME'],
    $_SERVER['SERVER_PORT'],
    $_SERVER['SCRIPT_NAME']
    );

$flickr = new Flickr($flickrApiKey, $flickrApiSecret);

$parameters =  array(
    'per_page' => 200,
    'extras' => 'url_sq,url_m,path_alias,date_upload,original_format'
);


$response = $flickr->call('flickr.photos.search', $parameters);
echo 'yeyey';

$ok = @$response['stat'];

if ($ok == 'ok')
{
    $photos = $response['photos'];
    echo json_encode($photos);
}
else
{
    $err = @$response['err'];
    die('error: '.$err);
}


?>