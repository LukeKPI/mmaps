<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Application;

$app->get('/api/get_all', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('Area');
    $areas =  $query->find_array();
    $query = $app['paris']->getModel('Region');
    $regions =  $query->find_array();
    $query = $app['paris']->getModel('Fuel');
    $fuels =  $query->find_array();
    $query = $app['paris']->getModel('CardSeller');
    $card_sellers =  $query->find_array();
    $query = $app['paris']->getModel('Station');
    $stations =  $query->find_array();
    $query = $app['paris']->getModel('Service');
    $services =  $query->find_array();
    $query = $app['paris']->getModel('Wholesaler');
    $wholesalers =  $query->find_array();

    return new Response(json_encode(array(
        "areas"=>$areas,
        "services"=>$services,
        "regions"=>$regions,
        "card_sellers"=>$card_sellers,
        "fuels" => $fuels,
        "stations"=>$stations,
        "wholesalers"=>$wholesalers,
    )), 200, array('Content-Type' => 'application/json'));
});

$app->get('/api/station_prices/{id}', function ($id) use ($app) {

    $station =  $app['paris']->getModel('Station')->find_one($id);
    if (!$station) {
        $app->abort(404, "Area not found");
    }
    return new Response(json_encode($station->as_array()), 200, array('Content-Type' => 'application/json'));
});

$app->get('/api/regions/{id}', function ($id) use ($app) {

    $region =  $app['paris']->getModel('Region')->find_one($id);
    if (!$region) {
        $app->abort(404, "Region not found");
    }

    return new Response(json_encode($region->as_array()), 200, array('Content-Type' => 'application/json'));
});


$app->get('/api/regions', function (Request $request) use ($app) {
    $query = $app['paris']->getModel('Region');
    return new Response(json_encode($regions), 200, array('Content-Type' => 'application/json'));
});


function sputcsv($row, $delimiter = ',', $enclosure = '"', $eol = "\n")
{
    static $fp = false;
    if ($fp === false)
    {
        $fp = fopen('php://temp', 'r+'); // see http://php.net/manual/en/wrappers.php.php - yes there are 2 '.php's on the end.
        // NB: anything you read/write to/from 'php://temp' is specific to this filehandle
    }
    else
    {
        rewind($fp);
    }

    if (fputcsv($fp, $row, $delimiter, $enclosure) === false)
    {
        return false;
    }

    rewind($fp);
    $csv = fgets($fp);

    if ($eol != PHP_EOL)
    {
        $csv = substr($csv, 0, (0 - strlen(PHP_EOL))) . $eol;
    }

    return $csv;
}

function array_to_CSV($data) {
    $first = 1;
    $result = "";
    foreach($data as $row) {
        if ($first) {
            $first = 0;
            $flds = array_keys($row);
            $result .= sputcsv($flds);
        }
        unset($row["updated_at"]);
        unset($row["created_at"]);
        $result .= sputcsv($row);
    }

    return $result;
}

$app->get('/api/update/{station_version}/{region_version}/{card_seller_version}/{wholesaler_version}/{fuel_version}/{area_version}/{service_version}', function ($station_version, $region_version, $card_seller_version, $wholesaler_version, $service_version, $fuel_version, $area_version,  Request $request) use ($app) {

    $status = $app['paris']->getModel('Status')->find_one(1);

    $result = array();

    if ($status->area > $area_version) {
        $query = $app['paris']->getModel('Area');
        $result["areas"] =  $query->find_array();
    }

    if ($status->region > $region_version) {
        $query = $app['paris']->getModel('Region');
        $result["regions"] =  $query->find_array();
    }
    if ($status->fuel > $fuel_version) {
        $query = $app['paris']->getModel('Fuel');
        $result["fuels"] =  $query->find_array();
    }
    if ($status->card_seller > $card_seller_version) {
        $query = $app['paris']->getModel('CardSeller');
        $result["card_sellers"] =  $query->find_array();
    }
    if ($status->station > $station_version) {
        $query = $app['paris']->getModel('Station');
        $result["stations"] =  $query->find_array();

    }
    if ($status->service > $service_version) {
        $query = $app['paris']->getModel('Service');
        $result["services"] =  $query->find_array();
    }
    if ($status->wholesaler > $wholesaler_version) {
        $query = $app['paris']->getModel('Wholesaler');
        $result["wholesalers"] =  $query->find_array();
    }
    $result["status"] = $status->as_array();


    return new Response(json_encode($result), 200, array('Content-Type' => 'application/json'));

});


?>