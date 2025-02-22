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


/**
 * Define the function with a clear and descriptive name, and then call it from other functions or code blocks as needed
 *
 * @module     block_learnerscript/helper
 * @copyright  2023 Moodle India Information Solutions Private Limited
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery',
        'block_learnerscript/ajax',
        'block_learnerscript/ajaxforms',
        'core/str',
        'core/modal_factory',
        'core/modal_events',
        'core/ajax',
        'core/notification',
        'block_learnerscript/bootstrapnotify/bootstrapnotify',
        'block_learnerscript/smartfilter',
    ],
    function($, ajax, AjaxForms, Str, ModalFactory, ModalEvents, Ajax, notification, bootstrapnotify, smartfilter) {
        var helper = {
            rolepermissions: function() {
                $('.rolepermissionsform').change(function(e) {
                    var contextlevel = e.target.value;
                    var reportid = $(this).data('reportid');
                    require(['block_learnerscript/helper'], function(report) {
                        helper.rolesforcontext(contextlevel, reportid);
                    });
                });
            },
            sendmessage: function(args, username) {
                    Str.get_strings([{
                    key: 'sendmessage',
                    component: 'block_learnerscript'
                }, {
                    key: 'messageconfirmation',
                    component: 'block_learnerscript'
                }, {
                    key: 'messagesent',
                    component: 'block_learnerscript'
                }, {
                    key: 'supplyvalue',
                    component: 'block_learnerscript'
                }, {
                    key: 'messagesending',
                    component: 'block_learnerscript'
                }, {
                    key: 'close',
                    component: 'block_learnerscript'
                }, {
                    key: 'submit',
                    component: 'moodle'
                }]).then(function(s) {
                var userid = args.userid;
                var reportinstance = args.reportinstance;
                var formid = "form_sendsms" + userid;
                var container = $("#sendsms_" + reportinstance + '_' + userid).parents('table');
                if ($('#ls_sendsms_' + reportinstance + '_' + userid).length < 1) {
                    $("#sendsms_" + reportinstance + '_' + userid).append('<div id="ls_sendsms_' + reportinstance + '_' +
                    userid + '" class="sendmessage"><div class="messageloading"></div><form id="' + formid +
                    '" ><textarea id="text_' + formid +
                    '" type="text" name="message"></textarea><input type="submit" value = "' + s[6] + '"></form></div>');
                }
                var dlg = $('#ls_sendsms_' + reportinstance + '_' + userid).dialog({
                    resizable: true,
                    autoOpen: false,
                    width: "20%",
                    title: s[0],
                    modal: false,
                    dialogClass: 'sendsmsdialog',
                    show: {
                        effect: "slide",
                        duration: 1000
                    },
                    position: {
                        my: "left",
                        at: "right",
                        of: "#sendsms_" + reportinstance + '_' + userid,
                        within: container
                    },
                    open: function() {
                        $(this).closest(".ui-dialog")
                            .find(".ui-dialog-titlebar-close")
                            .removeClass("ui-dialog-titlebar-close")
                            .html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick'></span>");
                            var Closebutton = $('.ui-icon-closethick').parent();
                            $(Closebutton).attr({
                                "title": s[5]
                            });
                        $(".sendmessage").not(this).each(function() {
                            $(this).remove();
                        });
                    },
                    close: function() {
                        $(this).dialog('destroy').remove();
                    }
                });
                dlg.dialog("open");
                $("#" + formid).submit(function(e) {
                    e.preventDefault();
                    var helper = require('block_learnerscript/helper');
                    var emptymessage = document.getElementById("text_" + formid).value;
                    if (!emptymessage) {
                        $('.messageloading').html('<div class="alert alert-danger">' + s[3] + '</div>');
                    } else {
                        var url = require('core/url');
                        $('.messageloading').html('<center><img src="' + url.imageUrl("loader", "block_learnerscript") +
                        '" alt="' + s[4] + '" title="' + s[4] + '"/></center>');
                        $("#" + formid).hide();
                        var promise = Ajax.call([{
                            methodname: 'core_message_send_instant_messages',
                            args: {
                                messages: [{
                                    touserid: args.userid,
                                    text: $("#" + formid).serializeObject().message,
                                    textformat: 0
                                }]
                            }
                        }]);
                        promise[0].done(function() {
                            var message = s[2] + username;
                            helper.notifications(message);
                            dlg.dialog("close");
                        }).fail(function(ex) {
                            // Do something with the exception
                            $('.messageloading').html('<div class="alert alert-warning">' + ex.message + '</div>');
                        });
                    }
                });
                return 'true';
            }).fail();
            },
            ViewReportFilters: function(args) {
                $('.' + args.activefilter).toggleClass("show");
                $('.' + args.inactivefilter).removeClass("show");
            },
            deleteConfirm: function(args) {
                return Str.get_strings([{
                    key: 'deleteconfirmation',
                    component: 'block_learnerscript'
                }, {
                    key: 'deleteallconfirm',
                    component: 'block_learnerscript'
                }, {
                    key: 'confirm',
                    component: 'block_learnerscript'
                }, {
                    key: 'close',
                    component: 'block_learnerscript'
                }]).then(function(s) {
                    ModalFactory.create({
                        title: s[0],
                        type: ModalFactory.types.SAVE_CANCEL,
                        body: s[1]
                    }).done(function(modal) {
                        this.modal = modal;
                        modal.setSaveButtonText(s[2]);
                        modal.getRoot().on(ModalEvents.save, function(e) {
                            e.preventDefault();
                            var helper = require('block_learnerscript/helper');
                            var promise = Ajax.call([{
                                methodname: 'block_learnerscript_' + args.action,
                                args: args
                            }]);
                            promise[0].done(function() {
                                $('.plotgraphcontainer').removeClass('show').addClass('hide');
                                $('#plotreportcontainer' + args.reportid).html('');
                                var tabdata = $('#' + args.cid).attr('aria-controls');
                                $("[data-cid='" + args.cid + "']").remove();
                                $('#' + tabdata).remove();
                                if ($("#report_plottabs li:eq(0) a").length < 1) {
                                    $('#report_plottabs').remove();
                                }

                                helper.notifications(s[2]);
                            }).fail();
                            modal.hide();
                            modal.destroy();
                        });
                        modal.show();
                        $('.modal-header button.close').attr('title', s[3]);
                    }.bind(this));
                }.bind(this));
            },
            validatebasicform: function(validate) {
                var getreport = [];
                if (typeof validate == 'undefined') {
                    $.each($('.basicparamsform select'), function(index, value) {
                        var selectedval = $(value).val();
                        if (selectedval == 0) {
                            getreport.push(0);
                        }
                    });
                }
                return getreport;
            },
            Preview: function(args) {
                $(args.container).dialog({
                    dialogClass: 'previewpopup',
                    width: '95%',
                    modal: true,
                    position: {
                        my: 'center',
                        at: 'center',
                        within: '.ls_components'
                    },
                    close: function() {
                        $(this).dialog('destroy');
                    },
                    open: function() {
                        $(this).closest(".ui-dialog")
                            .find(".ui-dialog-titlebar-close")
                            .removeClass("ui-dialog-titlebar-close")
                            .html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick'></span>");
                        var Closebutton = $('.ui-icon-closethick').parent();
                        Str.get_string('close', 'block_learnerscript').then(function(s){
                            $(Closebutton).attr({
                                "title" : s
                            });
                        });
                    }
                });
            },
            /**
             * Central method for call Select2 with Ajax in reports module
             * @param {object} args Object with reportID and other required params
             */
            Select2Ajax: function(args) {
                $("select[data-select2-ajax='1']").each(function() {
                    var instanceid = $(this).data('instanceid');
                    var reportinstance = instanceid ? instanceid : args.reportid;
                    if (args.action == 'rolewiseusers') {
                        args.reportid = $(this).data('reportid');
                        args.courses = $('[name="filter_courses"]').val();
                    }
                    if (args.action === 'userlist') {
                        args.setminimuminputlength = 2;
                        args.courses = $('[name="filter_courses"]').val();
                    }
                    if (!$(this).hasClass('select2-hidden-accessible')) {
                        var $blockname;
                        var methodname2;
                        $(this).select2({
                            ajax: {
                                data: function(params) {
                                    var dataaction = $(this).data('action');
                                    if (dataaction == 'filterusers' || dataaction == 'filter_courses') {
                                        args.action = dataaction;
                                        args.basicparamdata = JSON.stringify(smartfilter.BasicparamsData(reportinstance));
                                        args.fiterdata = JSON.stringify(smartfilter.FilterData(reportinstance));
                                        args.reportinstanceid = instanceid;
                                        args.courses = $('[name="filter_courses"]').val();

                                    }
                                    if (args.action == 'rolewiseusers') {
                                        delete args.schuserslist;
                                        delete args.scheduleid;
                                        args.roleid = $("#id_role" + reportinstance).val();
                                        var roleid = args.roleid.split('_');
                                        args.roleid = roleid[0];
                                        args.contextlevel = roleid[1];
                                        args.courses = $('[name="filter_courses"]').val();

                                    }
                                    $.extend(params, args);
                                    methodname2 = args.action;
                                    if (methodname2 === 'userlist') {
                                        $blockname = 'block_reportdashboard_';
                                    } else {
                                        $blockname = 'block_learnerscript_';
                                    }

                                    return params;
                                },
                                transport: function(params, success) {
                                    var promise = Ajax.call([{
                                        methodname: $blockname + methodname2,
                                        args: params.data
                                    }]);
                                    promise[0].done(function(data) {
                                        data = $.parseJSON(data);
                                        success(data);
                                    });
                                    promise[0].fail(function() {
                                        // Do something with the exception
                                    });
                                },
                                processResults: function(data, params) {
                                    // Parse the results into the format expected by Select2
                                    // since we are using custom formatting functions we do not need to
                                    // alter the remote JSON data, except to indicate that infinite
                                    // scrolling can be used
                                    params.page = params.page || 1;
                                    var pagination = false;
                                    if (args.action === 'userlist' || args.action == 'filter_courses'
                                    || args.action == 'filterusers') {
                                        pagination = false;
                                    } else {
                                        pagination = (params.page * 10) < data.total_count;
                                    }
                                    return {
                                        results: data.items,
                                        pagination: {
                                                more: pagination
                                        }
                                    };
                                }
                            },
                            escapeMarkup: function(markup) {
                                return markup;
                            }, // Let our custom formatter work
                            minimumInputLength: args.setminimuminputlength || 1,
                            maximumselectionlength: args.maximumselectionlength,
                            language: {
                                // You can find all of the options in the language files provided in the
                                // build. They all must be functions that return the string that should be
                                // displayed.
                                maximumSelected: function(params) {
                                    if (args.action == 'rolewiseusers') {
                                        args.roleid = $("#id_role" + reportinstance).val();
                                        args.schuserslist = $('#schuserslist' + reportinstance).val();
                                        args.scheduleid = $("#scheduleid").val() || -1;
                                        return "Click <a href='javascript:void(0);' class='seluser' id='addusers" + args.reportid + "' \
                                                     data-reportid=" + args.reportid + " data-scheduleid = " + args.scheduleid + " \
                        onclick = '(function(e){ require(\"block_learnerscript/schedule\").manageschusers(\
                                                     {reportinstance:" + reportinstance + ", reportid:" + args.reportid + ",scheduleid:" + args.scheduleid + ",selectedroleid:" + args.roleid + ",\
                                                     schuserslist:\"" + args.schuserslist + "\"}) })(event)' > here </a> to add more than " + params.maximum + " users.";
                                    } else if (args.action == 'filter_courses' || args.action == 'filterusers') {
                                        return 'You can select only 5 values';
                                    }
                                }
                            },
                            templateResult: function formatRepo(repo) {
                                var markup;
                                    if (repo.loading) {
                                        return repo.text || Str.get_string('value_not_supported', 'block_learnerscript');
                                    }
                                    markup = repo.text || Str.get_string('value_not_supported', 'block_learnerscript');

                                return markup;
                            }, // Omitted for brevity, see the source of this page
                            templateSelection: function formatRepoSelection(repo) {
                                var markup;
                                if (repo.id == -1 && args.action == 'rolewiseusers') {
                                    var reportid = repo.element.form.dataset.reportid || 0;
                                    var scheduleid = repo.element.form.dataset.scheduleid || -1;
                                    markup = "<a href='javascript:void(0)' class='viewschusers'" +
                                        "onclick='(function(e){ require(\"block_learnerscript/schedule\").viewschusers(" +
                                        "{reportid:" + reportid + ",scheduleid:" + scheduleid + ", reportinstance:" +
                                        reportinstance + "}) })(event);'>" + repo.text + "</a>";
                                } else {
                                    markup = repo.text;
                                }
                                return markup;
                            } // Omitted for brevity, see the source of this page
                        }).on('select2:select', function() {
                            if (args.action == 'reportlist') {
                                var reportid = $(this).val();
                                window.location = M.cfg.wwwroot + '/blocks/learnerscript/viewreport.php?id=' + reportid;
                            }
                        });
                    }
                });
            },
            getQueryParameters: function(str) {
                return (str || document.location.search).replace(/(\?)/, '&').split("&").map(function(n) {
                    n = n.split("=");
                    this[n[0]] = n[1];
                    return this;
                }.bind({}))[0];
            },
            DrilldownReport: function() {
                var self = this;
                // Drill down report
                $('td a').click(function(e) {
                    var url = $(this).attr('href');
                    var drillurl = self.getQueryParameters(url);
                    if (url.indexOf('viewreport.php') <= 0 || "download" in drillurl) {
                        return;
                    }
                    e.preventDefault();
                    self.ReportModelFromLink({container: $(this), url: url});

                });
            },
            ReportModelFromLink: function(args) {
                var tableid = args.container.parents().closest('table').attr('id');
                var tablewidth = $("#" + tableid + "").width();
                var drillurl = this.getQueryParameters(args.url);
                var reportid = parseInt(drillurl.id);
                var filter = {};
                if (args.url.indexOf('viewreport.php') <= 0 || "download" in drillurl) {
                    return;
                }
                $.each(drillurl, function(key, val) {
                    if (key.indexOf('filter') >= 0) {
                        filter[key] = val;
                    }
                });
                if ($("#reportcontainer" + reportid).length == 0 || $("#plotreportcontainer" + reportid).length == 0) {
                    $('body').append('<div id="reportcontainer' + reportid + '" style="display:none;"></div>');
                    $('body').append('<div id="plotreportcontainer' + reportid +
                    '" class="dialogplot" style="display:none;"></div>');
                    var promise = ajax.call({
                        args: {
                            action: 'disablecolumnstatus',
                            reportid: reportid
                        },
                        url: M.cfg.wwwroot + "/blocks/learnerscript/ajax.php",
                    });
                    var dialogid;
                    promise.done(function(response) {
                        var reporttypes = response;
                        require(['block_learnerscript/reportwidget'], function(reportwidget) {
                            reportwidget.CreateDashboardwidget({
                                reportid: reportid,
                                reporttype: response,
                                basicparams: JSON.stringify(filter),
                                lsfstartdate: 0,
                                lsfenddate: $.now(),
                            });
                        });
                        if (reporttypes == 'table') {
                            dialogid = "reportcontainer";
                        } else {
                            dialogid = "plotreportcontainer";
                        }
                        var dlg = $("#" + dialogid + reportid + "").dialog({
                            resizable: true,
                            autoOpen: false,
                            dialogClass: "drilldown" + reportid,
                            width: tablewidth,
                            title: '',
                            appendTo: "#" + tableid,
                            modal: true,
                            position: {
                                my: "center",
                                at: "top",
                                of: "#" + tableid
                            },
                            open: function() {
                                Str.get_strings([{
                                    key: 'close',
                                    component: 'block_learnerscript'
                                },{
                                    key: 'viewmore',
                                    component: 'block_learnerscript'
                                }]).then(function(s){
                                    $(this).closest(".ui-dialog")
                                    .find(".ui-dialog-titlebar-close")
                                    .removeClass("ui-dialog-titlebar-close")
                                    .html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick'></span>");
                                    var Closebutton = $('.ui-icon-closethick').parent();
                                    $(Closebutton).attr({
                                        "title": s[0]
                                    });
                                    $(".drilldown" + reportid).append('<a href=' + args.url +
                                    '><span class="reportdashboard_right">' + s[1] + '</span></a>');
                                });

                            },
                            close: function() {
                                $(this).dialog('destroy').remove();
                            }
                        });
                        dlg.dialog("open").prev(".ui-dialog-titlebar").css("color", "#0C75B6");
                    });
                }
            },
            PlotForm: function(args) {
                Str.get_string('plot_graph', 'block_learnerscript').then(function(s){
                    var url = M.cfg.wwwroot + '/blocks/learnerscript/ajax.php';
                    args.title = (!args.title) ? s : args.title;
                    AjaxForms.init(args, url);
                });
            },
            reportCalculations: function(args) {
                Str.get_string('calcs','block_learnerscript').then(function(s) {
                var dlg = $(".reportcalculation" + args.reportid).dialog({
                    dialogClass: 'calculationspopup',
                    resizable: false,
                    autoOpen: false,
                    width: "50%",
                    title: s,
                    modal: true,
                    position: {
                        my: "center",
                        at: "center",
                        of: window
                    },
                    open: function() {
                        $(".reportcalculation" + args.reportid).append('<img src="' +
                        M.util.image_url('loading', 'block_learnerscript') + '" id="loadingimage" />');
                        $(document).ajaxStop(function() {
                            $("#loadingimage").remove();
                        });
                        $(this).closest(".ui-dialog").find(".ui-dialog-titlebar-close")
                            .removeClass("ui-dialog-titlebar-close")
                            .html("<span class='ui-button-icon-primary ui-icon ui-icon-closethick'></span>");
                            var Closebutton = $('.ui-icon-closethick').parent();
                            $(Closebutton).attr({
                                "title" : "Close"
                            });
                        $(this).closest(".ui-dialog").find('.ui-dialog-title')
                            .html('Calculations');
                    }

                });
                args.filters = smartfilter.FilterData(args.reportid);
                args.filters['lsfstartdate'] = $('#lsfstartdate').val();
                args.filters['lsfenddate'] = $('#lsfenddate').val();
                if (typeof args.filters['filter_courses'] == 'undefined') {
                    var filter_courses = $('#ls_courseid').val();
                    if (filter_courses != 1) {
                        args.filters['filter_courses'] = filter_courses;
                    }
                }
                args.filters = JSON.stringify(args.filters);

                args.action = 'reportcalculations';

                args.basicparams = args.basicparams || JSON.stringify(smartfilter.BasicparamsData(args.reportid));
                var promise = ajax.call({
                    args: args,
                    url: M.cfg.wwwroot + "/blocks/learnerscript/ajax.php"
                });
                promise.done(function(response) {
                    $(".reportcalculation" + args.reportid).closest(".ui-dialog").find('.ui-dialog-title')
                        .html(response.reportname + ' : Calculations');
                    $(".reportcalculation" + args.reportid).html(response.table);
                }).fail(function() {
                });
                dlg.dialog("open");
                }.bind(this));
            },
            dropdown: function(child) {
                $('#' + child).toggle();
            },
            notifications: function(elements, notifytype) {
                notifytype = notifytype || 'success';
                $.notify({
                    message: elements
                }, {
                    type: notifytype
                }
                );
            },
            tabsdraggable: function() {
                $( ".ls-plotgraphs_list" ).sortable({
                    cursor: 'move',
                    axis: 'y',
                    update: function () {
                        var elementsorder = $('.ls-plotgraphs_list').sortable('toArray', {attribute: 'data-cid'}).toString();
                        ajax.call({
                            args: {
                                action: 'tabsposition',
                                reportid: $('.ls-plotgraphs_list').data('reportid'),
                                component: 'plot',
                                elementsorder: elementsorder
                            },
                            url: M.cfg.wwwroot + "/blocks/learnerscript/ajax.php"
                        });
                    }
                });
            },
            rolesforcontext: function(contextlevel, reportid) {
                var promise = ajax.call({
                    args: {
                        action: 'contextroles',
                        contextlevel: contextlevel,
                        reportid: reportid
                    },
                    url: M.cfg.wwwroot + "/blocks/learnerscript/ajax.php",
                });
                promise.done(function(response) {
                    var template = '';
                    $.each(response, function(key, value) {
                        template += '<option value = ' + key + '>' + value + '</option>';
                    });
                    $("#id_roleid").find('option').remove().end().append(template);
                });
            }
        };
        return helper;
    });
