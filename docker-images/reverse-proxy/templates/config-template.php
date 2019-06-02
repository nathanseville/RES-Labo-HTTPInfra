<?php
    $dynamic = getenv('DYNAMIC_APP');
    $static = getenv('STATIC_APP');
?>
<VirtualHost *:80>
    ServerName lab.res.ch

    ProxyPass '/api/trains/' 'http://<?php print "$dynamic" ?>/'
    ProxyPassReverse '/api/trains/' 'http://<?php print "$dynamic" ?>/'

    ProxyPass '/' 'http://<?php print "$static" ?>/'
    ProxyPassReverse '/' 'http://<?php print "$static" ?>/'
</VirtualHost>