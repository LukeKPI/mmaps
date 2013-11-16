<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/areas', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('Area');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $areas =  $query->find_array();

    return new Response(json_encode($areas), 200, array('Content-Type' => 'application/json'));
});

$app->get('/areas/{id}', function ($id) use ($app) {

    $area =  $app['paris']->getModel('Area')->find_one($id);
    if (!$area) {
        $app->abort(404, "Area not found");
    }

    return new Response(json_encode($area->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/areas', function (Request $request) use ($app) {

    $area =  $app['paris']->getModel('Area')->create();
    $data = $request->request->all();
    $area->set($data);

    if (!$area->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($area->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/areas/{id}', function ($id, Request $request) use ($app) {

    $area =  $app['paris']->getModel('Area')->find_one($id);
    if (!$area) {
        $app->abort(404, "Area not found");
    }
    $area->set($request->request->all());
    $area->save();

    return new Response(json_encode($area->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/areas/{id}', function ($id) use ($app) {
    $area =  $app['paris']->getModel('Area')->find_one($id);
    if (!$area) {
        $app->abort(404, "Area not found");
    }
    $area->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>