<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/stations', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('Station');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $stations =  $query->find_array();

    return new Response(json_encode($stations), 200, array('Content-Type' => 'application/json'));
});

$app->get('/stations/{id}', function ($id) use ($app) {

    $station =  $app['paris']->getModel('Station')->find_one($id);
    if (!$station) {
        $app->abort(404, "Station not found");
    }

    return new Response(json_encode($station->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/stations', function (Request $request) use ($app) {

    $station =  $app['paris']->getModel('Station')->create();
    $data = $request->request->all();
    $station->set($data);

    if (!$station->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($station->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/stations/{id}', function ($id, Request $request) use ($app) {

    $station =  $app['paris']->getModel('Station')->find_one($id);
    if (!$station) {
        $app->abort(404, "Station not found");
    }
    $station->set($request->request->all());
    $station->save();

    return new Response(json_encode($station->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/stations/{id}', function ($id) use ($app) {
    $station =  $app['paris']->getModel('Station')->find_one($id);
    if (!$station) {
        $app->abort(404, "Station not found");
    }
    $station->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>