<?php

    $postdata = file_get_contents("php://input");

    if($postdata != null) {
        $data = json_decode($postdata);
        $json = $data->json;
                
        if (json_decode($postdata) != null) { /* sanity check */    
            file_put_contents('images.json', print_r($json, true));
        } else {
            return 'error'; 
        }
    } 
    
?>
