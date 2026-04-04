function convert_date (date,toformat='D MMM YYYY') {
    return dayjs(date, 'YYYY-MM-DD').format(toformat);
}

function convert_time (time,toformat='h:mma') {
    return dayjs(time, 'HH:mm:ss').format(toformat);
}

function convert_date_time (date_time,toformat='D MMM YYYY h:mma') {
    return dayjs(date_time, 'YYYY-MM-DD HH:mm:ss').format(toformat);
}

function isvalidDate(dateString) {
    return dayjs(dateString, 'YYYY-MM-DD', true).isValid();
}

function isvalidTime(timeString) {
    return dayjs(timeString, 'HH:mm:ss', true).isValid();
}

function isvalidDateTime(dateTimeString) {
    return dayjs(dateTimeString, 'YYYY-MM-DD HH:mm:ss', true).isValid();
}

function parse_date (date,formats=['D MMM YYYY', 'D/M/YY', 'DD/MM/YY', 'YYYY-MM-DD']) {
    return dayjs(date, formats, true).format('YYYY-MM-DD');
}

function parse_time (date,formats=['h:mma', 'h:mm a', 'hh:mma', 'hh:mm a', 'H:mm', 'HH:mm', 'HH:mm:ss']) {
    return dayjs(date, formats, true).format('HH:mm:ss');
}

function dates_diff(date1, date2, unit='day') { //assumes format is YYYY-MM-DD
    return dayjs(date1).diff(date2, unit);
}

function times_diff(time1, time2, unit='minute') { //assumes format is HH:mm:ss
    return dayjs(dayjs(time1,'HH:mm:ss')).diff(dayjs(time2,'HH:mm:ss'), unit);
}

function times_isbetween(time, time1, time2, mode='[]', unit='minute') { //assumes format is HH:mm:ss; [ is include ( is exclude start & finish respectively
    return dayjs(dayjs(time,'HH:mm:ss')).isBetween(dayjs(time1,'HH:mm:ss'), dayjs(time2,'HH:mm:ss'), unit, mode);
}

function timeslots_overlap(slot1Start, slot1End, slot2Start, slot2End) {
    return (dayjs(slot1Start).isBefore(dayjs(slot2End)) && dayjs(slot1End).isAfter(dayjs(slot2Start)));
}

function sortDates(datesArr) {
    return [...datesArr].sort((a, b) => dayjs(a).diff(dayjs(b)));
}

function numberformat(num,round=2) {
    if (num < 0)
        return -numberformat(-num, round);
    return +(Math.round(num + "e" + round) + "e-" + round);
}

function numberformatccy(num,round=2,locale="en-AU",ccy = "AUD") {
    if ($('#locale').val()) {
        locale = $('#locale').val();
    }
    if ($('#ccy_code').val()) {
        ccy = $('#ccy_code').val();
    }
    if (round == 0) {
        return parseFloat(num).toLocaleString(locale, {style:"currency", currency:ccy, minimumFractionDigits:0, maximumFractionDigits:0});  
    } else {
        return parseFloat(num).toLocaleString(locale, {style:"currency", currency:ccy, minimumFractionDigits:2, maximumFractionDigits:round});  
    }
    
}

function toString(d) {
    if (d) {
        return d.toString();
    } else {
        return null;
    }
}

function wordCount(str, word) {
  const pattern = new RegExp(word, 'gi');
  const matches = str.match(pattern);
  return matches ? matches.length : 0;
}

function clean_json(json) {
    return JSON.stringify(json, null, 2)
      .replace(/^{\s*/, '') // Remove opening brace and whitespace
      .replace(/\s*}$/, '') // Remove closing brace and whitespace
      .replace(/,\n\s*/g, '<br>') // Replace comma-newline combos
      .replace(/\\r\\n/g, '<br>') // Replace literal "\r\n" strings from JSON
      .replace(/\r?\n/g, '<br>') // Replace actual newlines
      .replace(/:\s*/g, ': ') // Normalize colon spacing
      .replace(/"([^"]+)":/g, (_, key) => {
            // Capitalize first letter of key
            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
            return capitalizedKey + ':';
        })
      .replace(/"\s*/g, ''); // Remove stray quotes
}

function mini_login_wizard(redirect) {
    window.location.href = redirect; //redirect returned by server
}

function isTouchDevice() {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));
}


function isJSON(str, strict=false) {
    if (strict) {
        if (validator.isJSON(str)) {
            const parsed = JSON.parse(str);
            return typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0;
        }
        return false; 
    } else {
      return validator.isJSON(str);  
    }   
}

function isEmptyJSON(json) {
    return JSON.stringify(json) === "{}";
}

function isMobile(str,locale) {
    str = str.replace(/ /g, ''); //replace spaces and +
    return validator.isMobilePhone(str, (locale ? locale : 'en-AU'), {strictMode: false});
    //return validator.matches(str,/^04[\d]{8}/);
}

function isID(str) {
    return validator.isInt(str,{min: 1});
}

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

function addThousandSeparator(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function isEmpty(input) {
    if ((typeof input === 'object' && input !== null) || input === null) { 
        return true;
    }
    return validator.isEmpty(input, {ignore_whitespace:true});
}

function isDSTAus (date, timezone='') {
    let targetDate = dayjs(date+' 12:00:00', 'YYYY-MM-DD HH:mm:ss');
    if (timezone) {
        targetDate = dayjs(date+' 12:00:00', 'YYYY-MM-DD HH:mm:ss').tz(timezone);
    }
    let month = targetDate.month();

    if (month >= 9 || month <= 3) {
        //no DST anywhere on 2024-07-01, hence standardOffset
        let standardOffset = dayjs('2024-07-01').utcOffset();
        if (timezone) {
            standardOffset = dayjs('2024-07-01').tz(timezone, true).utcOffset();
        }
        let currentOffset = targetDate.utcOffset();
        return currentOffset !== standardOffset;
    }
    return false;
};

function getAge(dob) {
    if (!isvalidDate(dob)) {
        return false;
    }
    const now = dayjs();
    dob = dayjs(dob, 'YYYY-MM-DD', true);

    // Calculate the years difference
    let years = now.year() - dob.year();
    // Calculate the months difference
    let months = now.month() - dob.month();

    // Adjust years and months if needed
    if (months < 0) {
        years--;
        months += 12;
    }

    if ((years < 6) && (months > 0)) {
        return years+'.'+months;
    } else {
        return years;
    }
}

function getFilteredDates(startDate, endDate, day, holidays = [], day_type = 0) {
    const dates = [];
    const start = dayjs(startDate, 'YYYY-MM-DD');
    const end = dayjs(endDate, 'YYYY-MM-DD');

    const daysMap = {
        "Sun": 0,
        "Mon": 1,
        "Tue": 2,
        "Wed": 3,
        "Thu": 4,
        "Fri": 5,
        "Sat": 6,
        "All": "All"
    };
    const targetDay = daysMap[day];
    const refDate = dayjs('2025-01-01').startOf('isoWeek'); // For fortnightly calc

    day_type = parseInt(day_type, 10);

    for (let date = start; date.isBefore(end) || date.isSame(end); date = date.add(1, 'day')) {
        const formattedDate = date.format('YYYY-MM-DD');

        // Skip holidays
        if (holidays.includes(formattedDate)) continue;

        // Filter by weekday
        if (day !== "All" && date.day() !== targetDay) continue;

        // Apply week-based filtering
        if (day_type >= 1 && day_type <= 5) {
            const firstDayOfMonth = date.startOf('month');
            const weekOfMonth = Math.floor(date.diff(firstDayOfMonth, 'day') / 7) + 1;

            if (day_type >= 1 && day_type <= 4 && weekOfMonth !== day_type) continue;

            if (day_type === 5) {
                const lastWeekStart = date.endOf('month').startOf('isoWeek');
                const currentWeekStart = date.startOf('isoWeek');
                if (!currentWeekStart.isSame(lastWeekStart)) continue;
            }
        }

        // Fortnight filtering based on 2025-01-01
        if (day_type === 6 || day_type === 7) {
            const weeksSinceReference = Math.floor(date.startOf('day').diff(refDate, 'day') / 7) + 1;
            const isEvenWeek = weeksSinceReference % 2 === 0;
            if (day_type === 6 && !isEvenWeek) continue;
            if (day_type === 7 && isEvenWeek) continue;
        }

        dates.push(formattedDate);
    }

    return dates;
}

function uniqueJSONArray(jsonArray) {
    return Array.from(new Set(jsonArray.map(JSON.stringify))).map(JSON.parse);
};

//sql style sorting
function sqlStyleSortJSONArray(arr, keys = [], direction = 'asc') {
  const isAsc = direction === 'asc';

  return arr.slice().sort((a, b) => {
    for (let key of keys) {
      const valA = a[key];
      const valB = b[key];

      const isDateA = dayjs(valA).isValid();
      const isDateB = dayjs(valB).isValid();

      let result;

      if (isDateA && isDateB) {
        result = dayjs(valA).isBefore(dayjs(valB)) ? -1 : dayjs(valA).isAfter(dayjs(valB)) ? 1 : 0;
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        result = valA - valB;
      } else {
        result = String(valA).localeCompare(String(valB));
      }

      if (result !== 0) return isAsc ? result : -result;
    }
    return 0; // all keys equal
  });
}

//don't expand arrays
function JSONprettyCompact(obj) {
    const raw = JSON.stringify(obj, null, 4);

    // Regex to collapse arrays that span multiple lines
    const compacted = raw.replace(
        /\[\s+([^\[\]\{\}]+?)\s+\]/gs,
        (match, content) => {
            // Remove line breaks and extra spaces
            const oneLine = content.trim().replace(/\s*,\s*/g, ', ');
            return `[ ${oneLine} ]`;
        }
    );

    return compacted;
}

function downloadCSV(data,filename) {
    // Convert JSON data to CSV
    let csvData = jsonToCsv(data);
    // Create a CSV file and allow the user to download it
    let blob = new Blob([csvData], { type: 'text/csv' });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', (filename || 'data')+'.csv');
    a.setAttribute('class', 'a_direct');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function jsonToCsv(jsonData) {
    let allKeys = new Set();

    // Collect all unique keys
    jsonData.forEach(row => {
        Object.keys(row).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    let csv = headers.join(',') + '\r\n';

    jsonData.forEach(row => {
        const line = headers.map(header => {
            let value = row.hasOwnProperty(header) ? row[header] : ' ';
            value = String(value).replace(/,/g, '.'); // replace commas with dot
            return JSON.stringify(value);
        }).join(',');
        csv += line + '\r\n';
    });

    // Optional: remove quotes if you don't want any
    csv = csv.replace(/"/g, '');

    return csv;
}

function game_clock(el, cur_db_time, finish, period, game_periods) {
    let j = dayjs(finish).diff(dayjs(cur_db_time), 'second') * 1000; //diff in milliseconds
    
    let start = new Date();

    function updateClock() {
        let i = start-new Date();
        i = i+j;
        if (i < 0) {
            i = 0-i;
            $(mc+' .'+el+'_timer').css('color', 'red'); //overtime
        }
        let time_str = Math.floor(i/60000)+':'+(Math.floor(i/1000)%60<10?'0':'')+Math.floor(i/1000)%60;

        let period_str = '';
        if (period > 0) {
            period_str = (game_periods == 4 ? 'Quarter' : 'Period')+' '+period+'  ';
        }
        $(mc+' .'+el+'_timer').text(period_str+time_str);
    }

    updateClock(); //run once immediately
    
    let gameClockID = setInterval(updateClock, 250);
    $('#game_clock_id').text(gameClockID);
}

const generateGUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

function htmlDecode(str) {
  return new DOMParser().parseFromString(str, "text/html").body.textContent;
}

function sanitiseCSSTemplate() {
    const $style = $('#css_template');
    let css = $style.html();
    css = css.replace(/&#34;/g, '"'); // Replace &#34; with actual double quotes
    $style.text(css);
}

function findClosestPastSlot(target) {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Round down to nearest 15
    minutes = Math.floor(minutes / 15) * 15;

    while (hours >= 0) {
        const hh = String(hours).padStart(2, "0");
        const mm = String(minutes).padStart(2, "0");
        const suffix = `_${hh}-${mm}`;

        // Look for any element whose ID ends with this suffix
        const el = $(target+' '+`[id$='${suffix}']`);

        if (el.length) {
            return el.first(); // Return the first match
        }

        // Step back 15 mins
        minutes -= 15;
        if (minutes < 0) {
            minutes = 45;
            hours -= 1;
        }
    }
    return null; // Nothing found
}


String.prototype.replaceCase = function(placeholder, replacement) {
    const regex = new RegExp(`${placeholder}|##${placeholder.charAt(2).toUpperCase() + placeholder.slice(3)}`, 'g');
    return this.replace(regex, function(match) {
        if (match.charAt(2) === placeholder.charAt(2).toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        } else {
          return replacement;
        }
    });
};

String.prototype.replaceCaseFull = function(search, replacement) {
    return this.replace(new RegExp(search, 'gi'), function(match) {
        // Function to preserve case
        let result = '';
        let maxLen = Math.max(match.length, replacement.length);
        
        for (let i = 0; i < maxLen; i++) {
            let matchChar = match[i] || '';
            let char = replacement[i] || '';
            
            if (i < match.length) {
                if (matchChar === matchChar.toUpperCase()) {
                    result += char.toUpperCase();
                } else {
                    result += char.toLowerCase();
                }
            } else {
                result += char;
            }
        }
        return result;
    });
};

//similar to jQuery contains but matches text exactly
$.expr[':'].containsExact = function(el, i, m) {
    return $(el).text().trim() === m[3];
};

function sameJSONs_cart(obj1, obj2) {
    let o1 = structuredClone(obj1);
    let o2 = structuredClone(obj2);

    delete o1.extras;
    delete o2.extras;

    return sameJSONs(o1, o2);
}

function sameJSONs(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return false;
    }

    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key) || !sameJSONs(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

function mergeJSONnums(obj1, obj2) {
    const merged = {};

    function isObject(val) {
        return val && typeof val === 'object' && !Array.isArray(val);
    }

    // Recursive merge logic
    for (const key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            // If key exists in both objects
            if (obj2.hasOwnProperty(key)) {
                if (isObject(obj1[key]) && isObject(obj2[key])) {
                    // Recursively merge nested objects
                    merged[key] = mergeJSONnums(obj1[key], obj2[key]);
                } else if (typeof obj1[key] === 'number' && typeof obj2[key] === 'number') {
                    // Pick the highest number if both are numbers
                    merged[key] = Math.max(obj1[key], obj2[key]);
                } else {
                    // Default to obj1's value if types differ
                    merged[key] = obj1[key];
                }
            } else {
                // If key is only in obj1
                merged[key] = obj1[key];
            }
        }
    }

    // Add keys that only exist in obj2
    for (const key in obj2) {
        if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
            merged[key] = obj2[key];
        }
    }

    return merged;
}

function canonicalizeJSON(obj) {
    if (Array.isArray(obj)) {
        return obj.map(canonicalizeJSON);
    } else if (obj && typeof obj === 'object') {
        return Object.keys(obj).sort().reduce((acc, key) => {
            acc[key] = canonicalizeJSON(obj[key]);
            return acc;
        }, {});
    } else {
        return obj;
    }
}

function sameJSONArrays(a, b) {
    const canonicalA = canonicalizeJSON(a);
    const canonicalB = canonicalizeJSON(b);
    return JSON.stringify(canonicalA) === JSON.stringify(canonicalB);
}

function htmlEncode(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

const StripePaymentManager = (() => {

    let stripe_pub_key = $('#stripe_pub_key').text();

    let stripe = stripe_pub_key ? Stripe(stripe_pub_key.split(',')[1],{stripeAccount: stripe_pub_key.split(',')[0], betas: ["blocked_card_brands_beta_2"]}) : null;
    let elements = null;
    let paymentElement = null;

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: ($('.customer-page').length ? (getCssVariable('--brand', document.querySelector('.customer-page')) || '#645bef') : '#645bef'),
            fontSizeBase: ($('.admin-page').length ? '14px' : '16px')
        }
    };

    return {
        isMounted() {
            return !!paymentElement;
        },
        
        async mount(config, selector) {
            try {
                if (paymentElement) {
                    await this.unmount();
                }

                config = {...config, appearance: appearance};

                if (config.amount <= 0) {
                    config.amount = 1; //set to 1c to avoid an error
                }

                config.allowedCardBrands = $('#allow_amex').length ? ['visa', 'mastercard', 'american_express'] : ['visa', 'mastercard'];

                elements = stripe.elements(config);

                let p_obj = { layout: {type: 'accordion', defaultCollapsed: false}, paymentMethodOrder: ['apple_pay', 'google_pay', 'card'] };
                if ($('.admin-page').length) {
                    p_obj = { layout: {type: 'accordion', defaultCollapsed: false}, wallets: {applePay: 'never', googlePay: 'never'} };
                }

                paymentElement = elements.create('payment', p_obj);
                paymentElement.mount(selector);
            } catch (error) {
                console.error('Stripe mount failed:', error);
            }
        },

        async unmount() {
            try {
                if (paymentElement) {
                    paymentElement.unmount();
                    paymentElement = null;
                }
                elements = null;
            } catch (error) {
                console.warn('Stripe unmount failed:', error);
            }
        },

        updateAmount(amount) {
            try {
                if (elements) {

                    if (amount <= 0) {
                        amount = 1; //set to 1c to avoid an error
                    }

                    elements.update({ amount });
                }
            } catch (error) {
                console.error('Stripe amount update failed:', error);
            }
        },

        updateDirect(direct) {
            try {
                if (direct) {
                    elements.update({setup_future_usage: 'off_session'});
                } else {
                    elements.update({setup_future_usage: null});
                }
            } catch (error) {
                console.error('Stripe amount update failed:', error);
            }
        },

        updateMode(mode) {
            try {
                if (elements) {
                    elements.update({ mode });
                }
            } catch (error) {
                console.error('Stripe mode update failed:', error);
            }
        },

        async submit() {
            if (!elements) {
                console.error('Stripe not initialized');
                return { error: { message: 'Something went wrong! Please refresh the page and re-try. Your card has not been charged' } };
            }
            try {
                const result = await elements.submit();
                return result; // Will contain {error} if there’s an issue, or undefined if successful
            } catch (error) {
                console.error('Failed to create submit elements:', error);
                return { error: { message: 'Something went wrong! Please refresh the page and re-try. Your card has not been charged' } };
            }
        },

        async createConfirmationToken() {
            if (!stripe || !elements) {
                console.error('Stripe not initialized');
                return { error: { message: 'Something went wrong! Please refresh the page and re-try. Your card has not been charged' } };
            }

            try {
                const result = await stripe.createConfirmationToken({elements});
                return result; // {error, confirmationToken}
            } catch (error) {
                console.error('Failed to create confirmation token:', error);
                return { error: { message: 'Something went wrong! Please refresh the page and re-try. Your card has not been charged' } };
            }
        }
    };
})();

function evalTemplateRules(text) {
    // regex to match the desired structure {% (condition) textToShow %}
    const regex = /{%\s*\((.*?)\)\s*(.*?)\s*%}/g;
    text = text.replace(regex, (match, condition, textToShow) => {

        condition = condition.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<');

        // Split condition on logical operators to evaluate individual expressions
        const conditions = condition.split(/\s*(&&|\|\|)\s*/);
        let conditionResult = true;

        // Evaluate each part of the condition
        for (let i = 0; i < conditions.length; i += 2) {
            let cond = conditions[i];

            // Replace single `=` with `==` for comparison
            cond = cond.replace(/([^=!<>])=([^=!<>])/g, '$1==$2');

            const operator = conditions[i + 1]; // '&&' or '||'

            // Evaluate the current condition
            const result = simpleEval(cond.trim());

            // Combine results based on the logical operator
            if (operator === '&&' && !result) {
                conditionResult = false;
            break; // Short-circuit for AND
            } else if (operator === '||' && result) {
                conditionResult = true;
            break; // Short-circuit for OR
            } else if (operator === undefined) {
                conditionResult = result; // Final single condition case
            }
        }

        // Return the content if the condition is true, otherwise return an empty string
        return conditionResult ? textToShow.trim() : '';
    });

    //failed evalTemplateRule - handle breaks
    text = text.replace(/<p>\s*(<span[^>]*>)?\s*(<\/span>)?\s*<\/p>/g, ''); //remove empty <p></p> lines without any content, incl those with fonts (using spans)
    text = text.replace(/(<p><br><\/p>)+/g, '<p><br></p>'); //replace multiple <p><br></p> lines with one

    return text;

    //helper function
    function simpleEval(cond) {
        try {
            const [left, operator, right] = cond.split(/(==|!=|<=|>=|<|>)/).map(s => s.trim());

            const leftVal = isNaN(left) ? left : Number(left);
            const rightVal = isNaN(right) ? right : Number(right);

            switch (operator) {
                case '==': return leftVal == rightVal;
                case '!=': return leftVal != rightVal;
                case '<': return leftVal < rightVal;
                case '<=': return leftVal <= rightVal;
                case '>': return leftVal > rightVal;
                case '>=': return leftVal >= rightVal;
                default: return false; // Handle unexpected operators
            }
        } catch (error) {
            console.log("evalTemplateRules - Error evaluating condition:", error);
            return false;
        }
    }    
}

String.prototype.replaceCase = function(placeholder, replacement) {
    const regex = new RegExp(`${placeholder}|##${placeholder.charAt(2).toUpperCase() + placeholder.slice(3)}`, 'g');
    return this.replace(regex, function(match) {
        if (match.charAt(2) === placeholder.charAt(2).toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        } else {
          return replacement;
        }
    });
};

function register_quill_plugins() {
    /*Fix for Image resizing not preserving styles on save*/
    var BaseImageFormat = Quill.import('formats/image');
    const ImageFormatAttributesList = ['alt', 'height', 'width', 'style'];

    class ImageFormat extends BaseImageFormat {
      static formats(domNode) {
        return ImageFormatAttributesList.reduce(function(formats, attribute) {
          if (domNode.hasAttribute(attribute)) {
            formats[attribute] = domNode.getAttribute(attribute);
          }
          return formats;
        }, {});
      }
      format(name, value) {
        if (ImageFormatAttributesList.indexOf(name) > -1) {
          if (value) {
            this.domNode.setAttribute(name, value);
          } else {
            this.domNode.removeAttribute(name);
          }
        } else {
          super.format(name, value);
        }
      }
    }

    Quill.register('formats/image', ImageFormat, true);
    /*end of fix*/

    Quill.register('modules/imageResize', QuillResizeModule);
    Quill.register("modules/imageCompressor", imageCompressor);

    let Font = Quill.import('attributors/style/font'); 
    Font.whitelist = ['arial', 'times-new-roman', 'courier', 'comic-sans', 'verdana'];
    Quill.register(Font, true);

    const fontSizeArr = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px'];
    var Size = Quill.import('attributors/style/size');
    Size.whitelist = fontSizeArr;
    Quill.register(Size, true);

    /*Fixes for classes to inline style*/
    Quill.register(Quill.import("attributors/style/direction"), true); //Text direction
    Quill.register(Quill.import("attributors/style/align"), true); //Alignment

    const Parchment = Quill.import("parchment");
    class IndentAttributor extends Parchment.StyleAttributor {
      add(node, value) {
        value = parseInt(value)
        if (value === 0) {
          this.remove(node);
          return true;
        } else {
          return super.add(node, `${value}em`);
        }
      }
    }
    let IndentStyle = new IndentAttributor("indent", "text-indent", {
        scope: Parchment.Scope.BLOCK,
        whitelist: ["1em", "2em", "3em", "4em", "5em", "6em", "7em", "8em", "9em"]
    });
    Quill.register(IndentStyle, true);
    /*End of Fixes for classes to inline style*/

    //custom icon for image_url handler
    var icons = Quill.import('ui/icons');
    icons['image_url'] = '<img src="/images/icons/add_photo.svg" title="Image URL" style="width:18px;height:18px;">'
    icons['image_original'] = '<span class="material-symbols-sharp" title="Image Original" style="font-size: 18px">wallpaper</span>';
}

function quill_init(target, mode='') {

    let imageOptions =['image_url']; //['image_url', 'image', 'image_original'];
    let linkOptions = ['link'];

    if (mode == 'basic') {
        imageOptions = [];
        linkOptions = [];
    }

    const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'font': ['', 'serif', 'monospace', 'arial', 'times-new-roman', 'courier', 'comic-sans', 'verdana'] }],
        [{ 'size': [false, '8px', '10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px'] }],
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'align': [] }],

        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        linkOptions,
        imageOptions,

        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        ['emoji'],                                        // emoji

        ['clean']                                         // remove formatting button
    ];

    const quill = new Quill(target, {
        modules: {
            toolbar: {
                container: toolbarOptions,
                handlers: {
                    image_url: function () {
                        var range = this.quill.getSelection();
                        var value = prompt('Enter the image URL. External images (not hosted by intrac) would not load in the preview, but would be visible in emails. Contact intrac support for any questions');
                        if(value){
                            this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
                        }
                    },
                    image_original: function () {
                        var input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');
                        input.click();

                        input.onchange = function() {
                            var file = input.files[0];
                            var maxFileSize = 500 * 1024; // 500KB in bytes

                            // Check if the file size exceeds the limit
                            if (file.size > maxFileSize) {
                                alert('Image size exceeds 500KB, please upload a smaller image.');
                                return;
                            } else {
                                console.log('image Un-compressed - file.size is: '+ numberformat(file.size/(1024 * 1024), 3) + ' MB')
                            }

                            // Proceed with the upload if the file size is acceptable
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                var range = quill.getSelection();
                                quill.insertEmbed(range.index, 'image', e.target.result);
                            };
                            reader.readAsDataURL(file);
                        };
                    }                    
                }               
            },
            "emoji-toolbar": true,
            imageResize: {},
            imageCompressor: {
                quality: 0.7,
                maxWidth: 1000, // default
                maxHeight: 1000, // default
                imageType: 'image/jpeg',
                keepImageTypes: ['image/png'], //to keep transparency
                //debug: true,
                insertIntoEditor: (imageBase64URL, imageBlob, editor) => {                    
                    const fileSizeInBytes = imageBlob.size;
                    const maxFileSizeInBytes = 1024 * 1024; // 1MB in bytes

                    console.log('imageCompressor - Compressed image size: ' + numberformat(fileSizeInBytes/(1024 * 1024), 3) + ' MB');

                    if (fileSizeInBytes > maxFileSizeInBytes) {
                      alert('Image size exceeds 1MB after compression, please upload a smaller image or in jpeg format for better compression');
                      return;
                    }

                    // Insert the image into the editor
                    const range = editor.getSelection();
                    editor.insertEmbed(range.index, "image", imageBase64URL, "user");
                },                
            },
            keyboard: { //to retain format after pressing ENTER
                bindings: {
                  handleEnter: {
                    key: "Enter",
                    handler: function(range, context) {
                      const {Scope} = Quill.import('parchment');
                      const Delta = Quill.import('delta');
                      const lineFormats = Object.keys(context.format).reduce(
                        (formats, format) => {
                          if (
                            this.quill.scroll.query(format, Scope.BLOCK) &&
                              !Array.isArray(context.format[format])
                          ) {
                            formats[format] = context.format[format];
                          }
                          return formats;
                        },
                        {},
                      );

                      const delta = new Delta()
                            .retain(range.index)
                            .delete(range.length)
                            .insert("\n", lineFormats);
                      this.quill.updateContents(delta, Quill.sources.USER);
                      this.quill.setSelection(range.index + 1, Quill.sources.SILENT);

                      // NOTE: Changed from default handler! Applies previous formats on the new line.
                      Object.keys(context.format).forEach((name) => {
                        if (lineFormats[name] != null) return;
                        if (Array.isArray(context.format[name])) return;
                        if (name === "code" || name === "link") return;
                        this.quill.format(
                          name,
                          context.format[name],
                          Quill.sources.USER,
                        );
                      });

                      // NOTE: Changed from default handler! Ensure toolbar reflects the styles after the newline. Otherwise the buttons won't reflect the active formats until the user starts typing.
                      this.quill.getModule("toolbar").update(range);

                      return false;
                    },
                  },
                }                
            }        
        },
        placeholder: 'Start typing your text here...',
        theme: 'snow',
    });

    let debounceTimeout;
    quill.on('text-change', function(delta, oldDelta, source) {
        clearTimeout(debounceTimeout);
      
        // Set the debounce timeout to wait for the user to stop typing
        debounceTimeout = setTimeout(function() {
            // Handle the event after the debounce timeout, like a "change" event
            $(target+' .ql-editor').trigger('content-changed'); //custom trigger
        }, 500); // 500ms debounce delay
    });

    return quill;
}

function sanitiseQuillHTML(html) {
    html = convertEmojis(html);
    html = convertULOLQuill(html);
    return html;
}

function convertEmojis(html) {
    return html.replace(/[\u{1F600}-\u{1F64F}]/gu, function(match) {
        return `&#${match.codePointAt(0)};`;
    });
}

function convertULOLQuill(str) {
    if (str) {
        let re = /(<ol><li data-list="bullet">)(.*?)(<\/ol>)/;
        let strArr = str.split(re);

        while (
            strArr.findIndex((ele) => ele === '<ol><li data-list="bullet">') !== -1
        ) {
            let indx = strArr.findIndex(
                (ele) => ele === '<ol><li data-list="bullet">'
            );
            if (indx) {
                strArr[indx] = '<ul><li data-list="bullet">';
                let endTagIndex = strArr.findIndex((ele) => ele === "</ol>");
                strArr[endTagIndex] = "</ul>";
            }
        }
        return strArr.join("");
    }
    return str;
};

function sanitiseSMSText(input, maxLength = 160) {
    // Characters that count as 2 in GSM-7 (extended table + line breaks)
    const GSM_DOUBLE = ['^','{','}','\\','[','~',']','|','\r','\n'];

    //Sanitize: remove non-ASCII characters
    const sanitized = input.replace(/[^\x00-\x7f]/g, '');

    //Calculate GSM length and trim safely
    let length = 0;
    let trimmed = '';
    for (const ch of sanitized) {
        const add = GSM_DOUBLE.includes(ch) ? 2 : 1;
        if (length + add > maxLength) break;
        length += add;
        trimmed += ch;
    }

    return { text: trimmed, length: length };
}

function splitSanitisedSMSText(input, maxLength = 160) {
    // Characters that count as 2 in GSM-7 (extended table + line breaks)
    const GSM_DOUBLE = ['^', '{', '}', '\\', '[', '~', ']', '|', '\r', '\n'];

    //Sanitize: remove non-ASCII characters
    const sanitized = input.replace(/[^\x00-\x7f]/g, '');

    //Split by lines first
    const lines = sanitized.split(/(\r?\n)/); // keeps newlines as separate tokens

    const messages = [];
    let current = '';
    let length = 0;

    const flush = () => {
        if (current) {
            messages.push({ text: current, length });
            current = '';
            length = 0;
        }
    };

    // Go line by line (and newline by newline) to gracefully split messages around new lines
    for (const segment of lines) {
        let segLen = 0;
        for (const ch of segment) {
            segLen += GSM_DOUBLE.includes(ch) ? 2 : 1;
        }

        // if adding this segment exceeds limit → flush before adding
        if (length + segLen > maxLength) {
            // BUT: if the segment itself is too big (like a 300-char paragraph),
            // then split it internally at GSM-safe points
            if (segLen > maxLength) {
                for (const ch of segment) {
                    const add = GSM_DOUBLE.includes(ch) ? 2 : 1;
                    if (length + add > maxLength) {
                        flush();
                    }
                    current += ch;
                    length += add;
                }
            } else {
                // otherwise just start new message before this line
                flush();
                current += segment;
                length = segLen;
            }
        } else {
            // safe to add
            current += segment;
            length += segLen;
        }
    }

    flush(); // push last message

    return messages.map(item => item.text);
}



function isElementOutOfView($el, $container) {
    let rect = $el[0].getBoundingClientRect();
    let containerRect = $container[0].getBoundingClientRect();

    return rect.bottom < containerRect.top || rect.top > containerRect.bottom;
}

function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

function getCssVariable(name, el) {
    if (el) {
        return getComputedStyle(el).getPropertyValue(name).trim();
    } else {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
}

function clear_side_errors() {
    $('#side_errors .notification-box:not(.green):not(.amber)').remove();
    if ($('#side_errors').html().trim() == '') {
        $('#side_errors').hide();
    }
}

function fill_confirm_popup_select($select, options) {
	var $fg = $select.closest('.form-group');
	var $list = $fg.find('.confirm-popup-dd-list');
	$select.empty();
	$list.empty();
	for (var i = 0; i < options.length; i++) {
		var o = options[i];
		var val = (typeof o === 'object' && o !== null && o.value !== undefined) ? o.value : o;
		var text = (typeof o === 'object' && o !== null)
			? (o.string !== undefined ? o.string : (o.title !== undefined ? o.title : String(val)))
			: String(o);
		var $opt = $('<option></option>').attr('value', val).text(text);
		if (typeof o === 'object' && o !== null && o.selected) {
			$opt.prop('selected', true);
		}
		$select.append($opt);
		$list.append(
			$('<li></li>').append(
				$('<button type="button"></button>')
					.addClass('confirm-popup-dd-item dropdown-menu-item w-full cursor-pointer text-left')
					.attr('data-value', val)
					.text(text)
			)
		);
	}
	if (!$select.find('option:selected').length) {
		$select.find('option').first().prop('selected', true);
	}
	$fg.find('.confirm-popup-dd-label').first().text($select.find('option:selected').text());
}

function layoutConfirmPopupDropdown($btn) {
	var $menu = $btn.closest('.toggle_div').find('.dropdown-menu');
	var $footer = $('#confirm_popup .new-modal-footer');
	var $content = $('#confirm_popup .new-modal-content');
	if (!$menu.length || !$footer.length || !$btn.length || !$content.length) {
		return;
	}
	$('#confirm_popup .form-group:has(.confirm-popup-dd-btn)').css('marginBottom', '');
	var menuEl = $menu[0];
	$menu.css({ maxHeight: '', overflowY: '' });
	void menuEl.offsetHeight;
	var btnRect = $btn[0].getBoundingClientRect();
	var footerRect = $footer[0].getBoundingClientRect();
	var menuH = menuEl.scrollHeight;
	var gap = 10;
	var spaceBelow = Math.max(0, footerRect.top - btnRect.bottom - gap);
	var shortfall = menuH - spaceBelow + gap;
	if (shortfall > 0) {
		$btn.closest('.form-group').css('marginBottom', shortfall + 'px');
		void $content[0].offsetHeight;
	}
}

function resetConfirmPopupDropdownMenu($menu) {
	if (!$menu || !$menu.length) return;
	$menu.css({ maxHeight: '', overflowY: '' });
	$('#confirm_popup .form-group:has(.confirm-popup-dd-btn)').css('marginBottom', '');
}

$(document).on('click', '#confirm_popup .confirm-popup-dd-btn', function () {
	var $btn = $(this);
	requestAnimationFrame(function () {
		requestAnimationFrame(function () {
			var $menu = $btn.closest('.toggle_div').find('.dropdown-menu');
			if ($menu.hasClass('show_block')) {
				layoutConfirmPopupDropdown($btn);
			} else {
				resetConfirmPopupDropdownMenu($menu);
			}
		});
	});
});

$(document).on('click', '#confirm_popup .confirm-popup-dd-item', function (e) {
	e.preventDefault();
	var $fg = $(this).closest('.form-group');
	var v = $(this).attr('data-value');
	$fg.find('select').val(v);
	$fg.find('.confirm-popup-dd-label').first().text($(this).text());
	resetConfirmPopupDropdownMenu($(this).closest('.dropdown-menu'));
	$(this).closest('.dropdown-menu').removeClass('show_block');
});

function set_side_error(text,type='',keep='') {
    if (typeof text === 'string' && text.indexOf('Operation failed') === 0) {
        return;
    }
    let el = $($('#main_error').html());
    if (type) {
        el.addClass(type);
        el.find('.error_icon').attr('src','images/icons/'+(type == 'green' ? 'e_done' : 'e_warning')+'.svg');
    }   
    el.find('.error_text').html(text);
    $('#side_errors').append(el);
    $('#side_errors').show();

    // Auto-close green messages unless explicitly kept
    if ((type == 'green') && (keep == '')) {
        setTimeout(() => {
            el.find('.error_close').click();
        }, 3000);
    }

}

function open_confirm_popup(data={}) {
    if (data.fn) {
        $('#btn_execConfPopup').prop('dataset').intrac_fn = data.fn;
        $('#btn_execConfPopup').prop('dataset').intrac_fn_data = data.fn_data;
        if (data.msg) {
            $('#confirm_popup .popup_msg').html(data.msg);    
        }
        if (data.sel_options) {
            fill_confirm_popup_select($('#confirm_popup .popup_select'), data.sel_options);
            $('#confirm_popup .popup_select').closest('.form-group').removeClass('noshow');
        }
        if (data.sel2_options) {
            fill_confirm_popup_select($('#confirm_popup .popup_select2'), data.sel2_options);
            $('#confirm_popup .popup_select2').closest('.form-group').removeClass('noshow');
        }
        if (data.fn_data.includes('fn_input')) {
            $('#confirm_popup .popup_input').closest('.form-group').removeClass('noshow');
        }
        $('#confirm_popup').addClass('modal-open');
        animate_modal_intro('#confirm_popup');
    } else {
        set_side_error('Something went wrong with the confirmation pop-up, please re-try');
    }
}

function open_gif_popup(msg,img) {
    if (img) {
        $('#gif_popup .gif_msg').html(msg);
        $('#gif_popup .gif_img').html('<img src="/images/gifs/'+img+'" alt="" class="inline-block">');
        $('#gif_popup').addClass('modal-open');
        animate_modal_intro('#gif_popup');
    }
}

function close_popup() {
    $('.popups').removeClass('modal-open no_modal_backdrop');
    $('#btn_execConfPopup').prop('dataset').intrac_fn = '';
    $('#btn_execConfPopup').prop('dataset').intrac_fn_data = '';
    $('#confirm_popup .popup_msg').html('Are you sure? Press confirm to proceed');
    $('#confirm_popup .popup_select').closest('.form-group').addClass('noshow');
    $('#confirm_popup .popup_select').html('');
    $('#confirm_popup .confirm-popup-dd-list').empty();
    $('#confirm_popup .confirm-popup-dd-label').text('');
    $('#confirm_popup .popup_select2').closest('.form-group').addClass('noshow');
    $('#confirm_popup .popup_select2').html('');    
    $('#confirm_popup .popup_input').closest('.form-group').addClass('noshow');
    $('#confirm_popup .popup_input').val('');
    $('#confirm_popup .dropdown-menu.confirm_popup_dd_a, #confirm_popup .dropdown-menu.confirm_popup_dd_b').each(function () {
    	resetConfirmPopupDropdownMenu($(this));
    }).removeClass('show_block');
    $('#gif_popup .gif_msg').html('');
    $('#gif_popup .gif_img').html('');
}

function execute_confirm_popup() {
    let fn = $('#btn_execConfPopup').prop('dataset').intrac_fn;
    let fn_data = $('#btn_execConfPopup').prop('dataset').intrac_fn_data.split('~');
    
    //check for any selects in popups
    for (let i = 0; i < fn_data.length; i++) {
        if (fn_data[i] == 'fn_select') {
            fn_data[i] = $('#confirm_popup .popup_select').val() || '';
        }
        if (fn_data[i] == 'fn_select2') {
            fn_data[i] = $('#confirm_popup .popup_select2').val() || '';
        }
        if (fn_data[i] == 'fn_input') {
            fn_data[i] = $('#confirm_popup .popup_input:visible').val() || '';
        }
    }

    close_popup();
    if (fn) {
        window[fn](...fn_data);// function call e.g. delete_class_comment(comment_id)
    } else {
        set_side_error('Something went wrong with executing the confirmation pop-up, please re-try'); //this should never show
    }
}

function add_url_param(param,value) { // Add and Update the URL without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url.toString());
}

function remove_url_param(param) { // Delete and Update the URL without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState({}, '', url.toString());     
}

//Basic encryption to mask data
function encryptData(data) {
    if (data === '') {
        return data;
    } else {
        return CryptoJS.AES.encrypt(data).toString();    
    }
}

function decryptData(encryptedData) {
    if (encryptedData === '') {
        return encryptedData;
    } else {
        const bytes = CryptoJS.AES.decrypt(encryptedData);
        return bytes.toString(CryptoJS.enc.Utf8);        
    }
}

function collectModalAnimRowElements($content) {
    var nodes = [];

    function isVis(el) {
        var $e = $(el);
        return !$e.hasClass('noshow') && $e.css('display') !== 'none' && !$e.closest('.noshow').length;
    }

    function pushVisChildren($parent) {
        $parent.children().each(function () {
            if (isVis(this)) nodes.push(this);
        });
    }

    function pushFormAnimRows($form) {
        $form.children().each(function () {
            if (!isVis(this)) return;
            if (this.tagName === 'INPUT' && this.type === 'hidden') return;
            nodes.push(this);
        });
    }

    function pushModalTabBodyChildren($mtb) {
        $mtb.children().each(function () {
            if (!isVis(this)) return;
            if (this.tagName === 'FORM') {
                pushFormAnimRows($(this));
            } else {
                nodes.push(this);
            }
        });
    }

    function decomposeBlock(el) {
        var $el = $(el);

        if ($el.hasClass('modal-header')) {
            $el.find('h1,h2,h3,h4,h5,h6').each(function () { if (isVis(this)) nodes.push(this); });
            $el.find('button').each(function () { if (isVis(this)) nodes.push(this); });
            return;
        }

        if ($el.hasClass('new-modal-footer')) {
            pushVisChildren($el);
            return;
        }

        if ($el.is('ul.tab-list')) {
            $el.children('li').each(function () { if (isVis(this)) nodes.push(this); });
            return;
        }

        if ($el.hasClass('tab-content')) {
            var $active = $el.children('.tab-pane.active').first();
            if ($active.length) {
                var $mtc = $active.find('.modal-tab-content').first();
                if ($mtc.length) {
                    $mtc.children().each(function () {
                        if (!isVis(this)) return;
                        var $c = $(this);
                        if ($c.hasClass('tab-header')) {
                            pushVisChildren($c);
                        } else if ($c.hasClass('modal-tab-body')) {
                            pushModalTabBodyChildren($c);
                        } else {
                            nodes.push(this);
                        }
                    });
                } else {
                    pushVisChildren($active);
                }
            }
            return;
        }

        if ($el.hasClass('modal-body')) {
            $el.children().each(function () {
                if (!isVis(this)) return;
                decomposeBlock(this);
            });
            return;
        }

        nodes.push(el);
    }

    $content.children().each(function () {
        if (!isVis(this)) return;
        decomposeBlock(this);
    });

    return $(nodes);
}

function animate_modal_intro(selector) {
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var $backdrop = $(selector);
    if (!$backdrop.length) return;

    var PANEL_SCALE_MS = 460;
    var BACKDROP_MS = 220;
    var startScale = '0.74';
    var startY = '22';
    var CELL_STAGGER = 52;
    var ROW_DUR = 300;
    var contentStart = 160;
    var panelEase = 'cubic-bezier(0.22,1,0.36,1)';
    var innerEase = 'cubic-bezier(0.22,1,0.36,1)';

    var $panel = $backdrop.children().first();
    var $content = $backdrop.find('.new-modal-content').first();

    $backdrop.css('opacity', '0');
    if ($panel.length) {
        $panel.css({
            opacity: '0',
            transform: 'scale(' + startScale + ') translateY(' + startY + 'px)',
            transformOrigin: '50% 45%'
        });
    }

    void $backdrop[0].offsetWidth;

    $backdrop.css({ transition: 'opacity ' + BACKDROP_MS + 'ms ease-out', opacity: '1' });
    if ($panel.length) {
        $panel.css({
            transition: 'opacity ' + PANEL_SCALE_MS + 'ms ' + panelEase + ', transform ' + PANEL_SCALE_MS + 'ms ' + panelEase,
            opacity: '1',
            transform: 'scale(1) translateY(0)'
        });
    }

    if (!$content.length) {
        setTimeout(function () {
            $backdrop.css({ transition: '', opacity: '' });
            if ($panel.length) $panel.css({ transition: '', opacity: '', transform: '', transformOrigin: '' });
        }, PANEL_SCALE_MS + 40);
        return;
    }

    var $rows = collectModalAnimRowElements($content);
    if (!$rows.length) {
        $rows = $content.children().filter(function () {
            return !$(this).hasClass('noshow') && $(this).css('display') !== 'none';
        });
    }

    if (!$rows.length) {
        setTimeout(function () {
            $backdrop.css({ transition: '', opacity: '' });
            if ($panel.length) $panel.css({ transition: '', opacity: '', transform: '', transformOrigin: '' });
        }, PANEL_SCALE_MS + 40);
        return;
    }

    var maxDelay = 0;
    var cleanupMs;

    $rows.css({ opacity: '0', transform: 'translate(-18px, -18px) scale(0.92)' });

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            var cr = $content[0].getBoundingClientRect();
            var items = [];
            $rows.each(function () {
                var er = this.getBoundingClientRect();
                var cx = (er.left + er.width / 2) - cr.left;
                var cy = (er.top + er.height / 2) - cr.top;
                items.push({ el: this, score: cx + cy });
            });
            items.sort(function (a, b) {
                return a.score - b.score;
            });
            items.forEach(function (it, i) {
                var d = i * CELL_STAGGER;
                if (d > maxDelay) maxDelay = d;
                var el = it.el;
                setTimeout(function () {
                    el.style.transition = 'opacity ' + ROW_DUR + 'ms ease-out, transform ' + ROW_DUR + 'ms ' + innerEase;
                    el.style.opacity = '1';
                    el.style.transform = 'translate(0,0) scale(1)';
                }, contentStart + d);
            });
            cleanupMs = Math.max(contentStart + maxDelay + ROW_DUR + 80, PANEL_SCALE_MS + 50);
            setTimeout(function () {
                $backdrop.css({ transition: '', opacity: '' });
                if ($panel.length) $panel.css({ transition: '', opacity: '', transform: '', transformOrigin: '' });
                $rows.css({ transition: '', opacity: '', transform: '' });
            }, cleanupMs);
        });
    });
}

