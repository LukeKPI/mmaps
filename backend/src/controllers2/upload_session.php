<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/upload_sessions', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('UploadSession');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $upload_sessions =  $query->find_array();

    return new Response(json_encode($upload_sessions), 200, array('Content-Type' => 'application/json'));
});

$app->get('/upload_sessions/{id}', function ($id) use ($app) {

    $upload_session =  $app['paris']->getModel('UploadSession')->find_one($id);
    if (!$upload_session) {
        $app->abort(404, "UploadSession not found");
    }

    return new Response(json_encode($upload_session->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/upload_sessions', function (Request $request) use ($app) {

    $upload_session =  $app['paris']->getModel('UploadSession')->create();
    $data = $request->request->all();
    $upload_session->set($data);

    if (!$upload_session->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($upload_session->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/upload_sessions/{id}', function ($id, Request $request) use ($app) {

    $upload_session =  $app['paris']->getModel('UploadSession')->find_one($id);
    if (!$upload_session) {
        $app->abort(404, "UploadSession not found");
    }
    $upload_session->set($request->request->all());
    $upload_session->save();

    return new Response(json_encode($upload_session->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/upload_sessions/{id}', function ($id) use ($app) {
    $upload_session =  $app['paris']->getModel('UploadSession')->find_one($id);
    if (!$upload_session) {
        $app->abort(404, "UploadSession not found");
    }
    $upload_session->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>