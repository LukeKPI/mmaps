<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/services', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('Service');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $services =  $query->find_array();

    return new Response(json_encode($services), 200, array('Content-Type' => 'application/json'));
});

$app->get('/services/{id}', function ($id) use ($app) {

    $service =  $app['paris']->getModel('Service')->find_one($id);
    if (!$service) {
        $app->abort(404, "Service not found");
    }

    return new Response(json_encode($service->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/services', function (Request $request) use ($app) {

    $service =  $app['paris']->getModel('Service')->create();
    $data = $request->request->all();
    $service->set($data);

    if (!$service->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($service->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/services/{id}', function ($id, Request $request) use ($app) {

    $service =  $app['paris']->getModel('Service')->find_one($id);
    if (!$service) {
        $app->abort(404, "Service not found");
    }
    $service->set($request->request->all());
    $service->save();

    return new Response(json_encode($service->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/services/{id}', function ($id) use ($app) {
    $service =  $app['paris']->getModel('Service')->find_one($id);
    if (!$service) {
        $app->abort(404, "Service not found");
    }
    $service->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>