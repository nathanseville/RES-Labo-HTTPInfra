<?php
    $dynamics = explode(",", getenv('DYNAMIC_APP'));
    $statics = explode(",", getenv('STATIC_APP'));
?>

<VirtualHost *:80>
    ServerName lab.res.ch

    Header add Set-Cookie "ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED

    <Proxy balancer://dynamic-cluster>

    <?php foreach($dynamics as $dynamic): ?>
        BalancerMember 'http://<?= $dynamic ?>'
    <?php endforeach; ?>

    </Proxy>

    <Proxy balancer://static-cluster>

    <?php foreach($statics as $i => $static): ?>
        BalancerMember 'http://<?= $static ?>' route=static-<?= $i ?>
        
    <?php endforeach; ?>

    </Proxy>

    ProxyPreserveHost On

    ProxyPass '/api/trains/' 'balancer://dynamic-cluster/'
    ProxyPassReverse '/api/trains/' 'balancer://dynamic-cluster/'

    ProxyPass '/' 'balancer://static-cluster/' stickysession=ROUTEID
    ProxyPassReverse '/' 'balancer://static-cluster/'
</VirtualHost>