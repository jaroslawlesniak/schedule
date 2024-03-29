<?php

    header("Content-type: application/json; charset=utf-8");
    header("Access-Control-Allow-Origin: *");
    libxml_use_internal_errors (true);

    $scheduleURL = "http://aslan.mech.pk.edu.pl/~podzial/stacjonarne/html/".$_GET["url"];

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
                            $inCellLessons[$index]['activity_name'] = trim($child->nodeValue);
                            $index++;
                        }
                    }

                    if($child->nodeName === "#text") {
                        $inCellLessons[$index - 1]['activity_name'] .= trim($child->nodeValue);
                    }

                    if($child->nodeName === "a") {
                        $classRoom = trim($child->nodeValue);

                        if(strpos($classRoom, "-") !== false) {
                            $classRoom = substr($child->nodeValue, 0, strpos($child->nodeValue, '-'));
                        }
                        $cellIndex = $index - 1;

                        if(strpos($classRoom, "Hala") !== false || strpos($classRoom, "Aerobik")) {
                            $cellIndex = $index - 2;
                        }
                        if($cellIndex < 0) {
                            $cellIndex = 0;
                        }

                        $inCellLessons[$cellIndex]['classroom'] = $classRoom;
                    }
                }

                foreach($inCellLessons as &$lesson) {
                    $lesson_week = substr($lesson['activity_name'], strpos($lesson['activity_name'], '-'));
                    if(strpos($lesson['activity_name'], '-') !== false) {
                        $lesson['activity'] = substr($lesson['activity_name'], 0, strpos($lesson['activity_name'], '-'));
                    } else {
                        $lesson['activity'] = $lesson['activity_name'];
                    }
                    
                    $lesson['odd_week'] = false;
                    $lesson['even_week'] = false;

                    if(strpos($lesson_week, "N")) {
                        $lesson['odd_week'] = true;
                    }
                    if(strpos($lesson_week, "P")) {
                        $lesson['even_week'] = true;
                    }

                    if(!$lesson['odd_week'] && !$lesson['even_week']) {
                        $lesson['odd_week'] = true;
                        $lesson['even_week'] = true;
                    }
                }

                $lessons[$numberToDay[$j - 2]][$hour] = $inCellLessons;
            }
        }
    }

    echo json_encode($lessons, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);