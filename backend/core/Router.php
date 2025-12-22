<?php

namespace Core;

class Router {
    private $routes = [];

    public function get($path, $callback) {
        $this->routes['GET'][$path] = $callback;
    }

    public function post($path, $callback) {
        $this->routes['POST'][$path] = $callback;
    }

    public function put($path, $callback) {
        $this->routes['PUT'][$path] = $callback;
    }

    public function delete($path, $callback) {
        $this->routes['DELETE'][$path] = $callback;
    }

    public function dispatch() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove trailing slashes for consistency
        $path = rtrim($path, '/');
        if ($path === '') $path = '/';

        if (isset($this->routes[$method][$path])) {
            $callback = $this->routes[$method][$path];
            
            if (is_callable($callback)) {
                call_user_func($callback);
            } elseif (is_array($callback) && count($callback) === 2) {
                $controller = new $callback[0]();
                $method = $callback[1];
                $controller->$method();
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found', 'path' => $path]);
        }
    }
}
