<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/users', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('User');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $users =  $query->find_array();

    return new Response(json_encode($users), 200, array('Content-Type' => 'application/json'));
});

$app->get('/users/{id}', function ($id) use ($app) {

    $user =  $app['paris']->getModel('User')->find_one($id);
    if (!$user) {
        $app->abort(404, "User not found");
    }

    return new Response(json_encode($user->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/users', function (Request $request) use ($app) {

    $user =  $app['paris']->getModel('User')->create();
    $data = $request->request->all();
    $user->set($data);

    if (!$user->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($user->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/users/{id}', function ($id, Request $request) use ($app) {

    $user =  $app['paris']->getModel('User')->find_one($id);
    if (!$user) {
        $app->abort(404, "User not found");
    }
    $user->set($request->request->all());
    $user->save();

    return new Response(json_encode($user->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/users/{id}', function ($id) use ($app) {
    $user =  $app['paris']->getModel('User')->find_one($id);
    if (!$user) {
        $app->abort(404, "User not found");
    }
    $user->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>