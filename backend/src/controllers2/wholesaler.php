<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/wholesalers', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('Wholesaler');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $wholesalers =  $query->find_array();

    return new Response(json_encode($wholesalers), 200, array('Content-Type' => 'application/json'));
});

$app->get('/wholesalers/{id}', function ($id) use ($app) {

    $wholesaler =  $app['paris']->getModel('Wholesaler')->find_one($id);
    if (!$wholesaler) {
        $app->abort(404, "Wholesaler not found");
    }

    return new Response(json_encode($wholesaler->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/wholesalers', function (Request $request) use ($app) {

    $wholesaler =  $app['paris']->getModel('Wholesaler')->create();
    $data = $request->request->all();
    $wholesaler->set($data);

    if (!$wholesaler->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($wholesaler->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/wholesalers/{id}', function ($id, Request $request) use ($app) {

    $wholesaler =  $app['paris']->getModel('Wholesaler')->find_one($id);
    if (!$wholesaler) {
        $app->abort(404, "Wholesaler not found");
    }
    $wholesaler->set($request->request->all());
    $wholesaler->save();

    return new Response(json_encode($wholesaler->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/wholesalers/{id}', function ($id) use ($app) {
    $wholesaler =  $app['paris']->getModel('Wholesaler')->find_one($id);
    if (!$wholesaler) {
        $app->abort(404, "Wholesaler not found");
    }
    $wholesaler->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>