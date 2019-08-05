<?php

    header("Content-type: application/json; charset=utf-8");
    header("Access-Control-Allow-Origin: *");
    libxml_use_internal_errors (true);

    $scheduleURL = $_GET["url"];

    $dom = new DOMDocument();
    $dom->loadHTMLFile($scheduleURL);
    $finder = new DomXPath($dom);

    $table = $finder->query('//table[@class="tabela"]');
    $rows = $table->item(0)->getElementsByTagName("tr");

    $numberToDay = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    $lessons = [];
    $lessons["monday"] = [];
    $lessons["tuesday"] = [];
    $lessons["wednesday"] = [];
    $lessons["thursday"] = [];
    $lessons["friday"] = [];

    for($i = 1; $i < $rows->length; $i++) {
        $columns = $rows->item($i)->getElementsByTagName("td");

        $hour = str_replace(' ', '', $columns->item(1)->nodeValue);

        for($j = 2; $j < $columns->length; $j++) {
            $column = $columns->item($j);

            $cellLessons = [];

            if($column->childNodes->length > 1) {
                $inCellLessons = [];
                $index = 0;

                foreach($column->childNodes as $child) {
                    if($child->nodeName === "span") {
                        if($child->nodeValue[0] !== '#') {
                            $inCellLessons[$index]['activity'] = trim($child->nodeValue);
                            $index++;
                        }
                    }

                    if($child->nodeName === "#text") {
                        $inCellLessons[$index - 1]['activity'] .= trim($child->nodeValue);
                    }

                    if($child->nodeName === "a") {
                        $inCellLessons[$index - 1]['classroom'] = trim(substr($child->nodeValue, 0, strpos($child->nodeValue, '-')));
                    }
                }

                foreach($inCellLessons as &$lesson) {
                    
                }

                $lessons[$numberToDay[$j - 2]][$hour] = $inCellLessons;
            }
        }
    }

    echo json_encode($lessons, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);