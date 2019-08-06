<?php 

    header("Content-type: application/json; charset=utf-8");
    header("Access-Control-Allow-Origin: *");
    libxml_use_internal_errors (true);

    $dom = new DOMDocument();
    $dom->loadHTMLFile("http://aslan.mech.pk.edu.pl/~podzial/stacjonarne/html/lista.html");
    $finder = new DomXPath($dom);

    $lessons = $finder->query('//div[@class="blk"]');
    $lessons = $lessons->item(0)->getElementsByTagName("a");

    $grades = [];

    foreach($lessons as $lesson) {
        $link = $lesson->getAttribute("href");
        $name = $lesson->nodeValue;
        $grades[] = ["name" => $name, "href" => $link];
    }

    echo json_encode($grades, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);