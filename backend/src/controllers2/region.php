<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/regions', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('Region');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $regions =  $query->find_array();

    return new Response(json_encode($regions), 200, array('Content-Type' => 'application/json'));
});

$app->get('/regions/{id}', function ($id) use ($app) {

    $region =  $app['paris']->getModel('Region')->find_one($id);
    if (!$region) {
        $app->abort(404, "Region not found");
    }

    return new Response(json_encode($region->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/regions', function (Request $request) use ($app) {

    $region =  $app['paris']->getModel('Region')->create();
    $data = $request->request->all();
    $region->set($data);

    if (!$region->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($region->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/regions/{id}', function ($id, Request $request) use ($app) {

    $region =  $app['paris']->getModel('Region')->find_one($id);
    if (!$region) {
        $app->abort(404, "Region not found");
    }
    $region->set($request->request->all());
    $region->save();

    return new Response(json_encode($region->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/regions/{id}', function ($id) use ($app) {
    $region =  $app['paris']->getModel('Region')->find_one($id);
    if (!$region) {
        $app->abort(404, "Region not found");
    }
    $region->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>