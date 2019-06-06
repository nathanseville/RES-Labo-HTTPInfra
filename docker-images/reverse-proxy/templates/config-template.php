<?php
    $dynamics = explode(",", getenv('DYNAMIC_APP'));
    $statics = explode(",", getenv('STATIC_APP'));
?>

<VirtualHost *:80>
    ServerName lab.res.ch

    <Proxy balancer://dynamic-cluster>

    <?php foreach($dynamics as $dynamic): ?>
        BalancerMember 'http://<?= $dynamic ?>'
    <?php endforeach; ?>

    </Proxy>

    <Proxy balancer://static-cluster>

    <?php foreach($statics as $static): ?>
        BalancerMember 'http://<?= $static ?>'
    <?php endforeach; ?>

    </Proxy>

    ProxyPreserveHost On

    ProxyPass '/api/trains/' 'balancer://dynamic-cluster/'
    ProxyPassReverse '/api/trains/' 'balancer://dynamic-cluster/'

    ProxyPass '/' 'balancer://static-cluster/'
    ProxyPassReverse '/' 'balancer://static-cluster/'
</VirtualHost>