<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/fuels', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('Fuel');
    //$app->abort(404, "Fuel not found");
    if ($request->query->get("only_count")) {
        return new Response(json_encode(array(array("count"=>$query->count()))), 200, array('Content-Type' => 'application/json'));
    }
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $fuels =  $query->find_array();

    return new Response(json_encode($fuels), 200, array('Content-Type' => 'application/json'));
});


$app->get('/fuels/{id}', function ($id) use ($app) {

    $fuel =  $app['paris']->getModel('Fuel')->find_one($id);
    if (!$fuel) {
        $app->abort(404, "Fuel not found");
    }

    return new Response(json_encode($fuel->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/fuels', function (Request $request) use ($app) {

    $fuel =  $app['paris']->getModel('Fuel')->create();
    $data = $request->request->all();
    $fuel->set($data);

    if (!$fuel->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($fuel->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/fuels/{id}', function ($id, Request $request) use ($app) {

    $fuel =  $app['paris']->getModel('Fuel')->find_one($id);
    if (!$fuel) {
        $app->abort(404, "Fuel not found");
    }
    $fuel->set($request->request->all());
    $fuel->save();

    return new Response(json_encode($fuel->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/fuels/{id}', function ($id) use ($app) {
    $fuel =  $app['paris']->getModel('Fuel')->find_one($id);
    if (!$fuel) {
        $app->abort(404, "Fuel not found");
    }
    //$app->abort(500, "Can't delete");
    $fuel->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>