function build_grid(data, data_schedule, admin=false) {

	let main_date = $('#main_date').val();

	let mode = $('#lessons').is(":visible") ? 'lesson' : 'space';
	let target = (mode == 'lesson') ? '#lessons' : '#spaces';

	let is_mini = $(target).hasClass('mini_grid') ? true : false;

	let customer_grid = admin ? '' : $('#switch_grid').prop('dataset').intrac_customer_grid;

	let max_booking_date = '';
	let allowed_booking_days = [];
	let avail_days = [];
	let lesson_peak = '';

	let html_str = '';
	let space_ids = [];

	let start = '';
	let finish = '';
	let incr = 0;

	let hours = {};
	let hours_ro = {};

	$('.booking_details_div').remove();

	try {

		for (let a = 0; a < data.length; a++) {
			let d = data[a];

			if (!start || times_diff(start, d.hours.hours_start) > 0) {
				start = d.hours.hours_start;
			}

			if (!finish || times_diff(finish, d.hours.hours_finish) < 0) {
				finish = d.hours.hours_finish;
			}

						if (!incr || incr > d.intervals) {
				incr = d.intervals;
			}

			hours[d.location_id] = d.hours.data; 
			hours_ro[d.location_id] = d.hours_ro.data; 

			max_booking_date = d.max_booking_date;
			allowed_booking_days = d.allowed_booking_days;
			avail_days = d.avail_days;
			lesson_peak = d.lesson_peak;

			set_location_options(d);
		} 

		if (is_mini) {
			incr = 15;
		}

		if (!admin) {
			set_calendar_dates(max_booking_date, allowed_booking_days, avail_days);
		}

		let cur_time_rounded = dayjs().minute(Math.floor(dayjs().minute() / incr) * incr).second(0); 

		let y_slots = times_diff(finish, start)/incr;

		let styl = {
			table: '',
			thead: '',

		}

		html_str += '<div class="scroll-container scroll-container-flex noscrollbar grid_view">\
						<table class="table-fixed w-full sm:min-w-full border-collapse" data-intrac_interval="'+incr+'">';

		for (let i = -1; i < y_slots; i++) {

			let slot_start = dayjs(start,'HH:mm:ss').add(i*incr,'minute');
			let slot_end = dayjs(start,'HH:mm:ss').add((i+1)*incr,'minute');
			let past_box = (!admin && times_diff(dayjs(main_date+' '+slot_start.format('HH:mm:ss')), cur_time_rounded) < 0) ? ' past-box' : ''; 
			let mini_nonhr = (is_mini && slot_start.format('mm') != '00' && slot_start.format('mm') != '30' ? ' mini_nonhr' : '');

			if (i == -1) { 
				html_str += '<thead class="sticky top-0 z-50"><tr>\
								<th class="time-column-many"><div class="time-shadow-wrapper-title">Time</div></th>';
			} else { 
				html_str += '<tr style="height: var(--box_height)">\
								<td class="time-column-many"><div class="time-shadow-wrapper'+past_box+mini_nonhr+'">'+slot_start.format('h:mm a').toUpperCase()+'</div></td>';
			}

			for (let a = 0; a < data.length; a++) {
				let d = data[a];

				for (let n = 0; n < d.spaces.length; n++) {
					let space = d.spaces[n];

					let type_box = (mode == 'lesson') ? ' section-box-lesson' : ' section-box-space';
					space_ids.push(space.space_id);

					let space_row = '';

					if (i == -1) { 
						if (mode == 'lesson') {
							space_row += '<th class="courts-many">\
												<div class="flex justify-between">\
													<div class="flex gap-3 mw-0">\
														<img class="size-8 rounded-full" src="'+(space.image_data ? 'data:image/png;base64,'+space.image_data : 'images/avatar.png')+'" alt="">\
														<div class="flex flex-col text-start mw-0">\
															<span class="leading-normal text-[12px] truncate user_id" data-intrac="'+space.space_id+'" data-intrac_location_id="'+d.location_id+'">'+space.space_name+'</span>\
															<span class="leading-normal text-[10px] text-primary-btn">Instructor</span>\
														</div>\
													</div>\
												</div>\
											</th>'
						} else {
							space_row += '<th class="courts-many">\
												<span class="space_id'+(space.display == 2 ? ' read_only': '')+'" data-intrac="'+space.space_id+'" data-intrac_location_id="'+d.location_id+'">'+(space.category ? space.category+' - ' : '')+space.space_name+'</span>\
											</th>'
						}
					} else {
						space_row += '<td class="cell-many">';

			        	let empty_box = (!admin && isPeakSlot(d.location_id, slot_start) && (dayjs(slot_start,'HH:mm:ss').minute() !== 0) && !isPeakSlotAbandoned(dayjs(slot_start).format('HH:mm:ss'), space.space_id)) ? ' empty-box' : ''; 
			        	let na_box = ((times_diff(slot_start, d.hours.hours_start) < 0) || 
			        				  (times_diff(slot_start, d.hours.hours_finish) >= 0) || 
			        				  (!admin && times_diff(dayjs(main_date+' '+slot_start.format('HH:mm:ss')), cur_time_rounded) < 0)) ? ' gray-box' : ''; 
			        	let past_box = (!admin && times_diff(dayjs(main_date+' '+slot_start.format('HH:mm:ss')), cur_time_rounded) < 0) ? ' past-box' : ''; 
			        	let mini_nonhr = (is_mini && slot_start.format('mm') != '00' && slot_start.format('mm') != '30' ? ' mini_nonhr' : '');

			        	let stid = space.space_id+'_'+slot_start.format('HH-mm');

	        			let ro_box = ((space.display == 2) || (isReadOnlySlot(d.location_id, slot_start, slot_end))) ? ' ro-box' : ''; 

	        			let open = (empty_box+na_box+past_box+ro_box).length ? false : true;

					        space_row += '<div style="height: var(--section_box_height)" class="flex justify-end h-full relative rounded-md bg-transparent m-1 '+(open ? 'hover:shadow-sm' : 'shadow-sm')+' cursor section-box'+type_box+empty_box+ro_box+na_box+past_box+mini_nonhr+'" id="'+stid+'" data-intrac_location_id="'+d.location_id+'">\
												<div class="w-[98%] py-[2px] px-1.5 relative z-10 rounded-md border-l-[2px] shadow-sm p-6 flex flex-col items-start '+(open ? 'noshow' : '')+' section-box-inner">\
												 	<h3 class="flex items-center justify-between w-full leading-4">\
												    	<span class="truncate main_text has_right_icon">'+(open ? (is_mini ? '' : 'Book for ')+slot_start.format('h:mm a') : '')+'</span>\
												    	<div class="right_icon"></div>\
												    	<span class="schedule_id noshow"></span>\
												  	</h3>\
												  	<p class="text-gray leading-4 sub_text"></p>\
												</div>\
											</div>';

					    space_row += '</td>';
			        }

			        html_str += space_row;
				}		
			} 

			if (i == -1) { 
				html_str += '</tr></thead><tbody>'; 
			} else {
				html_str += '</tr>'; 
			}
		} 

		html_str += '</tbody></table></div>'; 

		let $tmp = $(html_str); 

		let $colgroup = $('<colgroup></colgroup>');

		$tmp.find('table:first thead tr th').each(function(index, th) {
		    let $th = $(th);
		    let $col = $('<col>');
		    if ($th.attr('class')) {
		        $col.attr('class', $th.attr('class'));
		    }
		    let loc_id = $th.find('.space_id').attr('data-intrac_location_id') || $th.find('.user_id').attr('data-intrac_location_id');
		    if (loc_id) {
		        $col.attr('data-intrac_location_id', loc_id);
		    }		    
		    $colgroup.append($col);
		});

		$tmp.find('table:first').prepend($colgroup);

		data_schedule = data_schedule.sort((a, b) => a.schedule_id - b.schedule_id);

		function applyScheduleIndex(n) {
			let schedule = data_schedule[n];

			if (admin && schedule.has_comment_ && schedule.display_name) {
				schedule.display_name = '?'+schedule.display_name;
			}

			let schedule_start = dayjs(schedule.schedule_start,'YYYY-MM-DD HH:mm:ss');
			let schedule_finish = dayjs(schedule.schedule_finish,'YYYY-MM-DD HH:mm:ss');

			let start_ = dayjs(main_date+' '+start);

			if (mode == 'lesson') {
				schedule.space_id = schedule.user_id;
			}

			let slot_start = schedule_start;
			let slot_i = times_diff(schedule_start, start_)/incr;

			if (!validator.isInt(slot_i.toString(),{min: 0})) {
				slot_i = Math.floor(slot_i);
				slot_start = dayjs(start_,'HH:mm:ss').add(slot_i*incr,'minute');
			}

			let y_slots = times_diff(schedule_finish, slot_start)/incr;

			for (let i = 0; i < y_slots; i++) {
				let stid = schedule.space_id+'_'+slot_start.add(i*incr,'minute').format('HH-mm');

				let $tmp_stid = $tmp.find('#'+stid);

				let stid_addClass = [];
				let stid_removeClass = ['empty-box'];

				let box_ = 'blocked';
				if (schedule.customer_id) {
					box_ = schedule.hold_id?'hold-box':'green-box';
				}

				if (admin && (schedule.receipt_type == 1)) {
					box_ += ' unpaid-box';
				}

				if (admin && (schedule.customer_id == 2) && (schedule.hold_id)) {
					box_ += ' reserved-box';
				}

				if (admin && (schedule.customer_id == 2) && (!schedule.hold_id)) {
					schedule.display_name = 'Closed';
					schedule.schedule_comment = 'closed';
				}

				if (admin && (schedule.customer_id > 2) && (!schedule.class_id) && (schedule.program_id) && (schedule.program_type == 1)) {
					box_ += ' termbooking-box';
				}

				if (admin && (schedule.customer_id > 2) && (!schedule.class_id) && (schedule.program_id) && (schedule.program_type == 2)) {
					box_ += ' permbooking-box';
				}

				stid_removeClass.push('hover:shadow-sm');
				stid_addClass.push('shadow-sm');
				stid_addClass.push(box_);

				stid_addClass.push('g_box');
				if (i == 0) {
					stid_addClass.push('t_box');
				}
				if (i == Math.ceil(y_slots-1)) {
					stid_addClass.push('b_box');
				}
				if ((!data_schedule[n+1]) ||
					(!((schedule.schedule_id == data_schedule[n+1].schedule_id) && (Math.abs(space_ids.indexOf(schedule.space_id) - space_ids.indexOf(data_schedule[n+1].space_id)) === 1))) ||
					(!schedule.schedule_id)) {
					stid_addClass.push('r_box');

					if (i == 0) {
						stid_addClass.push('tr_box');
					}
				}

				let left_box_stid = stid.replace(schedule.space_id, space_ids[space_ids.indexOf(schedule.space_id)-1]);

				if ($tmp.find('#'+left_box_stid+' .schedule_id').text() !== toString(schedule.schedule_id)) {
					stid_addClass.push('l_box');
				}

				if ((i == 0) && ($tmp.find('#'+left_box_stid+' .schedule_id').text() !== toString(schedule.schedule_id))) {
					if (schedule.customer_id && schedule.hold_id)  {
						if (admin) {
							$tmp.find('#'+stid+' .main_text').html('Reserved - click to cancel');
						} else {
							$tmp.find('#'+stid+' .main_text').html('Your selection - click to pay');
						}
					} else {
						if (schedule.display_name) {
							$tmp.find('#'+stid+' .main_text').html(schedule.display_name);
						} else {
							$tmp.find('#'+stid+' .main_text').html('Booked');
						}
					}
					$tmp.find('#'+stid+' .sub_text').html(schedule_start.format('h:mm a')+' – '+schedule_finish.format('h:mm a'));
				} else {
					$tmp.find('#'+stid+' .main_text').html(is_mini ? '&nbsp':'');
					$tmp.find('#'+stid+' .sub_text').html('');
				}
				$tmp.find('#'+stid+' .schedule_id').text(schedule.schedule_id || '');

				if (schedule.schedule_comment) {
					if ($tmp_stid.length) {
						$tmp_stid.prop('dataset').intrac_schedule_comment = schedule.schedule_comment.toLowerCase().substring(0, 30);
					}
				}

				if (schedule.customer_id && schedule.hold_id) {
					if ($tmp_stid.length) {
						$tmp_stid.prop('dataset').intrac_hold_id = schedule.hold_id;
					}

					if (!admin) {
						if (!check_hold_in_cart(schedule.hold_id)) {
							stid_addClass.push('blocked');
							if ($tmp.find('#'+stid+' .main_text').html()) {
								$tmp.find('#'+stid+' .main_text').html('Blocked. Click to cancel selection and start again');
							}
						}
					}
				}

				if (($('.admin-page').length) && (schedule.schedule_id > 0) && ($tmp_stid.length)) {
					$tmp_stid.prop('dataset').intrac_schedule_id = schedule.schedule_id;
					$tmp_stid.prop('dataset').intrac_pass_id = schedule.pass_id;
					$tmp_stid.prop('dataset').intrac_class_id = schedule.class_id;
					$tmp_stid.prop('dataset').intrac_level_id = schedule.level_id;
					$tmp_stid.prop('dataset').intrac_level_type = schedule.level_type;
					$tmp_stid.prop('dataset').intrac_program_id = schedule.program_id;
					$tmp_stid.prop('dataset').intrac_program_type = schedule.program_type||'';
					stid_addClass.push('booked-box');
					if (schedule.class_id > 0) {
						stid_addClass.push('modal_o_class');
					}
				}

				if (stid_removeClass.length) {
					$tmp_stid.removeClass(stid_removeClass.join(' '));
				}

				if (stid_addClass.length) {
					$tmp_stid.addClass(stid_addClass.join(' '));
				}
				$tmp.find('#'+stid+' .section-box-inner').removeClass('rounded-md border-l-[2px] noshow')
			}
		}

		function applySpaceScheduleData() {
			for (let n = 0; n < data_schedule.length; n++) {
				applyScheduleIndex(n);
			}
		}

		$(target).empty().append($tmp);

		$('#hours').text(encryptData(JSON.stringify(hours)));

		function runSpaceGridPostIntro() {
		if ($('#slot_id').val() && $('#slot_id').css('pointer-events') !== 'none') {
			$('#'+$('#slot_id').val()).click();
			$('#slot_id').val('0');
		}

		if ($('.admin-page').length) {
			if ($('.virtual_locations').is(":visible")) {
				virtual_location_filter_grid();
			}

			if (dayjs().format('YYYY-MM-DD') == $('#main_date').val()) {
				let el = findClosestPastSlot(target);

				if (el) {
				    $(target+' .scroll-container').animate({
				        scrollTop: $(el).offset().top - $(target+' .time-shadow-wrapper:first').offset().top
				    }, 0);
				}
			}
		}

		if ($('.customer-page').length) {
			if (mode == 'lesson') {
				convertTabletoLessonButtons($(target+' table:first'));
			} else {
				convertTabletoSpaceButtons($(target+' table:first'));
			}

			if (customer_grid.includes(mode == 'lesson' ? 'l' : 's')) {
				$(target+' .grid_view').removeClass('noshow_imp');
				$(target+' .btns_view').addClass('noshow_imp');
			} else {
				$(target+' .grid_view').addClass('noshow_imp');
				$(target+' .btns_view').removeClass('noshow_imp');

				if ($('#lgrid_user_id').val() > 0) {
					$('#lessons .grid_filter[data-intrac="'+$('#lgrid_user_id').val()+'"]').click();
				}
			}
		}
		}

		var SG_EVT = 55;
		var SG_EVT_DUR = mode === 'space' ? 20 : 280;
		var sgReduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		function runSpaceCardStaggerThenPost() {
			if (admin && !sgReduceMotion) {
				var $evts = $(target).find('tbody .section-box').filter(function () {
					return $(this).find('.section-box-inner:not(.noshow)').length > 0;
				});
				if ($evts.length) {
					if (mode === 'space' && SG_EVT_DUR === 0) {
						$evts.css({ opacity: '', transform: '', transition: '' });
						runSpaceGridPostIntro();
						return;
					}
					$evts.css({ opacity: '0', transform: 'scale(0.96)' });
					var evtMax = 0;
					$evts.each(function () {
						var $td = $(this).closest('td');
						var ri = $td.parent().index();
						var ci = Math.max(0, $td.index() - 1);
						var d = (ri + ci) * SG_EVT;
						if (d > evtMax) evtMax = d;
						var el = this;
						setTimeout(function () {
							el.style.transition = 'opacity ' + SG_EVT_DUR + 'ms ease-out, transform ' + SG_EVT_DUR + 'ms ease-out';
							el.style.opacity = '1';
							el.style.transform = 'scale(1)';
						}, d);
					});
					setTimeout(function () {
						$evts.css({ transition: '', opacity: '', transform: '' });
						runSpaceGridPostIntro();
					}, evtMax + SG_EVT_DUR + 50);
					return;
				}
			}
			runSpaceGridPostIntro();
		}

		function runSpacePhase2() {
			applySpaceScheduleData();
			runSpaceCardStaggerThenPost();
		}

		if (admin && !sgReduceMotion && mode === 'lesson') {
			var $tblLesson = $(target).find('table:first');
			if ($tblLesson.length && $tblLesson.find('tbody td').length) {
				requestAnimationFrame(function () {
					run_table_diag_intro_animation($tblLesson, runSpacePhase2);
				});
			} else {
				runSpacePhase2();
			}
		} else {
			var spaceSchedChunk = admin && mode === 'space' && data_schedule.length > 8;
			function applySpaceScheduleWork(afterApply) {
				if (spaceSchedChunk) {
					var schedIdx = 0;
					function applySpaceScheduleChunk() {
						var chunkT0 = performance.now();
						while (schedIdx < data_schedule.length && performance.now() - chunkT0 < 14) {
							applyScheduleIndex(schedIdx);
							schedIdx++;
						}
						if (schedIdx < data_schedule.length) {
							requestAnimationFrame(applySpaceScheduleChunk);
						} else {
							afterApply();
						}
					}
					requestAnimationFrame(applySpaceScheduleChunk);
				} else {
					applySpaceScheduleData();
					afterApply();
				}
			}
			if (admin && !sgReduceMotion) {
				var $tblSpace = $(target).find('table:first');
				if ($tblSpace.length && $tblSpace.find('tbody td').length) {
					requestAnimationFrame(function () {
						run_table_diag_intro_animation($tblSpace, function () {
							applySpaceScheduleWork(runSpaceCardStaggerThenPost);
						}, { diagStep: 30, fadeMs: 0, timeColumnFadeMs: 1000 });
					});
				} else {
					applySpaceScheduleWork(runSpaceCardStaggerThenPost);
				}
			} else {
				applySpaceScheduleWork(runSpaceGridPostIntro);
			}
		}

		function isPeakSlot(location_id, slot_start) {
			let resp = false;
			if (mode == 'lesson') {
				if (lesson_peak) {
					resp = true;
				}
			} else {
				for (let i = 0; i < hours[location_id].length; i++) {
					let h = hours[location_id][i];
					if (h.peak && times_isbetween(slot_start, h.hours_start, h.hours_finish, '[)')) { 
						resp = true;
						break;
					}
				}
			}
			return resp;
		}

			function isPeakSlotAbandoned(slot_start, space_id) {
			let resp = false;
			if (mode == 'lesson') {
				resp = false;
			} else {
				if (start == slot_start) { 
					resp = true;
				} else {
					let c_hr = dayjs(main_date+' '+slot_start, 'YYYY-MM-DD HH:mm:ss');
					c_hr = (c_hr.minute() === 0) ? c_hr.subtract(1, 'hour') : c_hr.startOf('hour'); 
					for (let n = 0; n < data_schedule.length; n++) { 
						let s = data_schedule[n];
						if ((s.space_id == space_id) && (timeslots_overlap(c_hr, c_hr.add(incr,'minute'), s.schedule_start, s.schedule_finish))) {
							resp = true;
							break;
						}
					}					
				}
			}
			return resp;
		}

		function isReadOnlySlot(location_id, slot_start, slot_end) {
			let resp = false;
			for (let i = 0; i < hours_ro[location_id].length; i++) {
				let h = hours_ro[location_id][i];
				if (dayjs(slot_end,'HH:mm:ss').isAfter(dayjs(h.hours_start,'HH:mm:ss')) && 
					dayjs(slot_start,'HH:mm:ss').isBefore(dayjs(h.hours_finish,'HH:mm:ss'))) {
					resp = true;
					break;
				}
			}
			return resp;
		}

	} catch (e) {
		console.error(e);
		set_side_error('Something went wrong! Please refresh the page and re-try');
	}
}

function virtual_location_filter_grid() {
	let target = $('#lessons').is(":visible") ? '#lessons' : '#spaces';

	let vloc_id = $('.virtual_locations a.active').prop('dataset').intrac;

			$(target+' .courts-many.noshow_imp').removeClass('noshow_imp');
	$(target+' .cell-many.noshow_imp').removeClass('noshow_imp');

	if (vloc_id > 0) {
		$(target+' colgroup .courts-many:not([data-intrac_location_id="'+vloc_id+'"])').addClass('noshow_imp');
		$(target+' thead .courts-many:not(:has(.space_id[data-intrac_location_id="'+vloc_id+'"])):not(:has(.user_id[data-intrac_location_id="'+vloc_id+'"]))').addClass('noshow_imp');
		$(target+' .cell-many:not(:has(.section-box[data-intrac_location_id="'+vloc_id+'"]))').addClass('noshow_imp');
	}
}

function convertTabletoSpaceButtons($table) {
    const $bxs = $table.find('tbody .section-box:visible');

    const $div = $('<div class="flex flex-col gap-3 items-start btns_view noshow_imp">\
    					<span class="grid_mor_title">Morning</span>\
    					<div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 w-full grid_mor_items"></div>\
    					<span class="grid_aft_title">Afternoon</span>\
    					<div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 w-full grid_aft_items"></div>\
    					<span class="grid_eve_title">Evening</span>\
    					<div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 w-full grid_eve_items"></div>\
    			   </div>');

    $bxs.each(function () {
        const $bx = $(this);

        let schedule_time = $bx.closest('tr').find('td:first').text();

        let clickable = !isNonInteractive($(this)); 
        let no_cur_btn = !$div.find('.grid_item_btn[data-intrac="'+schedule_time+'"]').length;

        if (clickable && no_cur_btn) {
	        let section = getMorAftEve(schedule_time);

	        const $btn = $('<button class="booking-spaces bg-white md:!h-[48px] justify-center items-center grid_item grid_item_btn'+($(this).prop('dataset').intrac_hold_id ? ' grid_item_hold' : '')+'" id="'+($bx.prop('id')+'_btn')+'" data-intrac="'+schedule_time+'">'+schedule_time+'</button>');

	        $div.find('.grid_'+section+'_items').append($btn);
        }
    });  

    $table.closest('.scroll-container').after($div);
}

function convertTabletoLessonButtons($table) {
    const $bxs = $table.find('tbody .section-box:visible');

    let user_ids = [];

    const $div = $('<section class="flex flex-col btns_view noshow_imp">\
    					<h3 class="mb-4">Select Instructor to view available times</h3>\
    					<div class="overflow-x-auto sm:overflow-visible mb-4 noscrollbar"><ul class="flex gap-2 min-w-max sm:min-w-0 items-center h-fit btns_users_list"></ul></div>\
	    				<div class="flex flex-col gap-3 items-start">\
	    					<span class="grid_mor_title">Morning</span>\
	    					<div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 w-full grid_mor_items"></div>\
	    					<span class="grid_aft_title">Afternoon</span>\
	    					<div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 w-full grid_aft_items"></div>\
	    					<span class="grid_eve_title">Evening</span>\
	    					<div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 w-full grid_eve_items"></div>\
	    			   </div>\
	    			</section>');

    $bxs.each(function () {
        const $bx = $(this);

        let schedule_time = $bx.closest('tr').find('td:first').text();
        let user_id = $(this).prop('id').split('_')[0];

        if (!user_ids.includes(user_id)) {
        	user_ids.push(user_id);
        	let $usr = $table.find('th .user_id[data-intrac="'+user_id+'"]').closest('th');

        	        	$div.find('.btns_users_list').append('<li class="instructor-plate grid_filter" data-intrac="'+user_id+'"><img class="w-[32px] h-[32px] rounded-full" src="'+$usr.find('img').prop('src')+'" alt=""><div class="flex flex-col gap-[2px]"><h6 class="text-[.7rem]">'+$usr.find('.user_id').text()+'</h6><span class="text-[.6rem] color-brand">Instructor</span></div></li>');
        }

        let clickable = !isNonInteractive($(this)); 

        if (clickable) {
	        let section = getMorAftEve(schedule_time);

	        const $btn = $('<button class="booking-spaces bg-white md:!h-[48px] justify-center items-center grid_item grid_item_btn noshow'+($(this).prop('dataset').intrac_hold_id ? ' grid_item_hold' : '')+'" id="'+($bx.prop('id')+'_btn')+'" data-intrac="'+schedule_time+'" data-intrac_filter="'+user_id+'">'+schedule_time+'</button>');

	        $div.find('.grid_'+section+'_items').append($btn);
        }
    });  

    $table.closest('.scroll-container').after($div);
}

function getMorAftEve(timeStr) {
    const hour = dayjs(timeStr, 'h:mm A').hour(); 

    switch (true) {
        case hour < 12:
            return 'mor'; 

        case hour < 17:
            return 'aft'; 

        default:
            return 'eve'; 
    }
}

function isNonInteractive($el) {
    const style = getComputedStyle($el[0]);
    return style.cursor === 'none' || style.pointerEvents === 'none';
}

function build_class_grid(data, data_schedule, admin=false, roster=false) {

	let main_date = $('#main_date').val();

	let mode = 'class';
	let target = roster ? '#rosters' : '#classes';

	let users = [];
	let times = [];
	let dates = [];
	let class_names = [];

	let html_str = '';
	let cl_div_block = '';

	let class_enrolment_titles = JSON.parse($('#class_enrolment_titles').text());

	let customer_grid = admin ? '' : $('#switch_grid').prop('dataset').intrac_customer_grid;

	try {

		let is_compressed = data[0].grid_view.includes('compressed') ? true : false;
		let is_weekly = data[0].grid_view.includes('weekly') ? true : false;
		let is_detailed = data[0].grid_view.includes('detailed') ? true : false;

		if (is_detailed && $(target).hasClass('mini_grid')) {
			$(target).removeClass('mini_grid');
		}

		$('.gview_option.active').removeClass('active');
		if (roster) {
			if (is_weekly) {
				$('.gview_weekly_roster').addClass('active')
			} else {
				$('.gview_daily_roster').addClass('active')
			}
		} else {
			if (is_detailed) {
				$('.gview_detailed').addClass('active')
			} else if (is_weekly) {
				$('.gview_weekly').addClass('active')
			} else {
				$('.gview_daily').addClass('active')
			}
			if (!is_detailed) {
				if (is_compressed) {
					$('.gview_compressed').addClass('active')
				} else {
					$('.gview_full').addClass('active')
				}
			}
		}

		if (typeof updateAllGviewPills === 'function') {
			requestAnimationFrame(updateAllGviewPills);
		}

		for (let a = 0; a < data_schedule.length; a++) {
			let d = data_schedule[a];

			let obj = {
				user_id: d.user_ids.split(',')[0],
				username: d.usernames.split(',')[0],
				location_id: d.location_id,
				image_data: d.image_data || ''
			};

			users.push(obj); 
			d.slot_user = obj; 

			let obj_c = {
				class_id: d.class_id,
				class_name: d.class_name || 'None',
				location_id: d.location_id,
				schedule_id: d.schedule_id,
				user_id: d.user_ids.split(',')[0]
			};

			class_names.push(obj_c); 
			d.slot_class = obj_c; 

			times.push(convert_date_time(d.schedule_start, 'HH:mm:ss'));

			dates.push(convert_date_time(d.schedule_start, 'YYYY-MM-DD'));

		} 

		users = [...new Map(users.map(user => [user.user_id, user])).values()];
		times = [...new Set(times)].sort((a, b) => dayjs(a,'HH:mm:ss').unix() - dayjs(b,'HH:mm:ss').unix());

		if (is_weekly) {
		    let sow = dayjs(data[0].sow);
		    let eow = dayjs(data[0].eow);

		    while (sow.isBefore(eow) || sow.isSame(eow, 'day')) {
		    	if (!['Sat', 'Sun'].includes(sow.format('ddd'))) {
		    		dates.push(sow.format('YYYY-MM-DD'));
		    	}
		        sow = sow.add(1, 'day'); 
		    }
		}

		dates = [...new Set(dates)].sort((a, b) => dayjs(a).unix() - dayjs(b).unix());

		let y_slots = times;

		html_str += '<div class="scroll-container noscrollbar'+(is_weekly ? ' is_weekly' : '')+(is_detailed ? ' is_detailed':' scroll-container-flex')+'">\
						<table class="'+(admin ? 'table-fixed w-full sm:min-w-full ':'')+'border-collapse">';

		if (is_compressed) {
			for (let a = 0; a < data.length; a++) {
				let d = data[a];

				let x_slots = users.filter(item => item.location_id == d.location_id); 
				if (is_weekly) {
					x_slots = dates;
				} else if (is_detailed) {
					x_slots = class_names.filter(item => item.location_id == d.location_id); 
				}

				let max_y_boxes = 0;
				for (let n = 0; n < x_slots.length; n++) {
					let len_ = data_schedule.filter(item => item.slot_user.user_id == x_slots[n].user_id).length; 
					if (is_weekly) {
						len_ = data_schedule.filter(item => convert_date_time(item.schedule_start, 'YYYY-MM-DD') == x_slots[n]).length;
					} else if (is_detailed) {
						len_ = 1;
					}

										if (len_ > max_y_boxes) {
						max_y_boxes = len_;
					}
				}

				y_slots = Array.from({ length: max_y_boxes }, (_, i) => i + 1); 
			}
		}

		for (let i = -1; i < y_slots.length; i++) {

			let slot_start = y_slots[i];

			if (i == -1) { 
				html_str += '<thead class="sticky top-0 z-50"><tr>\
								<th class="time-column-many'+(is_compressed ? ' noshow':'')+'"><div class="time-shadow-wrapper-title">Time</div></th>';
			} else { 
				html_str += '<tr style="height: var(--box_height)">\
								<td class="time-column-many'+(is_compressed ? ' noshow':'')+'"><div class="time-shadow-wrapper">'+dayjs(slot_start, 'HH:mm:ss').format('h:mm a').toUpperCase()+'</div></td>';
			}

			for (let a = 0; a < data.length; a++) {
				let d = data[a];

				let x_slots = users.filter(item => item.location_id == d.location_id); 
				if (is_weekly) {
					x_slots = dates;
				} else if (is_detailed) {
					x_slots = class_names.filter(item => item.location_id == d.location_id); 
				}

				for (let n = 0; n < x_slots.length; n++) {
					let x_item = x_slots[n];

					let class_block = '';

					if (i == -1) { 

						let swap_link = $('#is_admin').val() && !roster ? '<a href="#" class="btn-link text-[10px] sched_swap_today" data-intrac_swap_date="'+(is_weekly ? x_item : $('#main_date').val())+'" data-intrac_swap_user_id="'+x_item.user_id+'" >Swap</a>' : '';

						let sms_link = $('#is_admin').val() && roster && is_weekly ? '<a href="#" class="btn-link text-[10px] roster_sms_users" data-intrac_roster_date="'+x_item+'">SMS</a>' : '';

						if (admin) {

							class_block += '<th class="courts-many class-many">\
												<div class="flex gap-[9px] mini-gap justify-between items-center mini-items-top">\
													<div class="flex gap-3 mini-gap mw-0">\
														'+(is_weekly || is_detailed ? '' : '<img class="size-8 rounded-full" src="'+(x_item.image_data ? 'data:image/png;base64,'+x_item.image_data : 'images/avatar.png')+'" alt="">')+'\
														<div class="flex flex-col text-start mw-0">\
															<span class="leading-normal text-[12px] truncate">'+(is_weekly ? (admin ? convert_date(x_item) : convert_date(x_item, 'dddd')) : (is_detailed ? x_item.class_name : (x_item.username || '&nbsp;')) )+'</span>\
															<span class="leading-normal text-[10px] text-primary-btn">'+(is_weekly ? (admin ? convert_date(x_item, 'dddd') : '') : (is_detailed ? '' : 'Instructor') )+'</span>\
														</div>\
													</div>\
													'+swap_link+sms_link+'\
												</div>\
											</th>'
						} else {

							class_block += '<th class="p-4 whitespace-nowrap font-normal border border-dashed border-input-background border-t-0 bg-white w-[152px] md:w-[194px]">'+convert_date(x_item, 'dddd')+'</th>';
						}
					} else {

												if (admin) {
							class_block += '<td class="cell-many align-top">';
						} else {
							class_block += '<td class="p-1 border border-dashed border-input-background">';
						}

			        	let stid = x_item.user_id+'_'+d.location_id+'_'+(!is_compressed ? dayjs(slot_start, 'HH:mm:ss').format('HH-mm') : slot_start); 
			        	if (is_weekly) {
			        		stid = x_item+'_'+d.location_id+'_'+(!is_compressed ? dayjs(slot_start, 'HH:mm:ss').format('HH-mm') : slot_start); 
			        	} else if (is_detailed) {
			        		stid = x_item.class_id+'_'+d.location_id+'_'+x_item.schedule_id; 
			        	}

			        	if (admin) {

					        cl_div_block = '<div style="height: var(--section_box_height)" class="section_shell">\
						        				<div class="flex justify-end h-full relative rounded-md bg-transparent m-1 cursor toggle_div section-box section-box-class empty-box" id="_stid_" data-intrac_location_id="_location_id_">\
													<div class="w-[98%] py-[2px] px-1.5 relative z-10 rounded-md border-l-[2px] shadow-sm p-6 flex flex-col items-start overflow-y-auto section-box-inner class_row">\
													 	<h3 class="flex items-center justify-between w-full leading-4">\
													    	<span class="truncate main_text margin_right_md'+(is_detailed ? ' margin_btm_md' : '')+'"></span>\
													  	</h3>\
													  	<button class="three-dots-btn noshow block_toggle" data-toggle_target="grid_actions_menu">\
													  		<img src="images/icons/three_dots.svg" class="w-5 h-5 inline-block" alt="">\
													  	</button>\
													  	<p class="text-gray leading-4 sub_text w-full"></p>\
													  	<div class="flex justify-between mt-auto mb-0 text-gray w-full">\
													  		<span class="btm_text_l truncate">&nbsp;</span><span class="btm_text_r">&nbsp;</span>\
													  	</div>\
													</div>\
						                            <div class="grid_actions_menu z-[100] dropdown-menu w-[102px] p-1 z-10 hidden abs_inset">\
						                                <ul class="text-sm text-grey-neutral">\
						                                    '+(roster && !$('.instructor-page').length ? '' : '<li class="dropdown-menu-item text-main cursor btn_class modal_o_class btn_attend noshow">Attend</li>')+'\
						                                    '+(admin && roster && !is_weekly && !$('.instructor-page').length ? '<li class="dropdown-menu-item text-main cursor modal_o_rosters btn_edit_roster noshow">Edit</li>' : '')+'\
						                                    '+(admin && !roster ? '<li class="dropdown-menu-item text-main cursor btn_class modal_o_class btn_edit_class_schedule noshow">Edit</li>' : '')+'\
						                                    '+(roster && $('.instructor-page').length ? '<li class="dropdown-menu-item text-main cursor btn_class modal_o_class btn_comment_class noshow">Comment</li>' : '')+'\
						                                    '+(roster && $('.instructor-page').length ? '<div class="btn_view_game_div"></div>' : '')+'\
						                                    '+(admin && !roster ? '<li class="dropdown-menu-item text-main cursor btn_view_booking noshow">View</li>' : '')+'\
						                                    '+(admin ? '<div class="show_tabs noshow"></div>' : '')+'\
						                                </ul>\
						                            </div>\
												</div>\
											</div>';

														        	} else { 

			        					        		let btn_enrol = '<a href="#" class="btn_class btn_enrol noshow">'+toTitleCase(class_enrolment_titles.verb || 'enrol')+'</a>';
			        		let btn_waitlist = $('#wait').val().includes('c') ? '<a href="#" class="btn_class btn_wait_class'+($('#customer_id').val() > 0 ? '' : ' post_auth_items')+' noshow">Watch list</a>' : '';

			        		cl_div_block = '<div class="rounded-[10px] empty-box" id="_stid_" data-intrac_location_id="_location_id_">\
					        						<button type="button" class="bg-white p-1.5 pl-2 rounded-[10px] border border-solid border-border-input shadow-[0px_5px_12px_0px_#5951D90D] w-[152px] md:w-[194px] flex flex-col gap-3.5 text-xs leading-[100%] class_grid_btn">\
												        <div class="flex flex-col gap-0.5">\
												            <h2 class="leading-[18px] main_text"></h2>\
												            <p class="leading-4 text-customer-secondary level_name"></p>\
												            <div class="class_img noshow"></div>\
												        </div>\
												        <div class="flex flex-col gap-1.5 text-customer-secondary">\
												            <div class="flex gap-2 items-center schedule_time"><img src="images/icons/time.svg" alt="time" class="size-3.5"><span></span></div>\
												            <div class="flex gap-2 items-center dates_str"><img src="images/icons/calendar-classes.svg" alt="calendar" class="size-3.5"><span></span></div>\
												            <div class="flex gap-2 items-center username"><img src="images/icons/customer.svg" alt="customer" class="size-3.5"><span></span></div>\
												            <div class="flex gap-2 items-center space_name"><img src="images/icons/location.svg" alt="location" class="size-3.5"><span></span></div>\
												        </div>\
												        <div class="vacancy"></div>\
												    </button>\
												    <div class="actions noshow">'+btn_enrol+btn_waitlist+'</div>\
												    <span class="schedule_day noshow"></span>\
												</div>';
			        	}

			        	class_block += cl_div_block.replace('_stid_', stid).replace('_location_id_', d.location_id);

				        class_block += '</td>';
					}

			        html_str += class_block;
				}

				let levels = data_schedule.map(({ level_id, level_name }) => ({ level_id, level_name })).filter((item, index, self) => index === self.findIndex(i => i.level_id === item.level_id && i.level_name === item.level_name));
				let levels_str = '<li><a class="dropdown-item" href="#" data-intrac_level_id="" data-intrac_level_name="All levels">All levels</a></li>';
				for (let j = 0; j < levels.length; j++) {
					levels_str += '<li><a class="dropdown-item" href="#" data-intrac_level_id="'+levels[j].level_id+'" data-intrac_level_name="'+levels[j].level_name+'">'+levels[j].level_name+'</a></li>';
				}
				$('.level_filter').html(levels_str);
				$('#level_filters').removeClass('noshow');			

				$('#level_filters').each(function() {
					if (!$('#level_filters').find('.dropdown-toggle span').text().trim()) {
						$('#level_filters').find('.dropdown-toggle span').text('All levels'); 
					}
				});

				if (d.show_space_filter) {
					let spaces_str = '';
					for (let j = 0; j < d.spaces.length; j++) {
						spaces_str += '<li><a class="dropdown-item" href="#" data-intrac_space_id="'+d.spaces[j].space_id+'" data-intrac_space_name="'+d.spaces[j].space_name+'">'+d.spaces[j].space_name+'</a></li>';
					}
					$('.space_filter').html(spaces_str);
					$('#space_filters').removeClass('noshow');

					let s_id = $('#class_space_id').val(); 
					$('#class_space_id').val(''); 

					$('#space_filters').each(function() {
						if (!$(this).find('.dropdown-toggle span').text().trim()) {
							if (s_id) { 
								$(this).find('.dropdown-toggle span').text(d.spaces.filter(item => item.space_id == s_id).length ? d.spaces.filter(item => item.space_id == s_id)[0].space_name : '');
							} else {
								$(this).find('.dropdown-toggle span').text(d.spaces[0].space_name); 
							}
						}					
					});
				}
			} 

						if (i == -1) { 
				html_str += '</tr></thead><tbody>'; 
			} else {
				html_str += '</tr>'; 
			}
		} 

		html_str += '</tbody></table></div>'; 

		let $tmp = $(html_str); 

		let $colgroup = $('<colgroup></colgroup>');

		$tmp.find('table:first thead tr th').each(function(index, th) {
		    let $th = $(th);
		    let $col = $('<col>');
		    if ($th.attr('class')) {
		        $col.attr('class', $th.attr('class'));
		    }		    
		    $colgroup.append($col);
		});

		$tmp.find('table:first').prepend($colgroup);

		function getYBox(id1, id2) {
		    let maxN = 0;

		    $tmp.find('div[id^="' + id1 + '_' + id2 + '_"]').each(function() {
		    	if ($(this).hasClass('select')) {
			        const match = this.id.match(new RegExp(`^${id1}_${id2}_(\\d+)$`));
			        if (match) {
			            const n = parseInt(match[1]);
			            if (n > maxN) {
			                maxN = n;
			            }
			        }
		    	}
		    });

		    return maxN+1;
		}

		function applyClassScheduleData() {
		for (let n = 0; n < data_schedule.length; n++) {
			let schedule = data_schedule[n];

			let stid = schedule.slot_user.user_id+'_'+schedule.slot_user.location_id+'_'+(!is_compressed ? convert_date_time(schedule.schedule_start, 'HH-mm') : getYBox(schedule.slot_user.user_id, schedule.location_id)); 
			if (is_weekly) {
				stid= convert_date_time(schedule.schedule_start, 'YYYY-MM-DD')+'_'+schedule.slot_user.location_id+'_'+(!is_compressed ? convert_date_time(schedule.schedule_start, 'HH-mm') : getYBox(convert_date_time(schedule.schedule_start, 'YYYY-MM-DD'), schedule.location_id));
			} else if (is_detailed) {
				stid = schedule.slot_class.class_id+'_'+schedule.slot_class.location_id+'_'+schedule.slot_class.schedule_id;
			}

			let $tmp_stid = $tmp.find('#'+stid);

			if ($tmp_stid.hasClass('select')) {

				let cur_len = $tmp_stid.closest('.section_shell').find('.section-box').length;

				if (!$tmp_stid.closest('.section_shell').find('.info-box').length) {
					$tmp_stid.closest('.section_shell').append('<div class="info-box-gradient"><span class="info-box">1 More</span></div>');
				} else {
					$tmp_stid.closest('.section_shell').find('.info-box').text(cur_len+' More')
				}

				let stid_new = stid+'_'+(cur_len+1); 

				let new_item = $(cl_div_block.replace('_stid_', stid_new).replace('_location_id_', schedule.location_id)).addClass('margin_top_sm');

				$tmp_stid.closest('.section_shell').append(new_item).addClass('overflow-y-auto');

				stid = stid_new;
				$tmp_stid = $tmp.find('#'+stid);
			}

			let box_ = 'select';
			if (schedule.customer_id) {
				box_ += ' space-bg';
			}
			if (schedule.functions) {
				box_ += ' roster-bg';
			}

			$tmp_stid.removeClass('empty-box')
			$tmp_stid.addClass(box_+' shadow-sm');
			$tmp.find('#'+stid+' .section-box-inner').removeClass('noshow');

			if (schedule.class_name) {
				$tmp.find('#'+stid+' .main_text').html((admin && schedule.has_comment_ ? '?' : '')+schedule.class_name);
			}

			let p_str = '';

			let username = schedule.usernames ? schedule.usernames.split(',')[0] : '';
			let space_name = schedule.space_names ? schedule.space_names.split(',')[0] : '';

			if ($('.instructor-page').length) {
				space_name = schedule.space_names ? [...new Set(schedule.space_names.split(',').filter(item => item != ''))].join(', ') : '';
			}

			if (admin) {
				if (is_detailed && schedule.class_id) {

										$tmp.find('#'+stid+' .main_text').html(convert_date_time(schedule.schedule_start,'h:mma')+' to '+convert_date_time(schedule.schedule_finish,'h:mma'));

					let reg_str = '';

	                	                if (schedule.register_data && (schedule.level_type != 4)) {
	                	if (schedule.register_data.length) {
		                	reg_str += '<ul class="users-list-schedule-card">';
		                    for (let y = 0; y < schedule.register_data.length; y++) {
		                        let d = schedule.register_data[y];

		                        		                        let age = (getAge(d.dob)) ? ' ('+getAge(d.dob)+')' : '';
		                        if (d.details && d.details.schoolyear) {
		                            age = ' ('+d.details.schoolyear+')';
		                        }

		                        let medical = (d.medical && !d.medical_reused) ? ' *' : '';

		                        let comment = (d.customer_comments) ? ' ?' : '';

		                        let qty = (d.quantity > 0) ? ' - Qty: '+d.quantity : '';

		                        let absent = (d.absent) ? ' Absent' : '';

								reg_str += '<li class="flex items-center w-full h-6 leading-[130%]">\
												<span class="text-[.75rem] text-gray truncate has_right_icon">'+((y+1)+'. '+d.first_name+' '+d.last_name+age+medical+comment+qty+absent)+'</span>\
												<div class="ml-auto mr-0 right_icon'+(d.receipt_type == 2 ? ' paid' : (d.receipt_type == 1 ? ' unpaid' : ''))+'"></div>\
											</li>';
		                    }

		                    reg_str += '</ul>';
	                	}

						let cur = (schedule.regs-schedule.absents);
						let cap = schedule.capacity;
	                    if (cap > 0) {
	                        reg_str += (cur > cap) ? '<br><b class="red">Capacity Exceeded</b><br>' : (cur == cap ? '<br>Capacity Reached<br>' : '');
	                    }
	                }

	                p_str += reg_str;

	                let usernames = [...new Set(schedule.usernames.split(',').filter(item => item))];
	                if (usernames.length) {
	                    if (p_str) {
	                    	p_str += '<br>';
	                    }
		                for (let y = 0; y < usernames.length; y++) {
		                	p_str += usernames[y]+'<br>';	
		                }	                    
	                }

	                let space_names = [...new Set(schedule.space_names.split(',').filter(item => item))];
	                if (space_names.length) {
	                    if (p_str) {
	                    	p_str += '<br>';
	                    }
		                for (let y = 0; y < space_names.length; y++) {
		                	p_str += space_names[y]+'<br>';	
		                }	                    
	                }

	                if (schedule.schedule_comment) {
	                	$tmp.find('#'+stid+' .btm_text_l').html(schedule.schedule_comment);
	                }

				} else { 

										p_str += (username && is_weekly ? username+'<br>' : '');
					if (space_name) {
						if (is_detailed) {
							p_str += space_name+'<br>';
						} else {
							$tmp.find('#'+stid+' .btm_text_l').html(space_name);	
						}
					}
					p_str += '<span class="p_str_time">'+convert_date_time(schedule.schedule_start,($('.instructor_weekly_mode').length ?  'D MMM YY h:mma' : 'h:mma'))+' to '+convert_date_time(schedule.schedule_finish,'h:mma')+'</span><span class="p_str_other">';

					if (schedule.customer_id) {
						$tmp.find('#'+stid+' .main_text').html('Booking - '+(schedule.has_comment_ ? '?' : '')+schedule.first_name+' '+schedule.last_name)

												if ($('.instructor-page').length) {
							if (isvalidDate(schedule.bday||'')) {
								let dt = dayjs().format('YYYY')+'-'+dayjs(schedule.bday).format('MM-DD');
								let diff = dates_diff(dt,dayjs().format('YYYY-MM-DD'));
								if (diff >=0 && diff < 7) {
									p_str += ' <b class="half-bold inline-flex gap-1 items-center"><img src="images/icons/cake.svg" alt=""> '+convert_date(dt, 'D MMM')+'</b>'
								}
							}
							if (schedule.phone) {
								p_str += '<br>'+schedule.phone;	
							}
							if (schedule.receipt_type == 1) {
								p_str += '<br><b class="half-bold unpaid">Unpaid</b>';
							}
						}
					}

					if (roster) {
		                if (schedule.schedule_comment) {
		                    if (p_str) {
		                    	p_str += '<br>';
		                    }	                	
		                	p_str += schedule.schedule_comment+'<br>';
		                }						
					} else {
						if (schedule.class_id && (schedule.level_type != 4)) {
							let cur = (schedule.regs-schedule.absents);
							let cap = schedule.capacity;

							let cap_msg = cap > 0 ? (schedule.regs-schedule.absents)+' of '+schedule.capacity : schedule.regs-schedule.absents;

							$tmp.find('#'+stid+' .btm_text_r').html((cur > cap & (cap > 0)) ? '<b class="red">'+cap_msg+'</b>' : cap_msg);
						}
					}

					if (is_detailed) {
						p_str = p_str.replace(/<br>/g, '<br><br>');
					}

					p_str += '</span>'; 
				}

			} else {
				$tmp_stid.removeClass('noshow');

				if (schedule.level_name) {
					$tmp.find('#'+stid+' .level_name').text(schedule.level_name);
				} else {
					$tmp.find('#'+stid+' .level_name').addClass('noshow');
				}

				$tmp.find('#'+stid+' .schedule_time span').text(convert_date_time(schedule.schedule_start,'h:mma')+' to '+convert_date_time(schedule.schedule_finish,'h:mma'));

								if (schedule.level_type != 6) {
					$tmp.find('#'+stid+' .schedule_day').text(schedule.day_orig || convert_date_time(schedule.schedule_start,'ddd'));	
				}

				let dates_str = (schedule.level_type == 6 ? convert_date(schedule.schedule_date_orig || schedule.schedule_start,'D MMM') : (schedule.term_start ? convert_date(schedule.term_start,'D MMM')+' to '+convert_date(schedule.term_finish,'D MMM') : ''));
				if (dates_str) {
					$tmp.find('#'+stid+' .dates_str span').text(dates_str);
				} else {
					$tmp.find('#'+stid+' .dates_str').addClass('noshow');
				}

				if (username) {
					$tmp.find('#'+stid+' .username span').text(username);
				} else {
					$tmp.find('#'+stid+' .username').addClass('noshow');
				}

				if (space_name) {
					$tmp.find('#'+stid+' .space_name span').text(space_name);
				} else {
					$tmp.find('#'+stid+' .space_name').addClass('noshow');
				}

				if (schedule.image_data) {
					$tmp.find('#'+stid+' .class_img').html(schedule.image_data);
				}

				let vac_str = '';
				if (schedule.vacancy == 'full') {
					vac_str = '<span class="event-status bg-error-100 text-error-200"><span class="size-1.5 bg-error-200 rounded-[20px]"></span> '+(toTitleCase($('#class_title').val())+' Full')+'</span>';
				} else if (schedule.vacancy == 'not open') {
					vac_str = '<span class="event-status bg-warning-100 text-warning-200"><span class="size-1.5 bg-warning-200 rounded-[20px]"></span> '+('Not yet open')+'</span>';
				} else {
					if (validator.isInt((schedule.vacancy||'').toString())) {
						vac_str = '<span class="event-status bg-success text-success-text"><span class="size-1.5 bg-success-text rounded-[20px]"></span> '+(schedule.vacancy+' spot'+(schedule.vacancy > 1 ? 's' : 'Vacancies'))+'</span>';
					} else {
						vac_str = '<span class="event-status bg-success text-success-text"><span class="size-1.5 bg-success-text rounded-[20px]"></span> Vacancies</span>';
					}
				}

				if (vac_str) {
					$tmp.find('#'+stid+' .vacancy').html(vac_str);
				} else {
					$tmp.find('#'+stid+' .vacancy').addClass('noshow');
				}
			}

			$tmp.find('#'+stid+' .sub_text').html(p_str);
			if ($tmp_stid.length) {
				$tmp_stid.prop('dataset').intrac_level_type = schedule.level_type; 
				$tmp_stid.prop('dataset').intrac_level_id = schedule.level_id; 
				$tmp_stid.prop('dataset').intrac_term_id = schedule.term_id; 
				if (!admin && schedule.level_type == 6) {
					$tmp_stid.prop('dataset').intrac_schedule_orig = schedule.schedule_date_orig ? schedule.schedule_date_orig+' '+dayjs(schedule.schedule_start).format('HH:mm:ss') : schedule.schedule_start; 
				}				
			}

			if (((schedule.status != 2) && (schedule.status != 3) && (schedule.status != 4)) ||
				(schedule.vacancy == 'full') ||
				(schedule.vacancy == 'not open') ||
				(dates_diff(schedule.term_finish, dayjs().format('YYYY-MM-DD')) < 0)) {
				$tmp.find('#'+stid+' .btn_enrol').remove();
			}

			if (schedule.vacancy == 'full') {
				$tmp.find('#'+stid+' .btn_wait_class').removeClass('noshow');
			} else {
				$tmp.find('#'+stid+' .btn_wait_class').remove();
			}

			if (schedule.functions) {
				$tmp.find('#'+stid+' .btn_edit_roster').removeClass('noshow');

				if ($tmp.find('#'+stid+' .btn_edit_roster').length) { 
					$tmp.find('#'+stid+' .btn_edit_roster').each(function () {
						$(this).prop('dataset').intrac = (schedule.schedule_id || 0);
					});
				}
			} else if (schedule.class_id) {
				$tmp.find('#'+stid+' .btn_class').removeClass('noshow');

				if ($tmp.find('#'+stid+' .btn_class').length) { 
					let ids = schedule.class_id+'~'+(schedule.program_id || 0)+'~'+(schedule.schedule_id || 0);
					$tmp.find('#'+stid+' .btn_class').each(function () {
						$(this).prop('dataset').intrac = ids;
						$(this).prop('dataset').intrac_term_id = schedule.term_id;
					});
				}

				if ($('.instructor-page').length && schedule.fixtures?.length) {

					let btn_html = '';
					for (let y = 0; y < schedule.fixtures.length; y++) {
						let f = schedule.fixtures[y];

						let todays_game = dayjs(schedule.schedule_start).format('YYYY-MM-DD') == dayjs().format('YYYY-MM-DD') ? true : false;

						if ((f.team1_name != 'Bye') && (f.team2_name != 'Bye')) {
							btn_html += '<li class="dropdown-menu-item text-main cursor '+(todays_game ? 'btn_view_game' : 'btn_view_game_disabled')+'" data-intrac_fixture_id="'+f.fixture_id+'">'+(f.tag ? f.tag+': ' : '')+(f.team1_name || '') +' v '+ (f.team2_name || '')+'</li>';
						}
					}

					$tmp.find('#'+stid+' .btn_view_game_div').html(btn_html);

									} else {
					$tmp.find('#'+stid+' .btn_view_game_div').remove();
				}
			} else if (schedule.customer_id && (schedule.program_id == 0)) {
				$tmp.find('#'+stid+' .btn_view_booking').removeClass('noshow');
				$tmp.find('#'+stid+' .btn_view_booking').each(function () {
					$(this).prop('dataset').intrac_schedule_id = schedule.schedule_id;
					$(this).prop('dataset').intrac_mode = schedule.pass_id > 0 ? 'lesson' : 'space';
				});
			}
		}
		}

		$(target).empty().append($tmp); 

		const EVT_STAGGER = 83;
		const EVT_DUR = 420;
		const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		function runClassGridAfterScheduleIntro() {
		if (!$('.admin-page').length && ($('#customer_id').val() > 0)) {
			if (!$(mc2+' .cregister_cust_list [name="cregister_customer_id"]').length) {
				$('.btn_enrol').remove();
				$('.btn_wait_class').remove();
			}
		}

		if (!$('.admin-page').length && $('#enrol_ids').val()) {
			let ids = $('#enrol_ids').val();
			$('#enrol_ids').val(''); 
			ids = ids.split('~');
			if (ids.length == 1) {
				ids.push(0);
				ids.push(0);
			} else if (ids.length == 2) {
				ids.push(0);
			}
			if ($('.btn_enrol[data-intrac="'+ids.join('~')+'"]:first').length) {
				$('.btn_enrol[data-intrac="'+ids.join('~')+'"]:first').click();	
			} else {
				$('.btn_enrol[data-intrac^="'+ids[0]+'~"]:first').click(); 
			}
		}

		if ($('.admin-page').length && !is_weekly && !is_compressed && !is_detailed) {
			if (dayjs().format('YYYY-MM-DD') == $('#main_date').val()) {
				let el = findClosestPastSlot(target);

				if (el) {
				    $(target+' .scroll-container').animate({
				        scrollTop: $(el).offset().top - $(target+' .time-shadow-wrapper:first').offset().top
				    }, 0);				
				} 
			}
		}

		$(target+' table .grid_actions_menu').each(function() {
			if ($(this).find('.dropdown-menu-item:not(.noshow)').length) {
				$(this).closest('.toggle_div').find('.three-dots-btn').removeClass('noshow');
			}
		});

		if (is_detailed) {
			convertTabletoUl($(target+' table:first'));
		}

		if ($('.instructor-page').length) {
			$(target).removeClass('table-wrapper').addClass('mt-4 md:mt-6');
			$(target).find('.scroll-container').removeClass('scroll-container scroll-container-flex')
			convertTabletoUlInstructor($(target+' table:first'));
		}

		if ($('.customer-page').length && !customer_grid.includes('c')) {
			convertTabletoClassButtons($(target+' table:first'));
		}

		if ($('.customer-page').length) {
			filter_class_grid();
		}

		}

		function runPhase2Events() {
			applyClassScheduleData();
			var CARD_SPRING_MS = Math.round(EVT_DUR * 1.48);
			if (admin && !reduceMotion) {
				var $evts = $(target).find('tbody .section-box.section-box-class').filter(function () {
					return this.classList.contains('select') || this.classList.contains('empty-box');
				});
				if ($evts.length) {
					$evts.each(function () {
						var el = this;
						el.style.transition = 'none';
						el.style.opacity = '0';
						el.style.transform = 'scale(0.78)';
					});
					var evtMax = 0;
					var springKfs = [
						{ opacity: 0, transform: 'scale(0.78)' },
						{ opacity: 1, transform: 'scale(1.09)', offset: 0.38 },
						{ opacity: 1, transform: 'scale(0.94)', offset: 0.58 },
						{ opacity: 1, transform: 'scale(1.03)', offset: 0.78 },
						{ opacity: 1, transform: 'scale(1)', offset: 1 }
					];
					var useWAAPI = typeof Element.prototype.animate === 'function';
					var finishCardSprings = function () {
						$evts.each(function () {
							var el = this;
							el.getAnimations().forEach(function (a) {
								a.cancel();
							});
							el.classList.remove('grid-schedule-card-spring');
							el.style.transition = '';
							el.style.opacity = '';
							el.style.transform = '';
							el.style.willChange = '';
						});
						runClassGridAfterScheduleIntro();
					};
					if (useWAAPI) {
						var promises = [];
						var waapiCount = 0;
						$evts.each(function () {
							var $td = $(this).closest('td');
							var ri = $td.parent().index();
							var ci = Math.max(0, $td.index() - 1);
							var d = (ri + ci) * EVT_STAGGER;
							if (d > evtMax) evtMax = d;
							waapiCount++;
							var anim = this.animate(springKfs, {
								duration: CARD_SPRING_MS,
								delay: d,
								easing: 'ease-out',
								fill: 'forwards'
							});
							if (anim && anim.finished) {
								promises.push(anim.finished.catch(function () {}));
							}
						});
						var tailMs = evtMax + CARD_SPRING_MS + 75;
						var settled = false;
						var settle = function () {
							if (settled) return;
							settled = true;
							clearTimeout(safetyId);
							finishCardSprings();
						};
						var safetyId = setTimeout(settle, tailMs + 250);
						if (promises.length === waapiCount && promises.length > 0) {
							Promise.all(promises).then(settle, settle);
						}
					} else {
						$evts.each(function () {
							var $td = $(this).closest('td');
							var ri = $td.parent().index();
							var ci = Math.max(0, $td.index() - 1);
							var d = (ri + ci) * EVT_STAGGER;
							if (d > evtMax) evtMax = d;
							var el = this;
							setTimeout(function () {
								el.classList.add('grid-schedule-card-spring');
							}, d);
						});
						setTimeout(finishCardSprings, evtMax + CARD_SPRING_MS + 75);
					}
					return;
				}
			}
			runClassGridAfterScheduleIntro();
		}

		if (admin && !reduceMotion) {
			var $tblClass = $(target).find('table:first');
			function runClassPhase2AfterIntro() {
				runPhase2Events();
			}
			if ($tblClass.length && $tblClass.find('tbody td').length) {
				requestAnimationFrame(function () {
					run_table_diag_intro_animation($tblClass, runClassPhase2AfterIntro, { skipCellUnwrap: true });
				});
			} else {
				runClassPhase2AfterIntro();
			}
		} else {
			applyClassScheduleData();
			runClassGridAfterScheduleIntro();
		}

	} catch (e) {
		console.error(e);
		set_side_error('Something went wrong! Please refresh the page and re-try');
		if ($('.instructor-page').length) {
			$(target).addClass('noshow');
		}
	}
}

function convertTabletoUl($table) {
    const $theadCells = $table.find('thead tr').first().children('th');
    const $tbodyCells = $table.find('tbody tr').first().children('td');

    const totalCols = Math.min($theadCells.length, $tbodyCells.length);
    if (totalCols === 0) return;

    const $ul = $('<ul class="flex flex-wrap w-full bg-white p-3 sm:p-6 rounded-[20px] gap-5 justify-between"></ul>');

    for (let i = 1; i < totalCols; i++) {
        const $th = $theadCells.eq(i).clone(true, true);
        const $td = $tbodyCells.eq(i).clone(true, true);

        const thHtml = $th.html();
        const tdHtml = $td.html();

        const $li = $(`
            <li class="flex flex-col gap-1.5">
                <span class="leading-[18px]">${thHtml}</span>
                ${tdHtml}
            </li>
        `);

        $ul.append($li);
    }

    $table.replaceWith($ul);
}

function convertTabletoUlInstructor($table) {
	const $rows = $table.find('tbody tr');

	const colCount = $rows.first().children('td').length;
	const tds = [];

	for (let col = 0; col < colCount; col++) {
	    $rows.each(function () {
	        const $td = $(this).children('td').eq(col);

	        if ($td.find('.select').length) {
	            tds.push($td);
	        }
	    });
	}

    const $ul = $('<ul class="flex flex-col md:flex-row flex-wrap gap-4 md:gap-5"></ul>');

    $(tds).each(function () {
        const $td = $(this);

        let actions_str = '';
        $td.find('.grid_actions_menu li:not(.noshow)').each(function() {
        	actions_str += $(this).clone().removeClass('dropdown-menu-item').addClass($(this).hasClass('btn_view_game') || $(this).hasClass('btn_view_game_disabled') ? 'primary-btn sm:p-6 col-span-2 text-center' : 'outline-btn sm:p-6')[0].outerHTML.replace(/<li(\s|>)/g, "<a href='#' $1").replace(/<\/li>/g, "</a>");        	
        });
        if ($('.instructor_weekly_mode').length) {
        	actions_str = '';
        }

        let details = $td.find('.p_str_other').text().trim() ? $td.find('.p_str_other').html() : '';
        if (details) {
        	details = details.replace(/^<br\s*\/?>/, ""); 
        }

        const $li = $('<li class="bg-white w-full md:basis-[332px] rounded-[20px] p-4 leading-[100%] flex flex-col gap-4">\
		            	<h3 class="text-xl pb-4 border-b border-b-gray-light">'+$td.find('h3').text()+'</h3>\
		            	<div class="flex flex-col gap-3">\
			            	<div class="flex justify-between gap-3"><p class="text-gray">Time</p><p class="align-end">'+$td.find('.p_str_time').text()+'</p></div>\
			            	'+($td.find('.btm_text_l').text().trim() ? '<div class="flex justify-between gap-3"><p class="text-gray">'+toTitleCase($('#space_title').val())+'</p><p class="align-end">'+$td.find('.btm_text_l').text()+'</p></div>': '')+'\
			            	'+(details ? '<div class="flex justify-between gap-3"><p class="text-gray">Details</p><p class="align-end">'+details+'</p></div>': '')+'\
		            	</div>\
		            	<div class="grid grid-cols-2 leading-5 gap-2">'+actions_str+'</div>\
		            </li>');

        $ul.append($li);
    });

    $table.replaceWith($ul);
}

function convertTabletoClassButtons($table) {

	const $rows = $table.find('tbody tr');

	const colCount = $rows.first().children('td').length;
	const tds = [];

	for (let col = 0; col < colCount; col++) {
	    $rows.each(function () {
	        const $td = $(this).children('td').eq(col);

	        if ($td.find('.select').length) {
	            tds.push($td);
	        }
	    });
	}	

    let status_arr = [];
    let schedules_arr = []; 

    const $ul = $('<ul class="flex flex-col lg:flex-row gap-3 flex-wrap"></ul>');

    $(tds).each(function () {
        const $td = $(this);

        let status_str = $td.find('.vacancy').text().trim();

        let schedule_time = $td.find('.schedule_time').html();
        schedule_time = schedule_time.replace('<span>', '<span>'+$td.find('.schedule_day').text()+' ');

        let dates_str = $td.find('.dates_str').hasClass('noshow') ? '' : $td.find('.dates_str').html();
        let username = $td.find('.username').hasClass('noshow') ? '' : $td.find('.username').html();
        let space_name = $td.find('.space_name').hasClass('noshow') ? '' : $td.find('.space_name').html();

        let actions_str = $td.find('.actions').html();

        const $li = $('<li class="w-full lg:basis-[calc((100%-24px)/3)] select grid_item" data-intrac_filter="'+status_str+'" data-intrac_level_id="'+$td.find('.select').prop('dataset').intrac_level_id+'" data-intrac_term_id="'+$td.find('.select').prop('dataset').intrac_term_id+'" data-intrac_schedule_orig="'+($td.find('.select').prop('dataset').intrac_schedule_orig || '')+'">\
					    <div class="bg-white rounded-[20px] p-4 shadow-[0px_2px_8px_0px_#0000001A]">\
					        <div class="flex justify-between items-start mb-1">\
					            '+$td.find('.vacancy').html()+'\
					            '+($td.find('.class_img').html() ? '<img src="data:image/png;base64,'+$td.find('.class_img').html()+'" alt="" class="size-10 rounded-full">' : '')+'\
					        </div>\
					        <h2 class="text-lg leading-5 md:text-xl md:leading-5 mb-1 main_text">'+$td.find('.main_text').text()+'</h2>\
					        '+($td.find('.level_name').text() ? '<p class="text-xs leading-[100%] md:text-sm md:leading-[100%] text-customer-secondary mb-5">'+$td.find('.level_name').text()+'</p>' : '')+'\
					        <div class="flex justify-between">\
					            <div class="flex flex-col gap-1.5 text-customer-secondary text-xs leading-[100%]">\
					                <div class="flex gap-1.5 items-center">\
					                    '+schedule_time+'\
					                    '+(schedule_time && dates_str ? '<span class="w-px h-4 bg-border-input"></span>' : '')+'\
					                    '+dates_str+'\
					                </div>\
					                <div class="flex gap-1.5 items-center">\
					                    '+username+'\
					                    '+(username && space_name ? '<span class="w-px h-4 bg-border-input"></span>' : '')+'\
					                    '+space_name+'\
					                </div>\
					            </div>\
					            <button type="button" class="customer-primary-btn shadow-none disabled:shadow-none hover:shadow-none focus:shadow-none active:shadow-none !rounded-full !w-10 !p-2 class_grid_btn'+(actions_str ? '' : ' nocursor')+'" '+(actions_str ? '' : 'disabled="disabled"')+'><img src="images/icons/arrow-up-right.svg" alt="" class="size-[22px]"></button>\
					            <div class="actions noshow">'+actions_str+'</div>\
					        </div>\
					    </div>\
					</li>');

        if ($td.find('.select').prop('dataset').intrac_schedule_orig) {
            schedules_arr.push($li); 
        } else if ($td.find('.schedule_day').text() == 'All_clone') {
        } else {
        	$ul.append($li);
        }

        status_arr.push(status_str);
    });

    if (schedules_arr.length) {
        schedules_arr.sort(function(a, b) {
            const aDate = a.data('intrac_schedule_orig');
            const bDate = b.data('intrac_schedule_orig');

            return aDate.localeCompare(bDate); 
        });

        schedules_arr.forEach(function($li) {
            $ul.append($li);
        });
    }

    status_arr = [...new Set(status_arr)]; 
    let filter_str = '';
	if (status_arr.length > 1) {
		filter_str += '<ul class="flex flex-wrap gap-2 items-center text-xs md:text-sm text-center mb-3 noscrollbar">\
						   <li class="li-tab cursor-pointer rounded-[20px] grid_filter active" data-intrac="">All</li>';

		for (let i = 0; i < status_arr.length; i++) {
			filter_str += '<li class="li-tab cursor-pointer rounded-[20px] grid_filter" data-intrac="'+status_arr[i]+'">'+status_arr[i]+'</li>';
		}

        filter_str += '</ul>';
	}    

    $table.closest('.scroll-container').replaceWith($(filter_str), $ul);
}

function set_location_options(d) {
    $('#schedule_comment').text(d.schedule_comment);

    if (d.shadow_multi && d.shadow_multi > 1) {
    	$('#space_modal .shadow_spaces_num_div').removeClass('noshow');
    	let opts_str = '';
    	for (let i = 0; i < d.shadow_multi; i++) {
    		opts_str += '<option value="'+(i+1)+'">'+(i+1)+'</option>';
    	}
    	$('#space_modal .shadow_spaces_num').html(opts_str);
    } else {
    	$('#space_modal .shadow_spaces_num_div').addClass('noshow');
    }

    if (d.booking_details) {
        let div_str = '';
        for (let i = 0; i < d.booking_details.length; i++) {
            let e = d.booking_details[i];

            let intrac_mandatory = e.mandatory?' data-intrac_mandatory="true" ':'';
            let intrac_capacity = e.capacity?' data-intrac_capacity="true" ':'';
            let intrac_blank_comment = e.blank_comment?' data-intrac_blank_comment="true" ':'';
            let intrac_rate_id = e.rate_id?' data-intrac_rate_id="'+e.rate_id+'" ':'';
            let intrac_location_id = ' data-intrac_location_id="'+d.location_id+'" ';
            let intrac_space_ids = e.space_ids?' data-intrac_space_ids="'+e.space_ids.join('-')+'" ':'';

            let form_control = $('.customer-page').length ? ' form-control' : '';

            if ((e.type == 'text') || (e.type == 'number')) {
                div_str += '<li class="date-box booking_details_div">\
                				<span class="booking-details-list-label"><img src="images/icons/bullet-list-text.svg" alt="">'+e.display+'</span>\
			                    <input type="'+e.type+'" class="custom-input'+form_control+' booking_details_inp" name="'+e.display+'" value="'+(e.default?e.default:'')+'" '+(e.maxlength?' maxlength="'+e.maxlength+'"':'')+(e.max?' max="'+e.max+'"':'')+' data-input '+intrac_mandatory+intrac_capacity+intrac_blank_comment+intrac_location_id+intrac_space_ids+' >\
			                </li>';
            }

            if (e.type == 'textarea') {
                div_str += '<li class="date-box booking_details_div">\
                				<span class="booking-details-list-label"><img src="images/icons/bullet-list-text.svg" alt="">'+e.display+'</span>\
			                    <textarea class="custom-input'+form_control+' booking_details_inp" name="'+e.display+'" '+(e.maxlength?' maxlength="'+e.maxlength+'"':'')+' '+intrac_mandatory+intrac_capacity+intrac_blank_comment+intrac_location_id+intrac_space_ids+' >'+(e.default?e.default:'')+'</textarea>\
			                </li>';
            }

            if (e.type == 'select') {
                let opts_str = '';
                for (let i = 0; i < e.values.length; i++) {
                    opts_str += '<option value="'+e.values[i]+'" '+(e.default && e.default == e.values[i] ? 'selected' : '')+'>'+e.values[i]+'</a></li>';
                }                

                div_str += '<li class="date-box booking_details_div">\
                				<span class="booking-details-list-label"><img src="images/icons/bullet-list-text.svg" alt="">'+e.display+'</span>\
	                            <select class="custom-field'+form_control+' booking_details_inp'+(intrac_rate_id ? ' booking_details_inp_rate' : '')+'" name="'+e.display+'" '+intrac_mandatory+intrac_capacity+intrac_blank_comment+intrac_location_id+intrac_space_ids+intrac_rate_id+'>'+opts_str+'</select>\
			                </li>';
            }

        }
        $('#space_modal .location_name_div').before(div_str);
    }

    $('.booking_addons_div').remove();
    if (d.booking_addons) {
        let div_str = '';
        for (let i = 0; i < d.booking_addons.length; i++) {
            let e = d.booking_addons[i];

            div_str += '<div class="date-box booking_addons_div">\
            				<div class="form-label m-0">\
			                    <label class="container">\
			                        <input type="checkbox" class="checkbox-custom booking_addons" data-intrac="'+e.key+'" data-intrac_product_id="'+e.product_id+'" data-intrac_price="'+e.price+'" data-intrac_product_details="'+e.product_details+'">'+e.display+'\
			                    </label>\
			                </div>\
			            </div>';
        }
        $('#space_modal .location_name_div').before(div_str);
    }
}

function set_booking_details_inp() {
	if ($('#space_modal .booking_details_inp').length) {
		let space_ids = [];
		let location_ids = [];

		$('#space_modal .spaces_list li').each(function() {
			if ($(this).hasClass('checked')) {
				let id = $(this).find('a').prop('dataset').intrac;
				space_ids.push(id);

				let loc_id = $(this).find('a').prop('dataset').intrac_location_id;
				location_ids.push(loc_id);
			}
		});

		$('#space_modal .booking_details_inp').each(function() {
			let bd_location_id = $(this).prop('dataset').intrac_location_id;
			if (location_ids.includes(bd_location_id)) { 
				$(this).closest('.booking_details_div').show();
			} else {
				$(this).closest('.booking_details_div').hide();
			}

			if ($(this).prop('dataset').intrac_space_ids) {
				let bd_space_ids = $(this).prop('dataset').intrac_space_ids.split('-');

				if (space_ids.some(item => bd_space_ids.includes(item))) { 
					$(this).closest('.booking_details_div').show();
				} else {
					$(this).closest('.booking_details_div').hide();
				}
			}
		});	
	}
}

function reset_space_booking() {
	$('#space_modal').scrollTop(0);
	$('#space_modal .booking_date').val(convert_date($('#main_date').val(), 'dddd, MMM D'));
	$('#space_modal .spaces_list').html('');
	$('.starttimes_list').html('');
	$('.endtimes_list').html('');
	$('#space_modal .location_name').text($('#main_switch_location').find("[data-intrac='"+$('#location_id').val()+"'][data-intrac_combo='"+($('#location_id').prop('dataset').intrac_combo || '')+"']").text());
	$('#space_modal .cur_schedule_comment').remove();
	$('#space_modal .repeat_booking_div').removeClass('noshow');
}

function init_space_booking() {
	reset_space_booking();

	let el = $('.section-box.active:first');
	if (!el.length) { 
		return false;
	}
	if (($('#customer_id').length) && ($('#customer_id').val() == 0)) {
		$('#postauth_action').text('space_booking~'+$(el).prop('id'));
	}
	$(el).removeClass('active'); 

	let location_ids = [];

	let space_id = $(el).prop('id').split('_')[0];

	let space_ids = [];
	$('#spaces .space_id:not(.read_only)').each(function() {

		let id = $(this).prop('dataset').intrac;
		let name = $(this).text();

		let loc_id = $(this).prop('dataset').intrac_location_id;
		if (!location_ids.includes(loc_id)) {
			location_ids.push(loc_id);
		}

		$('#space_modal .spaces_list').append('<li'+(id == space_id ? ' class="checked"':'')+'><a href="#" class="toggle-btn space_sel" data-intrac="'+id+'" data-intrac_location_id="'+loc_id+'">'+name+'</a></li>');

		space_ids.push({id: id, loc_id: loc_id});
	});

	for (let i = 0; i < location_ids.length; i++) {
		let loc_id = location_ids[i];
		let rates = JSON.parse(decryptData($('#hours').text()))[loc_id];
		let rates_ff = rates.filter(item => item.fullfield === 1);
		if (rates_ff.length && rates_ff.length == rates.length/2) { 
			$('#space_modal .spaces_list li a[data-intrac_location_id="'+loc_id+'"]:last').closest('li').after('<li><a href="#" class="toggle-btn space_sel fullfield" data-intrac="'+space_ids.filter(item => item.loc_id == loc_id).map(item => item.id).join(',')+'" data-intrac_location_id="'+loc_id+'">Full field</a></li>');
		}
	}

	if ($('#space_modal .spaces_list .space_sel').length>1) {
		$('#space_modal .spaces_list_div').show();
	} else {
		$('#space_modal .spaces_list_div').hide();
	}

	set_booking_details_inp();

	get_slot_starttimes();

	$('#space_modal .starttimes_list').val(dayjs($(el).prop('id').split('_')[1],'HH-mm').format('h:mm a'));

	open_side_modal('space');

	if ($('#space_modal .schedule_id').val()) {
		set_alter_booking('space');
	}

	get_slot_endtimes();
}

function reset_lesson_booking() {
	$('#lesson_modal .modal').scrollTop(0);
	$('#lesson_modal .booking_date').val(convert_date($('#main_date').val(), 'dddd, MMM D'));
	$('#lesson_modal .users_list').html('');
	$('#lesson_modal .passes_list').html('');
	$('.starttimes_list').html('');
	$('.endtimes_list').html('');
	$('#lesson_modal .location_name').text($('#main_switch_location').find("[data-intrac='"+$('#location_id').val()+"'][data-intrac_combo='"+($('#location_id').prop('dataset').intrac_combo || '')+"']").text());
	$('#lesson_modal .schedule_comment').val('');
	$('#lesson_modal .capacity').val('1');
	$('#lesson_modal .repeat_booking_div').removeClass('noshow');
}

function set_booking_users(user_id) {
	$('#lessons .user_id:not(.read_only)').each(function() {

		let id = $(this).prop('dataset').intrac;
		let name = $(this).text();

		$('#lesson_modal .users_list').append('<li'+(id == user_id ? ' class="checked"':'')+'><a href="#" class="toggle-btn user_sel" data-intrac="'+id+'">'+name+'</a></li>');
	});

	if ($('#lesson_modal .users_list .user_sel').length>1) {
		$('#lesson_modal .users_list_div').show();
	} else {
		$('#lesson_modal .users_list_div').hide();
	}	
}

async function init_lesson_booking() {
	reset_lesson_booking();

	let el = $('.section-box.active:first');
	if (!el.length) { 
		return false;
	}

	if (($('#customer_id').length) && ($('#customer_id').val() == 0)) {
		$('#postauth_action').text('lesson_booking~'+$(el).prop('id'));
	}
	$(el).removeClass('active'); 

	if (!$('.admin-page').length) {
	    if (check_lessons_cart()) {
	    	set_side_error('You already have a lesson in your cart, process it first or <br><a href="#" class="cancel_holds primary">Cancel my selections and start again</a>');
	    	$('#open_cart').click();
	    	return false;
	    }
	}

	let user_id = $(el).prop('id').split('_')[0];

	set_booking_users(user_id);

	get_slot_starttimes('lesson');

	$('#lesson_modal .starttimes_list').val(dayjs($(el).prop('id').split('_')[1],'HH-mm').format('h:mm a'));

	open_side_modal('lesson');

	if ($('#lesson_modal .schedule_id').val()) {
		set_alter_booking('lesson');
	}

	await get_slot_endtimes('lesson');

	get_lesson_passtypes();
}

async function set_alter_booking(mode='space') {
	let modal = (mode == 'lesson') ? '#lesson_modal' : '#space_modal';

	if ($(modal+' .schedule_data').text()) {
		let sd = JSON.parse($(modal+' .schedule_data').text());

		$(modal+' .customers_list').val(sd.customer_id);

		$(modal+' .booking_date').prop('disabled', false);
		$(modal+' .calendar_booking')[0]._flatpickr.setDate(convert_date_time(sd.schedule_start, 'YYYY-MM-DD'),false);

		let space_ids = sd.space_ids.split(',');

		if ((sd.schedule_comment == 'Full field') && (space_ids.length > 1)) { 
			$(modal+' .space_sel').closest('li').removeClass('checked');
			$(modal+' .space_sel.fullfield[data-intrac_location_id="'+sd.location_id+'"]').closest('li').addClass('checked');
		} else {
			for (let i = 0; i < space_ids.length; i++) {
				if (space_ids[i] > 0) {
					if (mode == 'space') {
						$(modal+' .space_sel[data-intrac="'+space_ids[i]+'"]').closest('li').addClass('checked');	
					} else {
						$(modal+' .bspace_list').val(space_ids[i]).change();
					}
				}
			}
		}

		let user_ids = sd.user_ids.split(',');

		for (let i = 0; i < user_ids.length; i++) { 
			if (user_ids[i] > 0) {
				if (mode == 'lesson') {
					$(modal+' .user_sel[data-intrac="'+user_ids[i]+'"]').closest('li').addClass('checked');
				} else {
					$(modal+' .buser_list').val(user_ids[i]).change();
				}				
			}
		}


		if (mode == 'space') {
			set_booking_details_inp(); 
			let bds = sd.schedule_comment.split('<br>');
			for (let i = 0; i < bds.length; i++) {
				if (bds[i].includes(':')) {
					let key = bds[i].split(':')[0].trim();
					let value = (bds[i].split(':')[1] || '').trim();

					let bd_el = $(modal+' .booking_details_inp[name="'+key+'"][data-intrac_location_id="'+sd.location_id+'"]')[0];

					if (bd_el) {
						$(bd_el).val(value);
					}
				}
			}

            if (!$('#space_modal .booking_details_inp').length) { 
	            if ((sd.schedule_comment || sd.allow_update_comment) &&
	            	(sd.schedule_comment != 'Full field')) { 
		                let cur_comm_div = '<li class="date-box cur_schedule_comment">\
		                    <span class="booking-details-list-label"><img src="images/icons/bullet-list-text.svg" alt="">Comment</span>\
		                    <textarea class="custom-input">'+($('<div>').text(sd.schedule_comment).html())+'</textarea>\
		                </li>';

		                $('#space_modal .location_name_div').before(cur_comm_div);
	            }
	    	}
		}

		if (mode == 'lesson') {
			$('#lesson_modal .schedule_comment').val(sd.schedule_comment);
			$('#lesson_modal .capacity').val(sd.capacity);
		}

		$('.booking_addons_div').hide();

		$(modal+' .customer_email').prop('checked', false);

		$(modal+' .repeat_booking_div').addClass('noshow');

		$(modal+' .endtimes_list').prop('dataset').cur_finish_time = convert_date_time(sd.schedule_finish, 'h:mm a');

		$(modal+' .change_cust').addClass('noshow');
	}
}

function get_slot_starttimes(mode='space') {

	let space_ids = []; 

	let modal = (mode == 'lesson') ? '#lesson_modal' : '#space_modal';
	let list = (mode == 'lesson') ? '.users_list' : '.spaces_list';

	let cur_start_time = $(modal+' .starttimes_list').val();

	$(modal+' '+list+' li').each(function() {
		let id = $(this).find('a').prop('dataset').intrac;
		if ($(this).hasClass('checked')) {
			if ($(this).find('a').hasClass('fullfield')) {
				space_ids = id.split(',');	
			} else {
				space_ids.push(id);
			}
		}
	});

	let schedule_id = $(modal+' .schedule_id').val(); 

	if (space_ids.length) {

		let html_str = '';
		$('[id^='+space_ids[0]+'_]:not(.grid_item_btn)').each(function() { 

						let t = $(this).prop('id').split('_')[1];
			let valid_slot = true;

			$('[id$=_'+t+']').each(function() { 
				let id = $(this).prop('id').split('_')[0];
				if (space_ids.includes(id)) {
					if (!schedule_id || schedule_id != $(this).find('.schedule_id').text()) { 
						if ($(this).hasClass('empty-box') || $(this).hasClass('ro-box') || $(this).hasClass('gray-box') || $(this).hasClass('green-box') || $(this).hasClass('blocked')) {
							valid_slot = false;
							return false; 
						}
					} 
				}
			});

			if (valid_slot) {
				html_str += '<option value="'+dayjs(t,'HH-mm').format('h:mm a')+'">'+dayjs(t,'HH-mm').format('h:mm a')+'</option>';
			}
		});

				$(modal+' .starttimes_list').html(html_str);

		if ((cur_start_time) && ($(modal+' .starttimes_list option[value="'+cur_start_time+'"]').length)) {
			$(modal+' .starttimes_list').val(cur_start_time); 
		}
	}
}

function get_slot_endtimes(mode='space') {

	return new Promise((resolve, reject) => {

		let modal = (mode == 'lesson') ? '#lesson_modal' : '#space_modal';
		let list = (mode == 'lesson') ? '.users_list' : '.spaces_list';

		let cur_finish_time = $(modal+' .endtimes_list').val(); 
		if ($(modal+' .endtimes_list').prop('dataset').cur_finish_time) {
			cur_finish_time = $(modal+' .endtimes_list').prop('dataset').cur_finish_time;
			$(modal+' .endtimes_list').removeAttr('data-cur_finish_time');
		}

		$('.endtimes_list').html('');
		$(modal+' .bookings_total').text('');
		$(modal+' .lessons_total').text('');

		clear_side_errors();

	    let errors = [];

		let space_ids = []; 
		let location_ids = []; 

		let start = $(modal+' .starttimes_list').val();

		$(modal+' '+list+' li').each(function() {
			let id = $(this).find('a').prop('dataset').intrac;
			if ($(this).hasClass('checked')) {
				if ($(this).find('a').hasClass('fullfield')) {
					space_ids = id.split(',');
				} else {
					space_ids.push(id);
				}

				let loc_id = $(this).find('a').prop('dataset').intrac_location_id;
				if ((loc_id > 0) && (!location_ids.includes(loc_id))) {
					location_ids.push(loc_id);
				}
			}
		});

		let schedule_id = $(modal+' .schedule_id').val(); 

		for (let i = 0; i < space_ids.length; i++) {
			let id = space_ids[i];

						let el = '#'+id+'_'+dayjs(start,'h:mm a').format('HH-mm');
			if (!schedule_id || schedule_id != $(el).find('.schedule_id').text()) { 
				if ($(el).hasClass('empty-box') || $(el).hasClass('ro-box') || $(el).hasClass('gray-box') || $(el).hasClass('green-box') || $(el).hasClass('blocked')) {
					if (!errors.length) {
						errors.push('Invalid start time. Please select another start time for your booking'); 
					}
				}
			}		
		}

		let location_id = $('#location_id').val();
		if ($('.admin-page').length && location_ids.length) { 
			location_id = location_ids[0];
		}

		let data = {
			location_id: location_id,
			space_ids: space_ids,
			date: $('#main_date').val(),
			start: parse_time(start),
			mode: mode
		};

		if (mode == 'lesson') {
			data.user_ids = space_ids;
		} else {
			data.space_ids = space_ids;
		}

		if ($('#location_id').prop('dataset').intrac_combo) {
			data.space_ids = data.space_ids[0].split('-');
			data.combo_name = $('#location_id').prop('dataset').intrac_combo;
		}

		if (!$('.admin-page').length) {
			data.from == 'customer'
		}

		if (schedule_id) {
			data.schedule_id = schedule_id; 
		}


	    if ((mode == 'space') && (!data.space_ids.length)) {
	    	errors.push('Please select one or more '+$('#space_title').val()+'s from '+$(modal+' .spaces_list_div .space-title').text()+' section');
	    }

	    if ((mode == 'lesson') && (!data.user_ids.length)) {
	    	errors.push('Please select one or more instructors from Select Instructor section');
	    }

	    if (!isvalidTime(data.start)) {
	    	errors.push('Please select a valid start time');
	    }

	    if ($('.admin-page').length && (location_ids.length > 1)) {
	    	errors.push('Selecting  '+$('#space_title').val()+'s from multiple locations is not allowed');
	    }

		if (errors.length == 0) {

	    	$('#loader-wrapper').show();
		    $.ajax({
		        type: 'GET',
		        url: '/api/getSlotEndTimes',
		        data: data,
		        dataType: 'JSON'
		    }).done(function( response ) {

		        if (response.success != undefined) {

		            $('#loader-wrapper').hide();

		            let res = response.success;

		            let res_data = res.data;

		            if (res_data.length) {
						let html_str = '';
						for (let i = 0; i < res_data.length; i++) {
							html_str += '<option value="'+convert_time(res_data[i],'h:mm a')+'">'+convert_time(res_data[i],'h:mm a')+'</option>';
						}
						$(modal+' .endtimes_list').html(html_str);

						if (mode == 'space') {
							if ((cur_finish_time) && ($(modal+' .endtimes_list option[value="'+cur_finish_time+'"]').length)) {
								$(modal+' .endtimes_list').val(cur_finish_time); 
							} else {
								if ($('.admin-page').length) {
									let onehr_finish_time = dayjs(data.date+' '+data.start).add(1, 'hour').format('h:mm a');
									let slot_finish_time = dayjs(data.date+' '+data.start).add($('#spaces table').prop('dataset').intrac_interval, 'minute').format('h:mm a');
									if ($(modal+' .endtimes_list option[value="'+onehr_finish_time+'"]').length) {
										$(modal+' .endtimes_list').val(onehr_finish_time); 
									} else if ($(modal+' .endtimes_list option[value="'+slot_finish_time+'"]').length) {
										$(modal+' .endtimes_list').val(slot_finish_time); 
									} else {
									}

								} else {
								}
							}
							$(modal+' .endtimes_list').change(); 
						} else if (mode == 'lesson') {
							$(modal+' .passes_list').change(); 
						}

								            } else {
		            	set_side_error('Invalid booking time. Please select another start time for your booking'); 
		            }

		        } else if (response.redirect != undefined) {
		            mini_login_wizard(response.redirect); 
		        } else {    
		            set_side_error(response.error.join("<br>"));
		            $('#loader-wrapper').hide();
		        }
		        resolve();

		    }).fail( function(xhr, textStatus, errorThrown) {
		        set_side_error("Operation failed " + (xhr.responseText?xhr.responseText:''));
		        $('#loader-wrapper').hide();
		        resolve();
		    });	
		} else {
			set_side_error(errors.join("<br>"));
			resolve();
		}
	});	
}

async function get_lesson_passtypes() {

	$('#lesson_modal .passes_list').html('');

    let errors = [];

    let customer_id = $('#lesson_modal .customers_list').val();
	let user_id = $('#lesson_modal .users_list li.checked a').prop('dataset').intrac;

	let data = {
		user_id: user_id,
		level_type: 7
	};

	if (!$('.admin-page').length) {
		data.from == 'customer'
	}

	let sd = '';
	if ($('#lesson_modal .schedule_data').text()) {
		sd = JSON.parse($('#lesson_modal .schedule_data').text());
	}


	if (!data.user_id) {
		errors.push('Please select an instructor'); 
	}

	if (errors.length == 0) {

    	$('#loader-wrapper').show();
	    $.ajax({
	        type: 'GET',
	        url: '/api/getPasstypes',
	        data: data,
	        dataType: 'JSON'
	    }).done(function( response ) {

	        if (response.success != undefined) {

	            $('#loader-wrapper').hide();

	            let res = response.success;

	            let data = res.data;

				let html_str = '';

	            let cust_passes = $('#cust_passes').text() ? JSON.parse(decryptData($('#cust_passes').text())) : [];

	            cust_passes.sort((a, b) => dayjs(a.expires).isAfter(dayjs(b.expires)) ? 1 : -1);

				for (let i = 0; i < cust_passes.length; i++) {
					let l = cust_passes[i];
					if ((l.level_type == 7) && (l.user_id == 0 || l.user_id == user_id || l.pass_id == sd.pass_id) && 
						(l.customer_id == customer_id) && (l.remaining>0 || l.pass_id == sd.pass_id) && 
						(dates_diff(l.expires,dayjs().format('YYYY-MM-DD')) >= 0) && (l.hold=='0000-00-00')) {
						html_str += '<option value="'+l.passtype_id+'" data-intrac_pass_id="'+l.pass_id+'" data-intrac_rate="0" data-intrac_duration="'+l.gst+'">'+l.passtype_name+' ('+l.remaining+' lessons remaining. Expiry: '+convert_date(l.expires)+')</option>';
					}
				}

				for (let i = 0; i < data.length; i++) {
					let l = data[i];
					html_str += '<option value="'+l.passtype_id+'" data-intrac_rate="'+l.cost+'" data-intrac_duration="'+l.gst+'">'+l.passtype_name+'</option>';
				}					

				$('#lesson_modal .passes_list').html(html_str);
				if (html_str) {
					if (sd.pass_id) { 
						let ptyp_id = $('#lesson_modal .passes_list option[data-intrac_pass_id="'+sd.pass_id+'"]').val();
						if (ptyp_id > 0) {
							$('#lesson_modal .passes_list').val(ptyp_id);	
						}
					} else {
						$('#lesson_modal .passes_list').val($('#lesson_modal .passes_list option:first').val());
					}
					$('#lesson_modal .passes_list').change()
				} else {
					set_side_error('No '+($('#pass_title').val() == 'pass' ? 'passes' : $('#pass_title').val()+'s')+' available. Please select another instructor for your lesson'); 
				}

	        } else if (response.redirect != undefined) {
	            mini_login_wizard(response.redirect); 
	        } else {    
	            set_side_error(response.error.join("<br>"));
	            $('#loader-wrapper').hide();
	        }

	    }).fail( function(xhr, textStatus, errorThrown) {
	        set_side_error("Operation failed " + (xhr.responseText?xhr.responseText:''));
	        $('#loader-wrapper').hide();
	    });	
	} else {
		set_side_error(errors.join("<br>"));
	}
}

function get_booking_details_data() {
	let booking_details = [];
	$('#space_modal .booking_details_inp_rate:visible').each(function() {
		let rate_n = $(this).val();
		if (rate_n.toLowerCase == 'no') {
			rate_n = 0
		} else if (rate_n.toLowerCase == 'yes') {
			rate_n = 1
		} else if (validator.isInt(rate_n)) {
			rate_n = parseInt(rate_n);
		} else {
			rate_n = 0;
		}

		booking_details.push({
			rate_id: $(this).prop('dataset').intrac_rate_id,
			rate_n: rate_n
		})
	});

	return booking_details;
}

function reset_special_rates_usage() {
    let j = JSON.parse(decryptData($('#special_rates_usage').text()));
    j.front_end = j.back_end;
    $('#special_rates_usage').text(encryptData(JSON.stringify(j)));
}

function calcSpecialRates(baseRate, bookingItem, promos=true) {
    let special_rates = JSON.parse(decryptData($('#special_rates').text())).rates;
    let special_rates_usage = JSON.parse(decryptData($('#special_rates_usage').text())).front_end;

    let cust_passtype_ids = [];
    let cust_passtype_ids_monthly = [];
    let cust_passes = $('#cust_passes').text() ? JSON.parse(decryptData($('#cust_passes').text())) : [];
    for (let i = 0; i < cust_passes.length; i++) {
        let l = cust_passes[i];
        if ((dates_diff(l.expires,dayjs().format('YYYY-MM-DD')) >= 0) && (l.hold=='0000-00-00') && (l.receipt_type != 1) && (l.customer_id == bookingItem.customer_id) &&
            (((l.level_type == 7) && (l.remaining>0)) || (l.level_type != 7))) {
            cust_passtype_ids.push(l.passtype_id.toString());
            if (l.monthly == 1) {
                cust_passtype_ids_monthly.push(l.passtype_id.toString());
            }
        }
    }

    let cust_level_id = (JSON.parse($('#cust_level_ids').text() || '{}')[bookingItem.customer_id] || 0).toString();

    let cust_organisation = $('#cust_organisation').text();
    let cust_details = JSON.parse($('#cust_details').text() || '{}')[bookingItem.customer_id] || {};

    let cust_rate = (validator.isFloat($('#cust_rate').text()) && ($('#cust_rate').text() != 0)) ? parseFloat($('#cust_rate').text()) : '';
    let cust_rate_type = $('#cust_rate_type').text();

    let promo_code = $('.promo_code:disabled').val();

    let recalc_register = false;

    let variation = null;

    let srDescription = '';
    let promoApplied = false;

    let cust_rate_applied = false;
    if (cust_rate && cust_rate_type && (bookingItem.mode == 'space')) {
        if (cust_rate_type == 'discount') {
            baseRate = baseRate*(1-(cust_rate/100));
        } else if (cust_rate_type == 'premium') {
            baseRate = baseRate*(1+(cust_rate/100));
        } else { 
            if (isvalidTime(bookingItem.start) && isvalidTime(bookingItem.finish)) {
                baseRate = cust_rate*(times_diff(bookingItem.finish,bookingItem.start)/60);
            }
        }
        baseRate = numberformat(baseRate);
        cust_rate_applied = true;
    }

    for (let i = 0; i < special_rates.length; i++) {
        let sr = special_rates[i];

        if (promos || (!promos && !sr.promo_code)) {

            if (!sr.modes || (sr.modes.includes(bookingItem.mode))) {

                let variation_i = 0;

                let passed = false;

                if (!sr.conditions || !sr.conditions.length) {
                    passed = true;
                } else {
                    for (let t = 0; t < sr.conditions.length; t++) {
                        let c = sr.conditions[t];

                        let key = sr.conditions[t].key;

                        passed = false;

                        if (key == 'location_ids') {
                            if ((!c.exclude && c.list.includes(bookingItem.location_id)) || (c.exclude && !c.list.includes(bookingItem.location_id))) {
                                passed = true;
                            }
                        }

                        if (key == 'space_ids') {
                            if ((!c.exclude && c.list.includes(bookingItem.space_id)) || (c.exclude && !c.list.includes(bookingItem.space_id))) {
                                passed = true;
                            }
                        }

                        if (key == 'customer_ids') {
                            if ((!c.exclude && c.list.includes(bookingItem.customer_id)) || (c.exclude && !c.list.includes(bookingItem.customer_id))) {
                                passed = true;
                            }
                        }

                        if (key == 'passtype_ids') {
                            if (c.list == 'all') {
                                if ((!c.exclude && cust_passtype_ids.length) || (c.exclude && !cust_passtype_ids.length)) {
                                    passed = true;
                                }
                            } else if (c.list == 'monthly') {                           
                                if ((!c.exclude && cust_passtype_ids_monthly.length) || (c.exclude && !cust_passtype_ids_monthly.length)) {
                                    passed = true;
                                }
                            } else {                            
                                if ((!c.exclude && c.list.some(el => cust_passtype_ids.includes(el))) || (c.exclude && !c.list.some(el => cust_passtype_ids.includes(el)))) {
                                    passed = true;
                                }
                            }
                        }

                        if (key == 'level_ids') {
                            if (c.list == 'all') {
                                if ((!c.exclude && (cust_level_id > 0)) || (c.exclude && !(cust_level_id > 0))) {
                                    passed = true;
                                }
                            } else {                            
                                if ((!c.exclude && c.list.includes(cust_level_id)) || (c.exclude && !c.list.includes(cust_level_id))) {
                                    passed = true;
                                }
                            }
                        }

                        if (key == 'class_ids') {
                            if ((!c.exclude && c.list.includes(bookingItem.class_id)) || (c.exclude && !c.list.includes(bookingItem.class_id))) {
                                passed = true;
                            }
                        }

                        if (key == 'program_ids') {
                            if ((!c.exclude && c.list.includes(bookingItem.program_id)) || (c.exclude && !c.list.includes(bookingItem.program_id))) {
                                passed = true;
                            }
                        }

                        if (key == 'class_level_ids') {
                            if ((!c.exclude && c.list.includes(bookingItem.class_level_id)) || (c.exclude && !c.list.includes(bookingItem.class_level_id))) {
                                passed = true;
                            }
                        }

                        if (key == 'class_level_types') {
                            if ((!c.exclude && c.list.includes(bookingItem.level_type)) || (c.exclude && !c.list.includes(bookingItem.level_type))) {
                                passed = true;
                            }
                        }

                        if (key == 'days') {
                            if (isvalidDate(bookingItem.date)) {
                                let day = bookingItem.day || dayjs(bookingItem.date).format('ddd');
                                if ((!c.exclude && c.list.includes(day)) || (c.exclude && !c.list.includes(day))) {
                                    passed = true;
                                }
                            }
                        }

                        if (key == 'dates') {
                            if (isvalidDate(bookingItem.date)) {
                                let d_between = (dates_diff(bookingItem.date, c.start) >= 0) && (dates_diff(c.finish, bookingItem.date) >= 0);
                                if ((!c.exclude && d_between) || (c.exclude && !d_between)) {
                                    passed = true;
                                }
                            }
                        }

                        if (key == 'times') {
                            if (isvalidTime(bookingItem.start) && isvalidTime(bookingItem.finish)) {
                                let t_between = times_isbetween(bookingItem.start, c.start, c.finish) && times_isbetween(bookingItem.finish, c.start, c.finish); 
                                let t_overlap = times_isbetween(bookingItem.start, c.start, c.finish,'[)') || times_isbetween(bookingItem.finish, c.start, c.finish, '(]'); 
                                if ((!c.exclude && (t_between || (c.partial_match && t_overlap))) || 
                                    (c.exclude && !(t_between || (c.partial_match && t_overlap)))) {
                                    if ((c.dst == undefined) || (c.dst && isDSTAus(bookingItem.date)) || (!c.dst && !isDSTAus(bookingItem.date))) {
                                        passed = true;
                                    }
                                }
                            }
                        }

                        if (key == 'duration') {
                            if (isvalidTime(bookingItem.start) && isvalidTime(bookingItem.finish)) {
                                let duration = times_diff(bookingItem.finish,bookingItem.start);
                                if (((c.operator == 'greater') && (duration >= c.mins)) || ((c.operator == 'lesser') && (duration <= c.mins)) || ((c.operator == 'equal') && (duration == c.mins))) {
                                    passed = true;
                                }
                            }
                        }

                        if (key == 'organisation') {
                            if (c.list == 'all') {
                                if ((!c.exclude && cust_organisation) || (c.exclude && !cust_organisation)) {
                                    passed = true;
                                }
                            } else {
                                if ((!c.exclude  && c.list.includes(cust_organisation)) || (c.exclude && !c.list.includes(cust_organisation))) {
                                    passed = true;
                                }
                            }
                        }

                        if (key == 'details') {
                            let cust_details_field = (cust_details[c.field] || '').toString();
                            if (c.list == 'all') {
                                if ((!c.exclude && cust_details_field) || (c.exclude && !cust_details_field)) {
                                    passed = true;
                                }
                            } else {
                                if ((!c.exclude  && c.list.includes(cust_details_field)) || (c.exclude && !c.list.includes(cust_details_field))) {
                                    passed = true;
                                }
                            }
                        }

                        if (key == 'n_spaces') {
                            if (bookingItem.n_spaces) {
                                if (((c.operator == 'greater') && (bookingItem.n_spaces > c.number)) || ((c.operator == 'lesser') && (bookingItem.n_spaces < c.number)) || ((c.operator == 'equal') && (bookingItem.n_spaces == c.number))) {
                                    passed = true;
                                }
                            }
                        }

                        if (key == 'n_schedules') {
                            if (bookingItem.n_schedules) {
                                if (((c.operator == 'greater') && (bookingItem.n_schedules > c.number)) || ((c.operator == 'lesser') && (bookingItem.n_schedules < c.number)) || ((c.operator == 'equal') && (bookingItem.n_schedules == c.number))) {
                                    passed = true;
                                }
                            }
                        }

                        if (!passed) {
                            break; 
                        }
                    }
                }

                if (bookingItem.combo_name && !sr.include_combo) {
                    passed = false;
                }

                if (cust_rate_applied && !sr.include_custom_rate_customers) {
                    passed = false;
                }

                if (sr.existing_customers_only) {
                    if ((bookingItem.mode == 'space') && !special_rates_usage.customer.existing_booking) {
                        passed = false;
                    }
                    if ((bookingItem.mode == 'lesson') && !special_rates_usage.customer.existing_lesson) {
                        passed = false;
                    }
                    if ((bookingItem.mode == 'class') && !special_rates_usage.customer.existing_class) {
                        passed = false;
                    }                                       
                }

                if (sr.new_customers_only) {
                    if ((bookingItem.mode == 'space') && special_rates_usage.customer.existing_booking) {
                        passed = false;
                    }
                    if ((bookingItem.mode == 'lesson') && special_rates_usage.customer.existing_lesson) {
                        passed = false;
                    } 
                    if ((bookingItem.mode == 'class') && special_rates_usage.customer.existing_class) {
                        passed = false;
                    }                                       
                }

                if (sr.promo_code && (promo_code != sr.promo_code)) {
                    passed = false;
                }

                if ((bookingItem.mode == 'class') && (sr.register_class_only || sr.register_program_only || sr.register_schedule_only || sr.register_team_only || sr.register_fixture_only)) {
                    let allowed_registers = [];
                    if (sr.register_class_only) {
                        allowed_registers.push('class');
                    }
                    if (sr.register_program_only) {
                        allowed_registers.push('program');
                    }
                    if (sr.register_schedule_only) {
                        allowed_registers.push('schedule');
                    }
                    if (sr.register_team_only) {
                        allowed_registers.push('competition');
                    }
                    if (sr.register_fixture_only) {
                        allowed_registers.push('fixture');
                    }
                    if (!allowed_registers.includes(bookingItem.register_mode)) {
                        passed = false;
                    }
                }

                if ((bookingItem.mode == 'class') && (sr.multi_registers > 0)) {
                	sr.multi_registers = recalc_register ? parseInt(sr.multi_registers) : parseInt(sr.multi_registers)-1;
                    if (!(special_rates_usage.multi_regs?.[sr.sr_id]?.[bookingItem.term_id] >= sr.multi_registers)) {
                        passed = false;
                    }
                }

                if (bookingItem.mode == 'purchase') {
                	if ((bookingItem.product_id == 14) || (bookingItem.product_id == 7)) {
                		passed = false;
                	}
                }

                if (sr.max) {

                                        let obj_ = null
                    let key_ = sr.promo_code || sr.description;

                    if (!sr.max_per) {
                        obj_ = special_rates_usage.client;
                    } else if (sr.max_per == 'day') {
                        obj_ = special_rates_usage.client_day;
                    } else if (sr.max_per == 'customer') {
                        obj_ = special_rates_usage.customer;
                    } else if (sr.max_per == 'customer_day') {
                        obj_ = special_rates_usage.customer_day;
                    }

                                        let usage = obj_[key_];

                    if (sr.max_per && sr.max_per.includes('day') && isJSON(JSON.stringify(usage))) {
                        if (bookingItem.date) {
                            usage = usage[bookingItem.date];
                        } else {
                            usage = undefined;
                        }
                    }

                    if ((usage === undefined) || (usage+1 > sr.max) || (bookingItem.item_unselected)) { 
                        passed = false;
                    }  

                    if (passed) {
                        special_rates_usage.client[key_]++;
                        special_rates_usage.customer[key_]++;

                                                if (bookingItem.date) {
                            special_rates_usage.client_day[key_][bookingItem.date]++;
                            special_rates_usage.customer_day[key_][bookingItem.date]++;
                        }
                    }
                }

                if (passed) {
                    if (sr.type == 'rate') {
                        if ((sr.per == 'hr') && isvalidTime(bookingItem.start) && isvalidTime(bookingItem.finish)) {
                            sr.amount = sr.amount*(times_diff(bookingItem.finish,bookingItem.start)/60);
                        }
                        if (sr.rate_id) {
                            if (bookingItem.booking_details) {
                                for (let j = 0; j < bookingItem.booking_details.length; j++) {
                                    let bi = bookingItem.booking_details[j];
                                    if (bi.rate_id == sr.rate_id) {
                                        baseRate += bi.rate_n*sr.amount; 
                                    }                               
                                }
                            }
                        } else {
                            if (sr.rate_addon) {
                                baseRate += sr.amount; 
                            } else {
                                baseRate = sr.amount; 
                            }
                        }
                        if (sr.description) {
                            srDescription = srDescription ? srDescription+', '+sr.description : sr.description;    
                        }
                    } else { 
                        variation_i = sr.percentage ? baseRate*(sr.amount/100) : sr.amount;

                        if ((sr.per == 'hr') && isvalidTime(bookingItem.start) && isvalidTime(bookingItem.finish) && !sr.percentage) {
                            variation_i = variation_i*(times_diff(bookingItem.finish,bookingItem.start)/60);
                        }

                        if ((variation_i < variation) || (variation === null)) { 
                            variation = variation_i;
                            srDescription = sr.description || '';
                            promoApplied = (sr.promo_code && (promo_code == sr.promo_code)) ? true : false;
                        }
                    }           
                }
            }

        } 
    } 

    if (variation === null) { 
        variation = 0;
    } else {
    	if ((bookingItem.mode == 'class') && (bookingItem.register_mode == 'schedule')) {
    		variation = numberformat(bookingItem.n_schedules*variation);
    	}
    }

    $('#special_rates_usage').text(encryptData(JSON.stringify({
        back_end: JSON.parse(decryptData($('#special_rates_usage').text())).back_end,
        cart: JSON.parse(decryptData($('#special_rates_usage').text())).cart,
        front_end: special_rates_usage
    })));

    return {
        adjustedRate: numberformat(baseRate+variation < 0 ? 0 : baseRate+variation),
        discountApplied: numberformat(baseRate+variation < 0 ? baseRate : 0-variation),
        srDescription: srDescription,
        promoApplied: promoApplied
    }; 
}

function calculate_slotrates() {
	let start = parse_time($('#space_modal .starttimes_list').val());
	let finish = parse_time($('#space_modal .endtimes_list').val());

	let n_spaces = $('#space_modal .spaces_list li.checked').length;

	let n_spaces_shadow = $('#space_modal .shadow_spaces_num').val();
	n_spaces = (n_spaces_shadow > 1) ? n_spaces_shadow : n_spaces;

	let type = ($('#space_modal .spaces_list li.checked .fullfield').length) ? 'fullfield' : 'normal';

	if (type == 'fullfield') {
		n_spaces = 1;
	}

	let location_id = $('#space_modal .spaces_list li.checked:first a').prop('dataset').intrac_location_id;

	if (isvalidTime(start) & isvalidTime(finish)) {

		let total_aud = 0;

		let baseRate = calcSlotRates(start, finish, type, location_id);

        if ($('.admin-page').length && ($('#space_modal .customers_list').val() == 2)) {
            baseRate = 0;
        }		

		let rate_data = {items: []}; 

		let booking_details = get_booking_details_data();

		reset_special_rates_usage(); 

        $('.admin-page .offcanvse .promo_comment').html('').addClass('noshow');
        let discountApplied = 0;
        let srDescription = '';
        let promoApplied = false;		

				for (let y = 0; y < n_spaces; y++) {

			let bookingItem = {
				mode: 'space',
				location_id: location_id,
				customer_id: $('#space_modal .customers_list').val(),
				date: $('#main_date').val(),
				start: start,
				finish: finish,
				space_id: $('#space_modal .spaces_list li.checked').eq(y).length ? $('#space_modal .spaces_list li.checked').eq(y).find('a').prop('dataset').intrac : "0", 
				n_spaces: n_spaces,
				combo_name: $('#location_id').prop('dataset').intrac_combo || ''
			}

			if (booking_details.length) {
				bookingItem.booking_details = booking_details;
			}

			if (JSON.stringify(JSON.parse(decryptData($('#hours').text()))[bookingItem.location_id]).includes('Hol')) {
				bookingItem.day = 'Hol';
			};

			let promos = $('.admin-page').length ? true : false;

			let csr = calcSpecialRates(baseRate, bookingItem, promos);

			total_aud += csr.adjustedRate;

            discountApplied += csr.discountApplied;
            srDescription = csr.srDescription;

                        if (csr.promoApplied) {
                promoApplied = true;
            }

			rate_data.items.push({
				baseRate: baseRate,
				adjustedRate: csr.adjustedRate, 
				bookingItem: bookingItem
			});
		}

		if ($('.admin-page').length) {
			let purchs = [];
			$('#space_modal .booking_addons').each(function() {
				if ($(this).is(":checked")) {

					let baseRate = numberformat(n_spaces*(parseFloat($(this).prop('dataset').intrac_price)));

					let bookingItem = {
						mode: 'purchase',
						customer_id: $('#customer_id').val()
					}

		            let csr = calcSpecialRates(baseRate, bookingItem);

		            total_aud += csr.adjustedRate;

		            discountApplied += csr.discountApplied;
		            srDescription = csr.srDescription;

		            		            if (csr.promoApplied) {
		                promoApplied = true;
		            }

					purchs.push('Purchase: '+(n_spaces > 1 ? n_spaces+' x ' : '')+$(this).prop('dataset').intrac_product_details+' - '+numberformatccy(baseRate));		            
				}
			});
			$('#space_modal .purchases_list').text(purchs.join('<br>'));

			adjust_promo_comment(discountApplied, srDescription, promoApplied);

			if ($('#space_modal .schedule_data').text()) {
				let sd = JSON.parse($('#space_modal .schedule_data').text());

				$('#space_modal .cur_bookings_total').text(' (Current: '+numberformatccy(sd.amount)+')');

				if ($('#space_modal .cost_aud').is(":visible") && (sd.amount != total_aud))  {
					$('#space_modal .cost_aud').val(sd.amount);
				}
			}
		}

		total_aud = numberformat(total_aud);

		$('#space_modal .bookings_total').text(numberformatccy(total_aud));
		$('#space_modal .total_aud').val(total_aud);
		$('#space_modal .rate_data').text(encryptData(JSON.stringify(rate_data)));
	} else {
		$('#space_modal .bookings_total').text('');
		$('#space_modal .total_aud').val(0);
		$('#space_modal .rate_data').text('');
	}
}

function calcSlotRates(startTime, endTime, type='normal', location_id) {
	let rates = JSON.parse(decryptData($('#hours').text()))[location_id];
    let totalCost = 0;
    let start = dayjs(startTime, 'HH:mm:ss');
    let end = dayjs(endTime, 'HH:mm:ss');

    rates.forEach(rate => {
        let rateStart = dayjs(rate.hours_start, 'HH:mm:ss');
        let rateEnd = dayjs(rate.hours_finish, 'HH:mm:ss');

        if ((type == 'normal' && rate.fullfield == 0) || (type == 'fullfield' && rate.fullfield == 1)) {
	        if (end.isAfter(rateStart) && start.isBefore(rateEnd)) {
	            let from = dayjs.max(start, rateStart);
	            let to = dayjs.min(end, rateEnd);
	            let hours = to.diff(from, 'hour', true);
	            totalCost += hours * rate.rate;
	        }
        }
    });

    return numberformat(totalCost);
}

function calculate_lessonrates() {

		let el = '#lesson_modal .passes_list option:selected';

	if ($(el).length) {

		let duration = $(el).prop('dataset').intrac_duration;

		let start = parse_time($('#lesson_modal .starttimes_list').val());
		let finish = dayjs(start, 'HH:mm:ss').add(duration, 'minute').format('h:mm a');

		$('#lesson_modal .endtimes_list option').prop('disabled', false); 

		$('#lesson_modal .endtimes_list').val(finish);

		$('#lesson_modal .endtimes_list option:not(:selected)').prop('disabled', true); 

		let total_aud = 0;

		let baseRate = numberformat(parseFloat($(el).prop('dataset').intrac_rate));

		let rate_data = {}; 

		reset_special_rates_usage(); 

        $('.admin-page .offcanvse .promo_comment').html('').addClass('noshow');
        let discountApplied = 0;
        let srDescription = '';
        let promoApplied = false;

		let bookingItem = {
			mode: 'lesson',
			location_id: $('#location_id').val(),
			customer_id: $('#lesson_modal .customers_list').val(),
			date: $('#main_date').val(),
			start: start,
			finish: parse_time(finish),
		}

		let promos = $('.admin-page').length ? true : false;

		let csr = calcSpecialRates(baseRate, bookingItem, promos);

		total_aud = csr.adjustedRate;

        discountApplied += csr.discountApplied;
        srDescription = csr.srDescription;

                if (csr.promoApplied) {
            promoApplied = true;
        }

		rate_data.item = {
			baseRate: baseRate,
			adjustedRate: csr.adjustedRate, 
			bookingItem: bookingItem
		};

		total_aud = numberformat(total_aud);

		if ($('.admin-page').length) {
			adjust_promo_comment(discountApplied, srDescription, promoApplied);
		}

		$('#lesson_modal .lessons_total').text(numberformatccy(total_aud));
		$('#lesson_modal .total_aud').val(total_aud);
		$('#lesson_modal .rate_data').text(encryptData(JSON.stringify(rate_data)));
	}
}

function check_promo_code() {

    	$('#loader-wrapper').show();

    let errors = [];

    let promo = $('.show-box .promo_code').val();

    let data = {promo: promo};

	if (!$('.admin-page').length) {
		data.from == 'customer'
	}

    if (isEmpty(promo)) {
        errors.push('Please enter a promo code and click add');
    }

    if (errors.length == 0) {
        $.ajax({
            type: 'GET',
            url: '/api/checkPromo',
            data: data,
            dataType: 'JSON'
        }).done(async function( response ) {

            if (response.success != undefined) {

                $('#loader-wrapper').hide();

            	$('.show-box .promo_code:visible').prop('disabled', true);
                $('.promo_check').hide();
                $('.promo_remove').show();

                let special_rates = JSON.parse(decryptData($('#special_rates').text())).rates;
                special_rates.push(response.success);
                $('#special_rates').text(encryptData(JSON.stringify({rates: special_rates})));

                if (!$('.admin-page').length) {
                	recalc_cart_rates();
                } else {
                	if ($('#lesson_modal').hasClass('show-box')) {
                		calculate_lessonrates();
                	} else if ($('#space_modal').hasClass('show-box')) {
                		calculate_slotrates();	
                	} else if ($(mc2).hasClass('modal-open')) {
                		calcRegisterCost();
                	}
                }

            } else if (response.redirect != undefined) {
                mini_login_wizard(response.redirect); 
            } else {
                set_side_error(response.error.join("<br>"));
                $('#loader-wrapper').hide();
            }

        }).fail( function(xhr, textStatus, errorThrown) {
            set_side_error("Operation failed " + (xhr.responseText?xhr.responseText:''));
            $('#loader-wrapper').hide();
        });	
    } else {
        set_side_error(errors.join("<br>"));
        $('#loader-wrapper').hide();
    }
}

function clear_promo_code(refresh=false) {
    $('.promo_code').val('');
    $('.promo_code').prop('disabled', false);
    $('.promo_check').show();
    $('.promo_remove').hide();
    clear_promo_special_rates();
    if (refresh) {
    	if (!$('.admin-page').length) {
    		init_payment(); 
    	} else {
        	if ($('#lesson_modal').hasClass('show-box')) {
        		calculate_lessonrates();
        	}  else if ($('#space_modal').hasClass('show-box')) {
        		calculate_slotrates();	
        	} else if ($(mc2).hasClass('modal-open')) {
        		calcRegisterCost();
        	}
    	}
    }
}

function clear_promo_special_rates() {
	if ($('#special_rates').text()) {
	    let special_rates = JSON.parse(decryptData($('#special_rates').text())).rates;

	    special_rates = special_rates.filter(item => item.promo_code == undefined);

	    $('#special_rates').text(encryptData(JSON.stringify({rates: special_rates})));
	}
}

function calcRegisterCost() {

    let el = mc2;

    if ($('#team_join').is(":visible")) {
    	el = '#team_join';
    }

    let class_data = JSON.parse($(el+' .cregister_class_id').find(':selected').prop('dataset').intrac);

    let prog_data = {};
    if ($(el+' .cregister_program_id:visible').length) {
        prog_data = JSON.parse($(el+' .cregister_program_id').find(':selected').prop('dataset').intrac);
    }

    let team_data = {};
    if ($(el+' .cregister_team_id:visible').length) {
        team_data = JSON.parse($(el+' .cregister_team_id').find(':selected').prop('dataset').intrac);
    } else if ($('#team_join').is(":visible")) {
    	team_data = JSON.parse($(el+' .cregister_team_id').find(':selected').prop('dataset').intrac);
    }

    let customer_id = ($(el+' input:radio[name="cregister_customer_id"]:checked').length) ? $(el+' input:radio[name="cregister_customer_id"]:checked').val() : '';

    if (class_data.bal_perc != undefined) {
        $(el+' .cregister_term_perc_msg').text(class_data.term_name+' is '+numberformat(100*(1-parseFloat(class_data.bal_perc)),0)+'% complete');
        $(el+' .cregister_term_perc_msg_tr').show();
    } else {
        $(el+' .cregister_term_perc_msg_tr').hide();
        $(el+' .cregister_term_perc_msg').text('');
    }

    $(el+' .cregister_schedule_past_showall').addClass('noshow');
    $(el+' .cregister_schedule_future_showall').addClass('noshow');
    $(el+' .flex_imp').removeClass('flex_imp');

        if ($(el+' .cregister_program_id').val()) {

        $(el+' .cregister_schedule_div').hide();

        $(el+' .cregister_schedule_id').each(function() {
            let sched_data = JSON.parse($(this).prop('dataset').intrac);
            if (sched_data.program_id == $(el+' .cregister_program_id').val()) {

                let el_ = $(this).closest('.cregister_schedule_div');

                $(el_).show();
                if (!$('.admin-page').length) {
                	$(el_).addClass('flex_imp');
                }

                if ($(el+' .cregister_schedule_past_showall').hasClass('noshow') && $(el_).hasClass('cregister_schedule_past') && $(el_).hasClass('noshow')) {
                    $(el+' .cregister_schedule_past_showall').removeClass('noshow');
                }
                if ($(el+' .cregister_schedule_future_showall').hasClass('noshow') && $(el_).hasClass('cregister_schedule_future') && $(el_).hasClass('noshow')) {
                    $(el+' .cregister_schedule_future_showall').removeClass('noshow');
                }
            }
        }); 

    } else {
        $(el+' .cregister_schedule_div').show();

        if ($(el+' .cregister_schedule_past.noshow').length) {
            $(el+' .cregister_schedule_past_showall').removeClass('noshow');
        }
        if ($(el+' .cregister_schedule_future.noshow').length) {
            $(el+' .cregister_schedule_future_showall').removeClass('noshow');    
        }
    }

    $(el+' .cregister_schedule_id:checked').each(function() {
    	if (!$(this).is(":visible")) {
    		$(this).prop('checked', false);
    	}
    });

	if ((class_data.level_type == 6) && ($(el+' .cregister_schedule_future_showall').is(":visible")) && (!$(el+' .cregister_schedule_id:visible').length)) {
		$(el+' .cregister_schedule_future_showall').click();
	}

    if ((class_data.level_type == 6) && (!$(el+' .cregister_schedule_id:visible:checked').length)) {
        $(el+' .cregister_schedule_id:visible:first').prop('checked', true);
    }

    if ($(el+' .cregister_team_id').val()) {
        $(el+' .cregister_fixture_id option[value!=""]').hide();
        $(el+' .cregister_fixture_id option[value!=""]').each(function() {
            let fixt_team_data = JSON.parse($(this).prop('dataset').intrac);
            if (fixt_team_data.team_id == $(el+' .cregister_team_id').val()) {
                $(this).show();
            }
        });
    }

    if ((prog_data.excl_today_cost) && (!$(el+' .cregister_schedule_id:visible:checked').length) && (!class_data.class_cost_flat)) {
        $(el+' .cregister_excl_today_cost_tr').show();
        $(el+' .cregister_excl_today_cost_val').text(numberformatccy(class_data.cost));        
    } else {
        $(el+' .cregister_excl_today_cost_tr').hide();
        $(el+' .cregister_excl_today_cost_val').text('');
        $(el+' .cregister_excl_today_cost').prop('checked', false);
    }

    if (((class_data.level_type == 0) || (class_data.level_type == 6)) && 
        (!$(el+' .cregister_pass_id:visible').val()) && 
        ($(el+' .cregister_quantity').prop('max') > 0)) {
        $(el+' .cregister_quantity_tr').show();
    } else {
        $(el+' .cregister_quantity_tr').hide();
    }

    let class_amount = parseFloat(class_data.cost);
    let amount = null;

    let register_mode = '';
    if ($(el+' .cregister_fixture_id').val()) {
        register_mode = 'fixture';
    } else if (team_data.class_id) {
        register_mode = 'competition';
    } else if ($(el+' .cregister_schedule_id:checked').length || (class_data.level_type == 6)) {
        register_mode = 'schedule';
    } else if (prog_data.class_id) {
        register_mode = 'program';
    } else {
        register_mode = 'class';
    }

    if ((class_data.level_type == 0) && (register_mode == 'program')) {
        prog_data = {};
        register_mode = 'class';
    }

    $(el+' .cregister_cost_calc').text('');
    $(el+' .cregister_per_player').removeClass('noshow');

    let team_payments = parseFloat($(el+' .cregister_team_payments').val());

    if (register_mode == 'fixture') { 

                if (class_data.special_cost > 0) {
            class_amount = parseFloat(class_data.special_cost);
        }        
        amount = class_amount;

        $(el+' .cregister_pass_id').val('');

        } else if (register_mode == 'competition') {

        if (class_data.features.includes('t')) { 
            amount = class_amount/team_data.players;
            if (team_payments >= class_amount) { 
                amount = 0;
            } else if (class_amount-team_payments < amount) { 
                amount = class_amount-team_payments;
            }
        } else {
            amount = class_amount;
        }

        if (team_data.manager) {
            amount = 0;
        }

    } else if (register_mode == 'schedule') { 

                if (class_data.special_cost > 0) {
            class_amount = parseFloat(class_data.special_cost);
        }        
        amount = $(el+' .cregister_schedule_id:checked').length*class_amount; 

        if (class_data.level_type == 1) {
            $(el+' .cregister_pass_id').val('');
        }

        } else if (register_mode == 'program') { 

            let schedules_remaining = parseInt(prog_data.schedules_remaining || '0');

        amount = (class_data.level_type == 0) ? class_amount : class_amount*schedules_remaining; 

        if ($(el+' .cregister_excl_today_cost:visible').length) {
            if ($(el+' .cregister_excl_today_cost').is(":checked")) {
                amount = amount - class_amount;
            }
        }

    } else { 
        if ((class_data.level_type == 0) && (class_data.bal_perc != undefined)) {
            let bal_perc = parseFloat(class_data.bal_perc);
            amount = class_amount*bal_perc; 
        }
    }

    let addons_amount = 0;

        let addons = []; 

    let purchases_addons = JSON.parse(decryptData($(el+' .cregister_purchases_addons').text()));
    $(el+' .register_addons:visible').each(function() {
        if (this.checked) {
            let addon = $(this).prop('dataset');
            let addon_amount = 0;
            let addon_qty = 1;
            let addon_mode = addon.intrac_mode;
            let addon_product_id = $(this).val();
            let addon_cust_list = purchases_addons[addon_product_id] ? purchases_addons[addon_product_id][customer_id] || [] : [];
            let valid = true; 

            let term_id = class_data.term_id;
            let term_start = class_data.term_start;

            if (register_mode == 'program') {
                term_id = prog_data.term_id;
                term_start = prog_data.term_start;
            } else if (register_mode == 'schedule') {
                $(el+' .cregister_schedule_id:visible').each(function(index) {
                    if (this.checked) {
                        let sched_data = JSON.parse($(this).prop('dataset').intrac);
                        term_id = sched_data.term_id;
                        term_start = sched_data.term_start;
                    }
                });
            }

            let term_year = dayjs(term_start).format('YYYY');

            if (addon_mode == 'annual') {
                if (addon_cust_list.includes(term_year)) {
                    valid = false;
                }
            } else if (addon_mode == 'term') {
                if (addon_cust_list.includes(term_id.toString())) {
                    valid = false;
                }
            } else if (addon_mode == 'customer') {
	            if (addon_cust_list.includes(customer_id.toString())) {
	                valid = false;
	            }
	        }

            if (valid) {
                if (($(this).closest('.register_addons_row').text().toLowerCase().includes('daily') || $(this).prop('dataset').intrac_product_details.toLowerCase().includes('daily'))) {
                    if (register_mode == 'schedule') {
                        addon_qty = $(el+' .cregister_schedule_id:checked').length;    
                    } else if (register_mode == 'program') {
                        let schedules_remaining = parseInt(prog_data.schedules_remaining || '0');
                        addon_qty = schedules_remaining;
                    }
                }
                addon_amount = numberformat(addon_qty*parseFloat($(this).prop('dataset').intrac_price));
                addons_amount += addon_amount;

                addons.push({
                    product_id: addon_product_id,
                    quantity: addon_qty,
                    total_aud: addon_amount
                });
            }
        }
    });

    if (amount !== null) {
        if ((class_data.class_cost_flat) && ((register_mode == 'class') || (register_mode == 'program'))) {    
            amount = class_amount;
        }

        $(el+' .cregister_receipt_invoice_comment').text('');
        let baseRate = amount;

        let rate_data = {}; 

        let discountApplied = 0;
        let srDescription = '';
        let promo_comment = '';
        let promoApplied = false;

        reset_special_rates_usage(); 

        let bookingItem = {
            mode: 'class',
            location_id: $('#location_id').val(),
            customer_id: ($(el+' input:radio[name="cregister_customer_id"]:checked').length) ? $(el+' input:radio[name="cregister_customer_id"]:checked').val() : '',
            class_id: $(el+' .cregister_class_id').val(),
            program_id: $(el+' .cregister_program_id').val(),
            level_type: class_data.level_type.toString(),
            class_level_id: class_data.level_id.toString(),
            term_id: class_data.term_id.toString(),
            register_mode: register_mode,
            n_schedules: $(el+' .cregister_schedule_id:checked').length
        }

        let csr = calcSpecialRates(baseRate, bookingItem, true);

        discountApplied += csr.discountApplied;
        srDescription = csr.srDescription;

        if (csr.promoApplied) {
            promoApplied = true;
        }

        amount = numberformat(csr.adjustedRate);

        if (discountApplied > 0) {
            let pc = 'Includes a '+(srDescription ? srDescription+' ' : '')+'discount of '+numberformatccy(discountApplied);
            if (promoApplied) {
                pc += ' (promo code '+$(el+' .promo_code').val()+' applied)';
            }
            promo_comment = pc;
        } else if (srDescription) {
            promo_comment = srDescription
        }

        $(el+' .cregister_receipt_invoice_comment').text(promo_comment); 

        let quantity = $(el+' .cregister_quantity').is(":visible") ? $(el+' .cregister_quantity').val() : 0;
        if ((quantity > 0) && (!class_data.class_qty_cost_flat)) {
            amount = amount*quantity;
        }

        amount = numberformat(numberformat(amount));
        addons_amount = numberformat(numberformat(addons_amount));

        if (class_data.pass_only == 1) {
            if (((class_data.level_type == 1) && (register_mode == 'program')) ||
                ((class_data.level_type == 6) && (register_mode == 'schedule')) ||
                ((class_data.level_type == 4) && (register_mode == 'competition'))) {
                amount = "N/A. Must be paid using customer's "+$('#pass_title').val();
            }
        }

        if ($(el+' .cregister_team_manager').is(":checked")) {
            amount = "N/A";
        }
        $(el+' .cregister_cost_calc').text(validator.isFloat(amount.toString()) ? numberformatccy(amount+addons_amount) : amount);

        rate_data.item = {
            baseRate: baseRate,
            bookingItem: bookingItem,
            register_mode:register_mode,
            addons: addons,
            addons_amount: addons_amount
        };

        $(el+' .rate_data').text(encryptData(JSON.stringify(rate_data)));
    } else {
        $(el+' .rate_data').text('');
    }

    if ($(el+' .cregister_pass_id:visible').val()) {
        let schedules = $(el+' .cregister_schedule_id:checked').length;
        let pass_remaining = $(el+' .cregister_pass_id').find(':selected').prop('dataset').intrac_remaining;
        let passtype_number = $(el+' .cregister_pass_id').find(':selected').prop('dataset').intrac_number;

        if ((pass_remaining < schedules) && (passtype_number != 0)) { 
            $(el+' .cregister_cost_calc').text("Not all bookings could be completed as insufficient credits remain in the selected "+$('#pass_title').val());
        } else {
            $(el+' .cregister_cost_calc').text("N/A. Paid using customer's "+$('#pass_title').val());
            $(el+' .cregister_per_player').addClass('noshow');
            $(el+' .cregister_receipt_invoice_comment').text(''); 
        }
    }
}

function reset_class_booking() {
	$(mc2+' .location_name').text($('#main_switch_location').find("[data-intrac='"+$('#location_id').val()+"'][data-intrac_combo='"+($('#location_id').prop('dataset').intrac_combo || '')+"']").text());
	$(mc2+' .rate_data').text('');
}

function init_cust_classes() {
	if (!$('.admin-page').length) { 
        open_side_modal('class_enrol');
        reset_class_booking();

        if ($(mc2+' .cregister_cust_list [name="cregister_customer_id"]').length) {
        	$(mc2+' .cregister_cust_list [name="cregister_customer_id"]:checked').change(); 
        } else {
        	set_side_error('No '+$('#class_title').val().toLowerCase()+' available for '+(JSON.parse($('#class_enrolment_titles').text()).title || 'enrolment')+($(mc2+' .add_child_btn').length ? '. Please add a child and re-try' : ''), 'amber');
        }

	} else {
		$(mc2+' .cregister_cust_list [name="cregister_customer_id"]:checked').change(); 
	}
}

function get_cust_classes() {

    $('#loader-wrapper').show();

    $(mc2+' .cregister_class_list').html('');
    $(mc2+' .cregister_program_list').html('');
    $(mc2+' .cregister_schedule_list').html('');
    $(mc2+' .cregister_team_list').html('');
    $(mc2+' .cregister_fixture_list').html('');
    $('.creg_class_comment').html(''); 
    $(mc2+' .cregister_excl_today_cost_tr').hide();
    $(mc2+' .cregister_excl_today_cost_val').text('');
    $(mc2+' .cregister_excl_today_cost').prop('checked', false);

    let customer_id = ($(mc2+' input:radio[name="cregister_customer_id"]:checked').length) ? $(mc2+' input:radio[name="cregister_customer_id"]:checked').val() : '';
    let cust_level_id = $(mc2+' .cregister_cust_list [name="cregister_customer_id"]:checked').closest('.cregister_cust_row').find('.level_id').text();
    let location_id = $('#location_id').val();

    let querydata = {customer_id: customer_id, cust_level_id: cust_level_id, location_id: location_id};

    if (!$('.admin-page').length) {
        querydata.from == 'customer'
    }

    $.ajax({
        type: 'GET',
        url: '/api/getClasss',
        data: querydata,
        dataType: 'JSON'
    }).done(function( response ) {

        if (response.success != undefined) {

            $('#loader-wrapper').hide();

            let res = response.success;

            let data = res.data;

            let html_str_ = '';

            if ($('.customer-page').length) {
            	let searchParams = new URLSearchParams(window.location.search);
            	let enrol_ids = searchParams.has('enrol') ? searchParams.get('enrol') : '';

            	for (let i = 0; i < data.length; i++) {
            		let d = data[i];
            		if (d.features.includes('4')) {
            			if (enrol_ids.split('~')[0] != d.class_id) {
            				data.splice(i, 1); 
                            i--; 
            			}
            		}
            	}
            }

            if (data.length) {
                html_str_ += '<select class="form-control cregister_class_id">';
                for (let i = 0; i < data.length; i++) {
                    let d = data[i];

                    let data_intrac = {
                        level_id: d.level_id,
                        level_type: d.level_type,
                        pass_only: d.pass_only,
                        term_id: d.term_id,
		                term_start: d.term_start,
		                term_finish: d.term_finish,
                        cost: d.cost,
                        special_cost: d.special_cost,
                        features: d.features,
                        location_id: d.location_id
                    };
                    if (d.bal_perc != undefined) {
                        data_intrac.bal_perc = d.bal_perc;
                        data_intrac.term_name = d.term_name;
                    }
                    if (d.class_cost_flat) {
                        data_intrac.class_cost_flat = 1;
                    }
                    if (d.class_qty_cost_flat) {
                        data_intrac.class_qty_cost_flat = 1;
                    }
                    let full = '';
                    if (d.full) {
                    	full = ' (capacity reached)';
                    } else if (validator.isInt((d.vacancy||'').toString())) { 
						full += ' '+d.vacancy+' spot'+(d.vacancy > 1 ? 's' : '');
					}                    
                    html_str_ += '<option value="'+d.class_id+'" data-intrac="'+JSON.stringify(data_intrac).replace(/"/g, '&quot;')+'">'+d.class_name+' - '+d.term_name+full+'</option>';
                }
                html_str_ += '</select>';
            } else {
            	if ($('.admin-page').length) {
            		html_str_ += 'No '+$('#class_title').val().toLowerCase()+' available for '+(JSON.parse($('#class_enrolment_titles').text()).title || 'enrolment')+'. You may need to assign the customer to a level or set up a '+$('#class_title').val().toLowerCase();
            	} else {
            		html_str_ += 'No '+$('#class_title').val().toLowerCase()+' available for '+(JSON.parse($('#class_enrolment_titles').text()).title || 'enrolment');
            	}
            	$(mc2+' .cregister_cost_calc').text('');
            }               

            $(mc2+' .cregister_class_list').html(html_str_);

            if ($('#cregister_deeplinks').text()) {
                let ids = $('#cregister_deeplinks').text().split('~');
                if ($(mc2+' .cregister_class_id option[value="'+ids[0]+'"]').length) {
                    $(mc2+' .cregister_class_id').val(ids[0]);
                }
                if ((ids[1] == 0) && (ids[2] == 0) && (ids[3] == 0)) {
                    if ($('.admin-page').length) {
                    	$('#cregister_deeplinks').text(''); 
                    }
                }
            }

            $(mc2+' .cregister_class_id').change(); 

        } else if (response.redirect != undefined) {
            mini_login_wizard(response.redirect); 
        } else {    
            set_side_error(response.error.join("<br>"));
            $('#loader-wrapper').hide();
        }

    }).fail( function(xhr, textStatus, errorThrown) {
        set_side_error("Operation failed " + (xhr.responseText?xhr.responseText:''));
        $('#loader-wrapper').hide();
    });    
}

function get_cust_class_passs() {

    let el = mc2;

    if ($('#team_join').is(":visible")) {
        el = '#team_join';
    }

        let customer_id = ($(el+' input:radio[name="cregister_customer_id"]:checked').length) ? $(el+' input:radio[name="cregister_customer_id"]:checked').val() : '';
    let class_data = JSON.parse($(el+' .cregister_class_id').find(':selected').prop('dataset').intrac);

    let register_mode = ($(el+' .cregister_schedule_id:visible:checked').length) ? 'schedule': '';

    let valid_options = false;
    let first_valid_option = '';

    if ((class_data.level_type == 1) || (class_data.level_type == 6) || (class_data.level_type == 4)) {
        $(el+' .cregister_cpass_list_tr').show();
        $(el+' .cregister_pass_id option[value!=""]').each(function() {
            let d = $(this).prop('dataset');
            if ((d.intrac_customer_id == customer_id) && 
                ((d.intrac_level_id == class_data.level_id) || ((register_mode == 'schedule') && (d.intrac_level_id == 0))) &&  
                ((d.intrac_remaining > 0) || (d.intrac_number == 0))) {
                $(this).show();
            	valid_options = true;
            	if (!first_valid_option) {
            		first_valid_option = $(this).val();
            	}
            } else {
                $(this).hide();
            }
        });

        if (!valid_options) {
        	$(el+' .cregister_cpass_list_tr').hide();
        }
    } else {
        $(el+' .cregister_cpass_list_tr').hide();
    }

    if (first_valid_option) {
    	$(el+' .cregister_pass_id').val(first_valid_option).change();
    } else if ($(el+' .cregister_pass_id').val()){
    	$(el+' .cregister_pass_id').val('').change(); 
    } else {
    	$(el+' .cregister_pass_id').val(''); 
    }
}

function get_cust_class_addons() {

	let el = mc2;

	$(el+' .register_addons_row').addClass('noshow');

	let location_id = $('#location_id').val();
	let class_data = JSON.parse($(el+' .cregister_class_id').find(':selected').prop('dataset').intrac);

	$(el+' .register_addons_row .register_addons').each(function() {
		let loc_id = $(this).prop('dataset').intrac_location_id;
		let optional = $(this).prop('dataset').intrac_optional;

		let location_check = (!loc_id || ((loc_id > 0) && (loc_id == location_id)));
		let class_check = (!optional && class_data.features.includes('m')) || (optional && class_data.features.includes('a'));

		if (location_check && class_check) { 
			$(this).closest('.register_addons_row').removeClass('noshow');
		}
	});

	if ($(el+' .register_addons_row:not(.noshow)').length) {
		$(el+' .cregister_class_addons_tr').removeClass('noshow');
	} else {
		$(el+' .cregister_class_addons_tr').addClass('noshow');
	}
}

function get_cust_class_programs() {
    $('#loader-wrapper').show();

    let class_id = $(mc2+' .cregister_class_id').val();

    let class_data = JSON.parse($(mc2+' .cregister_class_id').find(':selected').prop('dataset').intrac);

    let querydata = {class_id: class_id};

    if ($('.admin-page').length) {
    	querydata.incl_last_term = true;
    }

    if (!$('.admin-page').length) {
        querydata.from == 'customer'
    }

    $.ajax({
        type: 'GET',
        url: '/api/getClassPrograms',
        data: querydata,
        dataType: 'JSON'
    }).done(function( response ) {

        if (response.success != undefined) {

            $('#loader-wrapper').hide();

            let res = response.success;

            $('.creg_class_comment').html('');
			if (res.class && (res.class.class_comment != '<p><br></p>')) {
				$('.creg_class_comment').html('<div>'+res.class.class_comment+'</div>').removeClass('noshow');
			} else {
				$('.creg_class_comment').addClass('noshow');
			}

            let data = res.data;

            let html_str_ = '';

            if (data.length) {
                html_str_ += '<select class="form-control cregister_program_id">';
                for (let i = 0; i < data.length; i++) {

                    let d = data[i];

                    let user_str = d.usernames.split(',')[0];
                    let space_str = d.space_names.split(',')[0];
                    let prog_str = d.day.substring(1)+' '+convert_time(d.program_start,'h:mma')+'-'+convert_time(d.program_finish,'h:mma')+(user_str ? ' '+user_str : '')+(space_str ? ' '+space_str : '');

                    let data_intrac = {
                        class_id: d.class_id,
                        term_id: d.term_id,
                        term_start: d.term_start
                    };
                    if (d.schedules_remaining) {
                        data_intrac.schedules_remaining = d.schedules_remaining;
                    }
                    if (d.excl_today_cost) {
                        data_intrac.excl_today_cost = 1;
                    }
                    let term_name = ''
                    if (class_data.term_id != d.term_id) {
                        term_name = ' '+d.term_name;
                        $(mc2+' .cregister_show_last_term_ps').removeClass('noshow');
                    }
                    let full = '';
                    if (d.full) {
                        full = ' (capacity reached)';
                    } else if (validator.isInt((d.vacancy||'').toString())) { 
                        full += ' '+d.vacancy+' spot'+(d.vacancy > 1 ? 's' : '');
                    }                                       
                    html_str_ += '<option '+(term_name ? 'class="noshow_last_term"' : '')+' value="'+d.program_id+'" data-intrac="'+JSON.stringify(data_intrac).replace(/"/g, '&quot;')+'">'+prog_str+term_name+full+'</option>';
                }

                                html_str_ += '<option value="" data-intrac="'+JSON.stringify({class_id: data[0].class_id, term_id: data[0].term_id}).replace(/"/g, '&quot;')+'">All programs</option>';
                html_str_ += '</select>';
            } else {
                html_str_ += 'There are no programs available in the selected '+$('#class_title').val().toLowerCase();
            }

            $(mc2+' .cregister_program_list').html(html_str_);

            if ($(mc2+' .cregister_program_id option:not(.noshow_last_term)').length > 1) { 
            	$(mc2+' .cregister_program_id').val($(mc2+' .cregister_program_id option:not(.noshow_last_term):first').val()); 
            }

            if ($('#cregister_deeplinks').text()) {
                let ids = $('#cregister_deeplinks').text().split('~');
                if (ids[1] > 0) {
	                if ($(mc2+' .cregister_program_id option[value="'+ids[1]+'"]').length) {
	                    $(mc2+' .cregister_program_id option[value="'+ids[1]+'"]').removeClass('noshow_last_term');
	                    $(mc2+' .cregister_program_id').val(ids[1]);
	                }                	
                } else {
                	if ($('.admin-page').length) {
                		$(mc2+' .cregister_program_id').val(''); 
                	} else {
                		$(mc2+' .cregister_program_id').val($(mc2+' .cregister_program_id option:first').val()); 
                	}
                }

                if (ids[2] == 0) {
                	if ($('.admin-page').length) {
                    	$('#cregister_deeplinks').text(''); 
                    }
                }
            }

            $(mc2+' .cregister_program_id').change(); 

            get_cust_class_schedules();

        } else if (response.redirect != undefined) {
            mini_login_wizard(response.redirect); 
        } else {    
            set_side_error(response.error.join("<br>"));
            $('#loader-wrapper').hide();
        }

    }).fail( function(xhr, textStatus, errorThrown) {
        set_side_error("Operation failed " + (xhr.responseText?xhr.responseText:''));
        $('#loader-wrapper').hide();
    });    
}

function get_cust_class_schedules() {
    $('#loader-wrapper').show();

    let class_id = $(mc2+' .cregister_class_id').val();

    let class_data = JSON.parse($(mc2+' .cregister_class_id').find(':selected').prop('dataset').intrac);

    let querydata = {class_id: class_id};

    if ($('.admin-page').length) {
    	querydata.incl_last_term = true;
    }

    if (!$('.admin-page').length) {
        querydata.from == 'customer'
    }

    $.ajax({
        type: 'GET',
        url: '/api/getClassSchedules',
        data: querydata,
        dataType: 'JSON'
    }).done(function( response ) {

        if (response.success != undefined) {

            $('#loader-wrapper').hide();

            let res = response.success;

            let data = res.data;

            let html_str_ = '';

            if (data.length) {
                for (let i = 0; i < data.length; i++) {

                    let d = data[i];

                    let user_str = d.usernames.split(',')[0];
                    let space_str = d.space_names.split(',')[0];
                    let sched_str = convert_date(d.schedule_start)+' '+convert_time(dayjs(d.schedule_start).format('HH:mm:ss'),'h:mma')+'-'+convert_time(dayjs(d.schedule_finish).format('HH:mm:ss'),'h:mma')+'<span class="all_progs_noshow">'+(user_str ? ' '+user_str : '')+(space_str ? ' '+space_str : '')+'</span>';

                    let noshow = dayjs(d.schedule_start).startOf('day').isBefore(dayjs().startOf('day')) ? ' cregister_schedule_past noshow' : '';
                    if (dates_diff(dayjs(d.schedule_start).format('YYYY-MM-DD'),dayjs().format('YYYY-MM-DD'))>=30) {
                        noshow = ' cregister_schedule_future noshow';
                    }
                    if (class_data.term_id != d.term_id) {
                        noshow += ' noshow_last_term';
                    }

                    let data_intrac = {
                        program_id: d.program_id,
                        term_id: d.term_id,
                        term_start: d.term_start
                    };
                    let full = '';
                    if (d.full) {
                        full = ' (capacity reached)';
                    } else if (validator.isInt((d.vacancy||'').toString())) { 
                        full += ' '+d.vacancy+' spot'+(d.vacancy > 1 ? 's' : '');
                    }                    
                    html_str_ += '<div class="form-label cregister_schedule_div'+noshow+'"><label class="checkbox-container"><input type="checkbox" class="checkbox-custom cregister_schedule_id" value="'+d.schedule_id+'" data-intrac="'+JSON.stringify(data_intrac).replace(/"/g, '&quot;')+'"> '+sched_str+full+'</label></div>';
                }

                if (html_str_.includes('cregister_schedule_past')) {
                    html_str_ = '<div class="margin_btm_sm"><a href="#" class="cregister_schedule_past_showall noshow primary margin-left">Show past entries</a></div>'+html_str_;
                }

                if (html_str_.includes('cregister_schedule_future')) {
                    html_str_ += '<div class="margin_btm_sm"><a href="#" class="cregister_schedule_future_showall noshow primary margin-left">Show future entries</a></div>';
                }

            } else {
                html_str_ += 'There are no bookings available in the selected '+$('#class_title').val().toLowerCase()+' or program';
                if (class_data.level_type == 6) {
                	$('#add_class_register').addClass('noshow');
                }
            }

            $(mc2+' .cregister_schedule_list').html(html_str_);

            if (!$('.admin-page').length) {
            	$(mc2+' .cregister_schedule_list').closest('li').removeClass('noshow');
            	$(mc2+' .cregister_show_schedules').addClass('noshow');
            }

            if (data.length) {

                if ($('#cregister_deeplinks').text()) {
                    let ids = $('#cregister_deeplinks').text().split('~');
                    $(mc2+' .cregister_schedule_id[value="'+ids[2]+'"]').closest('.cregister_schedule_div').removeClass('noshow_last_term').removeClass('cregister_schedule_past').removeClass('cregister_schedule_future');
                    $(mc2+' .cregister_schedule_id[value="'+ids[2]+'"]').prop('checked', true);

                    if (!$('.admin-page').length) {
                    	$(mc2+' .cregister_schedule_id[value="'+ids[2]+'"]').closest('.cregister_schedule_div').addClass('display_flex');

                    	if ($(mc2+' .cregister_schedule_id[value="'+ids[2]+'"]').length && (ids[1] > 0) && (!$(mc2+' .cregister_program_id option[value="'+ids[1]+'"]').length)) {
                    		$(mc2+' .cregister_program_id').val(''); 
                    	}
                    }
                }

                $(mc2+' .cregister_schedule_id:first').change(); 
            } else {
                calcRegisterCost();
            }            

        	if (!$('.admin-page').length) {
        		if ((res.class.level_type == 1) && (!$(mc2+' .cregister_schedule_id:checked').length)) {
        			$(mc2+' .cregister_schedule_list').closest('li').addClass('noshow');
        			$(mc2+' .cregister_show_schedules').removeClass('noshow');
        		}
        	}

            if ($('#cregister_deeplinks').text()) {
                if ($('.admin-page').length) {
                	$('#cregister_deeplinks').text(''); 
                }
            }

        } else if (response.redirect != undefined) {
            mini_login_wizard(response.redirect); 
        } else {    
            set_side_error(response.error.join("<br>"));
            $('#loader-wrapper').hide();
        }

    }).fail( function(xhr, textStatus, errorThrown) {
        set_side_error("Operation failed " + (xhr.responseText?xhr.responseText:''));
        $('#loader-wrapper').hide();
    });    
}

function set_customer_form_fields(options) {
    let iamnot = $('.admin-page').length ? 'customer' : 'user';

    for (let i = 0; i < 2; i++) {
        let _ch = '';
        let mstr = $('.admin-page').length ? '#master_customer_view .cust_edit_tab' : '#customer_modal';
        if (i == 1) {
            _ch = '_ch';
            mstr = $('.admin-page').length ? '#master_customer_view .childs_tab' : '#master_child_view';
        }

        if (!options['show_level'+_ch]) {
	        $(mstr+' .cust_level_tr').hide();
	    } else {
	        let opts_str = '<option value="0"></option>';
	        for (let i = 0; i < options.levels.length; i++) {
	            opts_str += '<option value="'+options.levels[i].level_id+'">'+options.levels[i].level_name+'</option>';
	        }
	        $(mstr+' .level_id').html(opts_str);

	        if ($('.admin-page').length) {
	        	$('#master_assess_view .assess_promote_div .level_id').html(opts_str);
	        }
	    }

        if (options['show_confirm'+_ch]) {
            $(mstr+' .cust_conf_last_name_tr').show();
            $(mstr+' .cust_conf_email_tr').show();
        } else {
            $(mstr+' .cust_conf_last_name_tr').hide();
            $(mstr+' .cust_conf_email_tr').hide();        
        }

        if (!$('.admin-page').length) {
	        if (options['show_cust_code'+_ch]) {
	            $(mstr+' .cust_code_tr').show();
	        } else {
	            $(mstr+' .cust_code_tr').hide();        
	        }
	    }

        let fields = ['organisation','gender','dob','address','card','medical','consent','indemnity','rate','welcome'];

        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];

            if (!options['show_'+field+_ch]) { 
                $(mstr+' .cust_'+field+'_tr').hide();
            } else if ((options[field+_ch]) && ((options[field+_ch]).visible == iamnot)) { 
                $(mstr+' .cust_'+field+'_tr').hide();
            } else {
                if (options[field+_ch]) { 
                    $(mstr+' .cust_'+field+'_tr .label_txt').text(((options[field+_ch].display)?options[field+_ch].display:options[field+_ch]));

                    if (field == 'medical') {
                    	$(mstr+' .cust_'+field+'_tr'+' textarea').prop('placeholder', ''); 
                    }
                }
                if (options['show_'+field+_ch] == 'mandatory') { 
                    $(mstr+' .cust_'+field+'_tr').find('.mandatory').removeClass('noshow');
                }            
                if ((options[field+_ch]) && (options[field+_ch].cssclass)) { 
                    $(mstr+' .cust_'+field+'_tr input,'+mstr+' .cust_'+field+'_tr textarea').addClass(options[field+_ch].cssclass);
                } 
                if ((options[field+_ch]) && (options[field+_ch].maxlength)) { 
                    $(mstr+' .cust_'+field+'_tr input[type=text],'+mstr+' .cust_'+field+'_tr textarea').prop('maxlength', options[field+_ch].maxlength);
                }
                if ((options[field+_ch]) && (options[field+_ch].text)) { 
                    $(mstr+' .cust_'+field+'_tr input[type=text],'+mstr+' .cust_'+field+'_tr textarea').prop('placeholder', options[field+_ch].text);
                    $(mstr+' .cust_'+field+'_tr input[type=checkbox]').after('<span> '+options[field+_ch].text+'</span>');
                } 
                if ((options[field+_ch]) && (options[field+_ch].default)) { 
                    $(mstr+' .cust_'+field+'_tr input[type=text],'+mstr+' .cust_'+field+'_tr textarea,'+mstr+' .cust_'+field+'_tr select').val(options[field+_ch].default);
                    $(mstr+' .cust_'+field+'_tr input[type=checkbox]').prop('checked', true);
                    $(mstr+' .cust_'+field+'_tr input[type=radio][value='+options[field+_ch].default+']').prop('checked', true);
                }                                                 
            }        
        }

        if (options['details'+_ch]) {
            let div_str = '';
            for(const key in options['details'+_ch]) {

                let e = options['details'+_ch][key];

                if (e.visible != iamnot) { 
                    let mand_span = (e.mandatory) ? '<span class="mandatory"> *</span>' : '';

                    let p_red = $('.admin-page').length ? '' : (e.type == 'checkbox' ? '<p class="red noshow"></p>' : '<p class="mt-2 red noshow"></p>'); 

                    if (e.type == 'checkbox') {
                        div_str += '<div class="form-group form-group-flex cust_details_tr">\
                                        <b class="label half-bold">'+e.display+'</b>'+mand_span+'&nbsp;&nbsp;\
                                        <div class="form-label">\
                                            <label class="checkbox-container">'+(e.text?e.text:'&nbsp;')+'\
                                                <input type="checkbox" name="'+key+'" '+(e.default == 1 ? "checked" : "")+' class="checkbox-custom cust_details_el">\
                                            </label>\
                                        </div>\
                                        '+p_red+'\
                                    </div>';
                    }

                    if (e.type == 'text') {
                        div_str += '<div class="form-group cust_details_tr">\
                                        <div class="label">'+e.display+mand_span+'</div>\
                                        <input type="text" name="'+key+'" value="'+(e.default?e.default:"")+'" placeholder="'+(e.text?e.text:'')+'" class="form-control cust_details_el '+(e.cssclass?e.cssclass:'')+'" '+(e.maxlength?' maxlength="'+e.maxlength+'"':'')+'>\
                                    	'+p_red+'\
                                    </div>';
                    }

                    if (e.type == 'textarea') {
                        div_str += '<div class="form-group cust_details_tr">\
                                        <div class="label">'+e.display+mand_span+'</div>\
                                        <textarea name="'+key+'" value="'+(e.default?e.default:"")+'" placeholder="'+(e.text?e.text:'')+'" rows="3" class="form-control cust_details_el '+(e.cssclass?e.cssclass:'')+'" '+(e.maxlength?' maxlength="'+e.maxlength+'"':'')+'></textarea>\
                                    	'+p_red+'\
                                    </div>';
                    }

                    if (e.type == 'select') {
                        let opts_str = '';
                        for (let i = 0; i < e.values.length; i++) {
                            opts_str += '<option value="'+e.values[i].split('~')[1]+'" '+(e.default == e.values[i].split('~')[1] ? "selected" : "")+'>'+e.values[i].split('~')[0]+'</option>';
                        }                
                        div_str += '<div class="form-group cust_details_tr">\
                                        <div class="label">'+e.display+mand_span+'</div>\
                                        <select name="'+key+'" class="form-control cust_details_el">'+opts_str+'</select>\
                                    	'+p_red+'\
                                    </div>';
                    }

                    if (e.type == 'radio') {
                        let opts_str = '';
                        for (let i = 0; i < e.values.length; i++) {
                            opts_str += '<div class="custom-radio-div">\
                            				<input type="radio" name="'+key+'" class="hidden custom-radio cust_details_el" value="'+e.values[i].split('~')[1]+'" '+(e.default == e.values[i].split('~')[1] ? "checked" : "")+'>\
                                            <label class="custom-radio-label">\
                                                <span class="custom-radio-span"><svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3" fill="none"></circle></svg></span>\
                                                '+e.values[i].split('~')[0]+'\
                                            </label>\
                            			</div>';
                        }
                        div_str += '<div class="form-group full-width cust_details_tr">\
                                        <div class="label">'+e.display+mand_span+'</div>\
                                        <div class="flex flex-col md:flex-row gap-4">'+opts_str+'</div>\
                                        '+p_red+'\
                                    </div>';
                    }
                }
            }
            $(mstr+' .custom_fields').before(div_str);
        }

        if (!$('.admin-page').length) {
        	adjust_customer_form_elements(mstr); 
        }

    } 
}

function get_cust_passtypes() {
    $('#loader-wrapper').show();

    let _mc = $('.admin-page').length ? mc2 : '#passes';

    $(_mc+' .cpass_pass_list').html('');
    $(_mc+' .cpass_descriptions').html('');

    let customer_id = ($(_mc+' input:radio[name="cpass_customer_id"]:checked').length) ? $(_mc+' input:radio[name="cpass_customer_id"]:checked').val() : '';
    let cust_level_id = $(_mc+' .cpass_cust_list [name="cpass_customer_id"]:checked').closest('.cpass_cust_row').find('.level_id').text();

    let querydata = {cust_level_id: cust_level_id, customer_id: customer_id};

    $.ajax({
        type: 'GET',
        url: '/api/getPasstypes',
        data: querydata,
        dataType: 'JSON'
    }).done(function( response ) {

        if (response.success != undefined) {

            $('#loader-wrapper').hide();

            let res = response.success;

            let data = res.data;

            let html_str_ = '';
            let html_str_d = '';

            if (data.length) {
                html_str_ += '<select class="form-control cpass_passtype_id">';
                for (let i = 0; i < data.length; i++) {
                    let per = (data[i].monthly>0) ? (' per '+$('#pass_monthly_title').val()) : '';
                    if (data[i].level_type == 1) {
                        if (data[i].cost_original) {
                            per = '. '+numberformatccy(data[i].cost_original)+' pass: '+data[i].compl_perc_msg;
                        }
                    }
                    let validity = (data[i].expiry>0) ? (' valid until '+convert_date(dayjs().add(data[i].expiry, 'day').format('YYYY-MM-DD'))): '';
                    if (data[i].expires != '2050-01-01') { 
                        validity = ' valid until '+convert_date(data[i].expires);
                    }
                    let family = '';
                    if ((data[i].features || '').includes('f')) {
                        family = ' - family';
                    }
                    html_str_ += '<option value="'+data[i].passtype_id+'" data-intrac_cost="'+data[i].cost+'" data-intrac_monthly="'+data[i].monthly+'">'+data[i].passtype_name+family+' ('+numberformatccy(data[i].cost)+per+validity+')</option>';
                    html_str_d += '<div class="noshow" id="cpass_description_'+data[i].passtype_id+'">'+data[i].passtype_description.replace(/\r?\n/g, '<br>').trim()+'</div>';
                }
                html_str_ += '</select>';
            } else {
                html_str_ += 'No '+($('#pass_title').val() == 'pass' ? 'passes' : $('#pass_title').val()+'s')+' available for purchase';
            }

            $(_mc+' .cpass_pass_list').html(html_str_);
            $(_mc+' .cpass_descriptions').html(html_str_d);

                        if (!$('.admin-page').length) {
            	let renew_passtype_id = '';
            	let renew_customer_id = ($(_mc+' input:radio[name="cpass_customer_id"]:checked').length) ? $(_mc+' input:radio[name="cpass_customer_id"]:checked').val() : '';

            	            	if (renew_customer_id) {
	            	$('#cpass_cust_exp_list .cpass_row').each(function () {
	            		if ($(this).find('.renew_customer_id').text() == renew_customer_id) {
	            			renew_passtype_id = $(this).find('.renew_passtype_id').text();
	            			return false; 
	            		}
	            	});
            	}

            	if (renew_passtype_id && $(_mc+' .cpass_passtype_id option[value="'+renew_passtype_id+'"]').length) {
            		$(_mc+' .cpass_passtype_id').val(renew_passtype_id);
            	}
            }

                        $(_mc+' .cpass_passtype_id').change(); 

        } else if (response.redirect != undefined) {
            mini_login_wizard(response.redirect); 
        } else {    
            set_side_error(response.error.join("<br>"));
            $('#loader-wrapper').hide();
        }

    }).fail( function(xhr, textStatus, errorThrown) {
        set_side_error("Operation failed " + (xhr.responseText?xhr.responseText:''));
        $('#loader-wrapper').hide();
    });    
}

