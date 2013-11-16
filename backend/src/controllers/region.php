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

$app->post('/regions/upload', function () use ($app) {
    $model = $app['paris']->getModel('UploadSession');
    $modelArea = $app['paris']->getModel('Area');
    $modelRegion = $app['paris']->getModel('Region');
    $upload =  $model->create();
    $upload->file_type = 'region';
    $upload->save();

    $request = $app['request'];

    if ($request->getMethod() == 'POST') {
        $fuels = $app['paris']->getModel('Fuel')->find_many();
        $acols = array();
        foreach($fuels as $f) {
            $col = ORM::for_table('fuel')->raw_query("SHOW COLUMNS IN region where Field='".$f->code."'")->find_array();
            if (!$col) {
                $acols[] = "ADD column ".$f->code." DOUBLE";
            }
        }
        if (count($acols) > 0) {
            ORM::get_db()->exec("ALTER TABLE station ".implode(",", $acols).";");
        }
        ORM::get_db()->beginTransaction();
        try {
            $file = $request->files->get("regions");
            $path = __DIR__.'/../../upload/';
            $filename = $upload->id . "-region.xls";
            $file->move($path,$filename);
            require_once __DIR__.'/../../vendor/php-excel-reader/excel_reader2.php';
            $data = new Spreadsheet_Excel_Reader($path.$filename);//, true, "windows-1251");
            $fields = array();
            $list = array();
            $region_added = 0;
            $region_modified = 0;
            $regions = array();


            for ($row=2; $row <= $data->rowcount(); $row++) {

                $region = $data->val($row, 'B');

                $region_rec = $app['paris']->getModel('Region')->where('name', $region)->find_one();
                if (!$region_rec) {
                    $region_rec = $app['paris']->getModel('Region')->create();
                    $region_rec->name = $region;
                    //$region_rec->updated_at = date('Y-m-d H:i:s');
                    //$region_rec->created_at = date('Y-m-d H:i:s');
                    $region_rec->save();
                }

                for ($col=3; $col <= $data->colcount(); $col++) {
                    $fname = $data->val(1, $col);
                    if (!$fname) {
                        continue;
                    }
                    $fprice = $data->raw($row, $col);
                    $fuel_rec = $app['paris']->getModel('Fuel')->where("name", $fname)->find_one();
                    if (!$fuel_rec) {
                        $app->abort(500, "Неизвестное горючее - $fname - проверьте таблицу типов горючего!");
                    }
                    if ($fprice && $fprice != "0") {
                        $cols[$fuel_rec->code] =  $fprice;
                    } else {
                        $cols[$fuel_rec->code] =  null;
                    }
                }

                $rec_modified = 0;
                foreach($cols as $field=>$value) {
                    if ($value !=  $region_rec->get($field)) {
                        $rec_modified = 1;

                        print "$field\n";
                        echo $region_rec->id;
                        print_r($region_rec->as_array());
                        print_r($cols);

                        break;
                    }
                }
                if ($rec_modified) {
                    $region_rec->set($cols);
                    $region_rec->updated_at = date('Y-m-d H:i:s');
                    $region_rec->save();
                    $region_modified++;
                }
            }
            ORM::get_db()->commit();
        } catch (Exception $e) {
            ORM::get_db()->rollBack();
            $app->abort(500, $e->getMessage());
        }
    }

    $upload = $model->find_one($upload->id);
    return new Response(json_encode(array("added"=>$region_added, "modified"=>$region_modified)), 200, array('Content-Type' => 'application/json'));
});



?>