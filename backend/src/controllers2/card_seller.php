<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/card_sellers', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('CardSeller');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $card_sellers =  $query->find_array();

    return new Response(json_encode($card_sellers), 200, array('Content-Type' => 'application/json'));
});

$app->get('/card_sellers/{id}', function ($id) use ($app) {

    $card_seller =  $app['paris']->getModel('CardSeller')->find_one($id);
    if (!$card_seller) {
        $app->abort(404, "CardSeller not found");
    }

    return new Response(json_encode($card_seller->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/card_sellers', function (Request $request) use ($app) {

    $card_seller =  $app['paris']->getModel('CardSeller')->create();
    $data = $request->request->all();
    $card_seller->set($data);

    if (!$card_seller->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($card_seller->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/card_sellers/{id}', function ($id, Request $request) use ($app) {

    $card_seller =  $app['paris']->getModel('CardSeller')->find_one($id);
    if (!$card_seller) {
        $app->abort(404, "CardSeller not found");
    }
    $card_seller->set($request->request->all());
    $card_seller->save();

    return new Response(json_encode($card_seller->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/card_sellers/{id}', function ($id) use ($app) {
    $card_seller =  $app['paris']->getModel('CardSeller')->find_one($id);
    if (!$card_seller) {
        $app->abort(404, "CardSeller not found");
    }
    $card_seller->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>