<?php

require_once __DIR__.'/../vendor/autoload.php';

require_once __DIR__.'/../vendor/j4mie/idiorm/idiorm.php';
require_once __DIR__.'/../vendor/j4mie/paris/paris.php';

require_once __DIR__.'/../app/models/model.php';
$app = new Silex\Application();
$app["debug"] = true;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Silex\Provider\MonologServiceProvider;
use Silex\ServiceProviderInterface;

ORM::configure('mysql:host=localhost;dbname=avias');
ORM::configure('username', 'root');
ORM::configure('password', 'root123');
ORM::configure('logging', true);



class ParisServiceProvider implements ServiceProviderInterface
{
    public function boot(\Silex\Application $app) {

    }
    public function register(\Silex\Application $app)
    {
        $app['paris'] = $app->share(function () use ($app) {
            \ORM::configure($app['paris.dsn']);
            \ORM::configure('username', $app['paris.username']);
            \ORM::configure('password', $app['paris.password']);
            \ORM::configure('logging', true );
            \ORM::configure('driver_options', array(
                \PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
            ));

            return new ParisWrapper();
        });
    }
}

class ParisWrapper
{
    public function getModel($modelName)
    {
        return \Model::factory($modelName);
    }

    public function getLastQuery()
    {
        return \ORM::get_last_query();
    }

    public function getQueryLog()
    {
        return \ORM::get_query_log();
    }
}



$app->register(new ParisServiceProvider(), array(
    'paris.dsn'      => 'mysql:host=localhost;dbname=avias',
    'paris.username' => 'root',
    'paris.password' => 'root123'
));

$app->error(function(\Exception $e, $code){
    $message = $e->getMessage();
    if ($e->getCode() == 444) {
        return new Response(json_encode(array("error"=>"Ошибка", "fields"=>json_decode($e->getMessage()), "code"=>500)), $code, array('Content-Type' => 'application/json'));
    }
    switch($code){
        case 400:
            $message='Bad request.';
            break;
        case 404:
            $message1 = 'Page not found.';
            break;
        default:
            $message='Internal Server Error. Message: ' . $e->getMessage();
    }
    return new Response(json_encode(array("error"=>$message, "code"=>$code)), $code, array('Content-Type' => 'application/json'));
    //return new Response($message,$code);
});

$app['debug']=true;



$app->before(function(Request $request) use ($app)
{
    //echo ;
    $path = $request->getPathInfo();
    if (preg_match("/^\\/api\\//", $path)) {
        return;
    }
    $users = array(
        'workflow' => 'password'
    );
    if (!isset($_SERVER['PHP_AUTH_USER']) || $users[$_SERVER['PHP_AUTH_USER']] !== $_SERVER['PHP_AUTH_PW'])
    {
        header('WWW-Authenticate: Basic realm="Avias backend"');
        return $app->json(array('error' => 'Not Authorised'), 401);
    }
    /*
    else
    {
        //once the user has provided some details, check them

        if()
        {
            //If the password for this user is not correct then resond as such
            return $app->json(array('error' => 'Forbidden'), 403);
        }

        //If everything is fine then the application will carry on as normal
    }*/
});


use Symfony\Component\HttpFoundation\ParameterBag;

$app->before(function (Request $request) {
    if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
        $data = json_decode($request->getContent(), true);
        $request->request = new ParameterBag(is_array($data) ? $data : array());
    }
    // $request->headers->get('Content-Type');
});

require_once __DIR__.'/../src/controllers/user.php';
require_once __DIR__.'/../src/controllers/service.php';
require_once __DIR__.'/../src/controllers/area.php';
require_once __DIR__.'/../src/controllers/fuel.php';
require_once __DIR__.'/../src/controllers/region.php';
require_once __DIR__.'/../src/controllers/card_seller.php';
require_once __DIR__.'/../src/controllers/station.php';
require_once __DIR__.'/../src/controllers/wholesaler.php';
require_once __DIR__.'/../src/controllers/open_api.php';

$app->run();
