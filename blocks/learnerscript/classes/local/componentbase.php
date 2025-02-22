<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

namespace block_learnerscript\local;

/**
 * A Moodle block to create customizable reports.
 *
 * @package   block_learnerscript
 * @copyright 2023 Moodle India Information Solutions Private Limited
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class componentbase {

    /** @var stdClass $config  */
    public $config;

    /**
     * Constructor.
     *
     * @param object $report Report data
     */
    public function __construct($report) {
        global $DB;

        if (is_numeric($report)) {
            $this->config = $DB->get_record('block_learnerscript', ['id' => $report]);
        } else {
            $this->config = $report;
        }
    }

    /**
     * Add form elements
     *
     * @param  object $mform    Report form
     * @param  object $fullform Form
     * @return bool
     */
    public function add_form_elements(&$mform, $fullform) {
        return false;
    }

}
