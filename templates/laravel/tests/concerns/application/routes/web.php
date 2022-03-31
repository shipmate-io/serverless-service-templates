<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function() {
    return view('welcome');
});

Route::get('/phpinfo', function () {
    return view('phpinfo');
});

Route::get('/log', function() {
    Log::error('Woops, something went wrong.');
    return response('Error logged');
});

Route::get('/job', function () {
    dispatch(fn () => Log::notice('Queued job executed.'));
    return response('Job queued');
});

Route::post('/image-upload', function (Request $request) {
    $imageUrl = $request->file('image')->store('', ['disk' => 'public']);
    return response(url("storage/{$imageUrl}"));
});
