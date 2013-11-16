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




$app->post('/stations/upload', function () use ($app) {
    $model = $app['paris']->getModel('UploadSession');
    $modelArea = $app['paris']->getModel('Area');
    $modelRegion = $app['paris']->getModel('Region');
    $upload =  $model->create();
    $upload->file_type = 'station';
    $upload->save();

    $request = $app['request'];

    if ($request->getMethod() == 'POST') {
        $fuels = $app['paris']->getModel('Fuel')->find_many();
        $acols = array();
        foreach($fuels as $f) {
            $col = ORM::for_table('fuel')->raw_query("SHOW COLUMNS IN station where Field='".$f->code."'")->find_array();
            if (!$col) {
                $acols[] = "ADD column ".$f->code." DOUBLE";
            }
        }
        if (count($acols) > 0) {
            ORM::get_db()->exec("ALTER TABLE station ".implode(",", $acols).";");
        }
        ORM::get_db()->beginTransaction();
        try {
            $file = $request->files->get("stations");
            $path = __DIR__.'/../../upload/';
            $filename = $upload->id . "-station.xls";
            $file->move($path,$filename);
            require_once __DIR__.'/../../vendor/php-excel-reader/excel_reader2.php';
            $data = new Spreadsheet_Excel_Reader($path.$filename);//, true, "windows-1251");
            $fields = array();
            $list = array();
            $station_added = 0;
            $station_modified = 0;
            $regions = array();


            for ($row=2; $row <= $data->rowcount(); $row++) {
                $cols = array();
                $cols["id"] = $data->val($row, 'B');
                if ( ! $cols["id"] ) {
                    continue;
                }
                $cols["addr"] = $data->val($row, 'E');
                $cols["brand"] = $data->val($row, 'F');
                $cols["services"] = $data->val($row, 'G');
                $cols["lat"] = $data->val($row, 'H');
                $cols["lon"] = $data->val($row, 'I');
                $list[] = $cols;

                //add areas and regions
                $region = $data->val($row, 'C');
                $area = $data->val($row, 'D');

                $region_rec = $app['paris']->getModel('Region')->where('name', $region)->find_one();
                if (!$region_rec) {
                    $region_rec = $app['paris']->getModel('Region')->create();
                    $region_rec->name = $region;
                    //$region_rec->updated_at = date('Y-m-d H:i:s');
                    //$region_rec->created_at = date('Y-m-d H:i:s');
                    $region_rec->save();
                }

                $area_rec = $app['paris']->getModel('Area')->where("region_id", $region_rec->id)->where("name", $area)->find_one();
                if (!$area_rec) {
                    $area_rec = $app['paris']->getModel('Area')->create();
                    $area_rec->region_id = $region_rec->id + 0;
                    $area_rec->name = $area;
                    //$area_rec->updated_at = date('Y-m-d H:i:s');
                    //$area_rec->created_at = date('Y-m-d H:i:s');
                    $area_rec->save();
                }
                $cols["area_id"] = $area_rec->id;

                for ($col=10; $col <= $data->colcount(); $col++) {
                    $fname = $data->val(1, $col);
                    if (!$fname) {
                        continue;
                    }
                    $fprice = $data->val($row, $col);
                    $fuel_rec = $app['paris']->getModel('Fuel')->where("name", $fname)->find_one();
                    if (!$fuel_rec) {
                        $app->abort(500, "Неизвестное горючее - $fname - проверьте таблицу типов горючего!");
                    }
                    if ($fprice && $fprice != "0") {
                        $cols[$fuel_rec->code] =  floatval($fprice);
                    } else {
                        $cols[$fuel_rec->code] =  null;
                    }
                }

                $station_rec = $app['paris']->getModel('Station')->find_one($cols["id"]);
                if (!$station_rec) {
                    $station_rec = $app['paris']->getModel('Station')->create();
                    $station_rec->set($cols);
                    //$station_rec->updated_at = date('Y-m-d H:i:s');
                    ///$station_rec->created_at = date('Y-m-d H:i:s');
                    $station_added++;
                    $station_rec->save();
                } else {
                    $rec_modified = 0;
                    foreach($cols as $field=>$value) {
                        if ($value !=  $station_rec->get($field)) {
                            $rec_modified = 1;
                            print "$field\n";
                            print_r($station_rec->as_array());
                            print_r($cols);

                            break;
                        }
                    }
                    if ($rec_modified) {
                        $station_rec->set($cols);
                        $station_rec->updated_at = date('Y-m-d H:i:s');
                        $station_rec->save();
                        $station_modified++;
                    }
                }
            }
            ORM::get_db()->commit();
        } catch (Exception $e) {
            ORM::get_db()->rollBack();
            $app->abort(500, $e->getMessage());
        }
    }

    $upload = $model->find_one($upload->id);
    return new Response(json_encode(array("added"=>$station_added, "modified"=>$station_modified)), 200, array('Content-Type' => 'application/json'));
});




?>