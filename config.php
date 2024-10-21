<?php
unset($CFG);
global $CFG;
$CFG = new stdClass();

$CFG->dbtype    = 'mysqli';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'localhost';
$CFG->dbname    = 'ls_44';
// $CFG->dbname    = 'moodle41_fhc';
$CFG->dbuser    = 'root';
$CFG->dbpass    = 'Venu@5599';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbport' => '',
  'dbsocket' => '',
  'dbcollation' => 'utf8mb4_unicode_ci',
);

$CFG->wwwroot   = 'http://localhost/ls44_contribute';
$CFG->dataroot  = '/var/www/ls_44';
$CFG->admin     = 'admin';

$CFG->directorypermissions = 0777;
// $CFG->debug = (E_ALL | E_STRICT);   // === DEBUG_DEVELOPER - NOT FOR PRODUCTION SERVERS!
// $CFG->debugdisplay = 1;             // NOT FOR PRODUCTION SERVERS!
require_once(__DIR__ . '/lib/setup.php');

// There is no php closing tag in this file,
// it is intentional because it prevents trailing whitespace problems!