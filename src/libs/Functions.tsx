import _ from 'lodash';

export function is_empty(val): boolean
{
    if (val === null || typeof val == 'undefined')
        return true;

    if (typeof val == 'string')
        return val.trim().length == 0;

    if (typeof val == 'function' || typeof val == 'number' || val instanceof File || typeof val == 'boolean')
        return false;

    if (typeof val == 'object')
        return _.isEmpty(val);

    return true;
};

export function time_to_minutes(time): number
{
    time = time.split(':');

    return (parseInt(time[0])*60) + parseInt(time[1]);
};

export function minutes_to_time(minutes, multiple_days = false, allow_negatives = false): string
{
    if(typeof multiple_days == 'undefined')
        multiple_days = false;
    
    if(typeof allow_negatives == 'undefined')
        allow_negatives = true;
    
    var hours       = 0;
    var negative 	= false;

    if(minutes > 0 || allow_negatives)
    {
        if(minutes < 0)
        {
            negative 	= true;
            minutes 	*= -1;
        }

        hours		= Math.floor(minutes/60);
        minutes 	= (minutes%60);

        if(!multiple_days)
            hours = hours%24;
    }
    else
        minutes = 0;

    return (negative ? '-' : '') + (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
};

export function minutes_to_time_text(start_minutes, allways_show_minutes = true): string
{
    let minus       = (start_minutes < 0);
    start_minutes   = Math.abs(start_minutes);
    let hours       = Math.floor(start_minutes / 60);
    let minutes     = start_minutes % 60;

    return (minus ? '-' : '') + hours + ' u' + (allways_show_minutes || minutes > 0 ? ' ' + minutes + ' m' : '');
};

export function seconds_to_time(start_seconds): string
{
    let minutes = _.floor(start_seconds / 60);
    const hours = _.floor(minutes / 60);
    const seconds = start_seconds - (minutes * 60);
    
    minutes -= hours * 60;

    let string = '';

    if(hours >= 0)
        string += (hours < 10 ? '0' : '') + hours + ':';

    string += (minutes < 10 ? '0' : '') + minutes + ':'
    string += (seconds < 10 ? '0' : '') + seconds

    return string
};