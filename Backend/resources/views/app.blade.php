<!DOCTYPE html>
<<<<<<< HEAD
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VC1 Trip Booking</title>
    @vite('resources/js/app.jsx')
    @inertiaHead
  </head>
  <body class="font-sans antialiased">
    @inertia
  </body>
=======
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Trip Booking App</title>

    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
>>>>>>> Bugfix-Auth
</html>
