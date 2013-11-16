<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/<%= table %>s', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('<%= grunt.util._.classify(table) %>');
    if ($offset = $request->query->get("offset")) {
        $query->offset($offset);
    }
    if ($limit = $request->query->get("limit")) {
        $query->limit($limit);

    }
    $<%= table %>s =  $query->find_array();

    return new Response(json_encode($<%= table %>s), 200, array('Content-Type' => 'application/json'));
});

$app->get('/<%= table %>s/{id}', function ($id) use ($app) {

    $<%= table %> =  $app['paris']->getModel('<%= grunt.util._.classify(table) %>')->find_one($id);
    if (!$<%= table %>) {
        $app->abort(404, "<%= grunt.util._.classify(table) %> not found");
    }

    return new Response(json_encode($<%= table %>->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->post('/<%= table %>s', function (Request $request) use ($app) {

    $<%= table %> =  $app['paris']->getModel('<%= grunt.util._.classify(table) %>')->create();
    $data = $request->request->all();
    $<%= table %>->set($data);

    if (!$<%= table %>->save() ) {
        $app->abort(500, "Error saving");
    }

    return new Response(json_encode($<%= table %>->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->put('/<%= table %>s/{id}', function ($id, Request $request) use ($app) {

    $<%= table %> =  $app['paris']->getModel('<%= grunt.util._.classify(table) %>')->find_one($id);
    if (!$<%= table %>) {
        $app->abort(404, "<%= grunt.util._.classify(table) %> not found");
    }
    $<%= table %>->set($request->request->all());
    $<%= table %>->save();

    return new Response(json_encode($<%= table %>->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->delete('/<%= table %>s/{id}', function ($id) use ($app) {
    $<%= table %> =  $app['paris']->getModel('<%= grunt.util._.classify(table) %>')->find_one($id);
    if (!$<%= table %>) {
        $app->abort(404, "<%= grunt.util._.classify(table) %> not found");
    }
    $<%= table %>->delete();

    return new Response(json_encode(array("message"=>"Deleted")), 204, array('Content-Type' => 'application/json'));
});




?>