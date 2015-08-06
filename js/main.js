var clientId = '200816328603.apps.googleusercontent.com';
var apiKey = 'AIzaSyBDdqTJqpRbFIGwla64whKEE1861Qovtzw';
var scopes = 'https://www.googleapis.com/auth/calendar.readonly';

var todayDate = new Date();

var currentTruckMonth = todayDate.getMonth();
var currentTruckYear = todayDate.getFullYear();

var currentTruckEvents;

var currentEventsMonth = todayDate.getMonth();
var currentEventsYear = todayDate.getFullYear();

var currentEvents;

$.fn.exists = function () {
    return this.length !== 0;
}

Date.prototype.monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
];

Date.prototype.dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

Date.prototype.getDayName = function() {
    return this.dayNames[this.getDay()];
};

Date.prototype.getMonthName = function() {
    return this.monthNames[this.getMonth()];
};
Date.prototype.getShortMonthName = function () {
    return this.getMonthName().substr(0, 3);
};

Date.locale = {
    en: {
       month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
       month_names_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
};

/* initially hide all brewery links*/
$('.brewery-links-container').hide();
 
$('.beer').click(function(){
        $linksContainer = $(this).find('.brewery-links-container');
        if($linksContainer.is(":visible") == false) {
            $('.brewery-links-container:visible').hide();   
        }
        else {
            
        }
        
        $linksContainer.toggle();
        
     });

//onload hide all but the first row contents (beer and wine)
$('.header-container + .sm-content').hide();
$('.header-container + .xs-content').hide();
$( '.sm-content').hide(); //festival and events on desktop take up 12 cols

//if on iphone show only the beer one
if ($(".col-sm-height").css("display") == "table-cell" ){
    $('.header-container + .xs-content').slice(0,2).show();
}
else {
    $('.header-container + .xs-content').first().show();
}


$(document).ready(function() {    
    // run test on resize of the window
    $(window).resize(checkColumns);
    
     //gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
    
});

//handle click events on header containers
$('.header-container').click(function(evt){
    
    
        //check to see if content is already being displayed
        $content = $(this).parent().find('.xs-content');
        if ($content.exists())
        {
            if($content.is(":visible") == false) {
                
                //if in iphone view, hide others and show this one
                if ($(".col-sm-height").css("display") != "table-cell" ){
                    $('.header-container + .xs-content').slideUp();
                    $('.sm-content').slideUp();
                    $content.slideDown();
                }
                else {
                    $('.header-container + .xs-content').slideUp();
                    $('.sm-content').slideUp();
                    $content.closest('.row').find('.header-container + .xs-content').slideDown();
                }
                
            }
            else {
                //do nothing if already visible
            }
        }
        else { 
            //didn't find it, must be desktop version
            $header = $(this).data('header');
            
            $smcontent = $('.' + $header + ' > .sm-content');
            
            if($smcontent.is(":visible") == false) {
                $('.header-container + .xs-content').slideUp();
                //$('.hidden-xs .sm-content').hide();
                $('.sm-content').slideUp();
                $smcontent.show();
            }
        }
    });

//if showing one column in iphone mode, show the others when resized to
function checkColumns() {
    //which column is shown
    $headerContents = $('.header-container + .xs-content');
    
    if ($(".col-sm-height").css("display") == "table-cell" ){
        
        //we may have resized from iphone show the other column
        $headerContents.each(function(i){
            if($(this).is(":visible") == true) {
            //if i is even show the next one, if it is odd show the previous
                if (i % 2 === 0 ) {
                   $headerContents.eq(i+1).show();
                }
                else{
                    $headerContents.eq(i-1).show();
                }
            }
        });
    }
    else {
        //in iphone size, don't worry about showing any other ones than the ones showing
    }
    
    //reload Food truck calendar events
    var date = new Date();
    date.setMonth(currentTruckMonth);
    date.setDate(1);
    date.setYear(currentTruckYear);
    updateTruckCalendar(currentTruckEvents, date);
    
    //reload Events calendar events
    var date = new Date();
    date.setMonth(currentEventsMonth);
    date.setDate(1);
    date.setYear(currentEventsYear);
    updateEventsCalendar(currentEvents, date);
}


/* Google calendar functions*/
function initGapi() {
    gapi.client.setApiKey('AIzaSyBDdqTJqpRbFIGwla64whKEE1861Qovtzw');
    
    window.setTimeout(function(){var ret = gapi.client.load('calendar', 'v3', loadGoogleCalendar);},1);
}

function showGoogleCalendarTruckEventsForDate(date){
    
    currentTruckYear = date.getFullYear();
    currentTruckMonth = date.getMonth();
    var lastDateOfPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0, 24);
    var lastDateOfMonth = new Date(date.getFullYear(), date.getMonth()+1, 0, 23);
    
    //alert(lastDayOfPrevMonth);
    //alert(lastDayOfMonth);

    $('.foodtruck .current-month').html(date.getMonthName().toUpperCase() + ' ' + date.getFullYear());
    
    var request = gapi.client.calendar.events.list({
        'calendarId': 'nnosiftcsqsohinocu72om9rbk@group.calendar.google.com',
        'timeMin': lastDateOfPrevMonth.toISOString(),
        'timeMax': lastDateOfMonth.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime'
    });

    request.execute(function(resp) {
        var events = resp.items;
        
        //clone the array
        currentTruckEvents = events.slice(0);
        
        //alert(events.length);
        //stuff = JSON.stringify(events);
        //alert(events.length);
        updateTruckCalendar(events, lastDateOfMonth)
    });
}

function showGoogleCalendarEventsForDate(date){
    
    currentEventsYear = date.getFullYear();
    currentEventsMonth = date.getMonth();
    var lastDateOfPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0, 24);
    var lastDateOfMonth = new Date(date.getFullYear(), date.getMonth()+1, 0, 23);
    
    $('.events .current-month').html(date.getMonthName().toUpperCase() + ' ' + date.getFullYear());
    
    var request = gapi.client.calendar.events.list({
        'calendarId': 'fq86om4m6qkus39jn6bejor110@group.calendar.google.com',
        'timeMin': lastDateOfPrevMonth.toISOString(),
        'timeMax': lastDateOfMonth.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime'
    });

    request.execute(function(resp) {
        var events = resp.items;
        
        //clone the array
        currentEvents = events.slice(0);
        
        //alert(events.length);
        //stuff = JSON.stringify(events);
        //alert(events.length);
        updateEventsCalendar(events, lastDateOfMonth)
    });
}

function selectTruckDate(eventDate)
{

    //$('#foodtruck-calendar-phone .selected').removeClass('selected');
    
    //get the date and get the events
    console.log(eventDate);
    
    dateString = eventDate.getDayName() + ", " + eventDate.getMonthName() + " " + eventDate.getDate() + ", " + eventDate.getFullYear();
    console.log(dateString);
    
    $('#foodtruck-calendar-phone .eventDetails-date').html(dateString.toUpperCase());
    $('#foodtruck-calendar-phone .eventDetails-events').html('');
    
    noEvents = true;
    
    for (var i = 0; i < currentTruckEvents.length; i++){
        summary = currentTruckEvents[i].summary;
        
        startDate = currentTruckEvents[i].start.dateTime == undefined ? currentTruckEvents[i].start.date.replace(/-/g, "/") + " 01:00:00" : currentTruckEvents[i].start.dateTime;
        
        var gCalDate = new Date(startDate);
        if(gCalDate.getDate() == eventDate.getDate() && gCalDate.getMonth() == eventDate.getMonth() && summary != undefined && summary.indexOf("OPEN") != 0) {
            $('#foodtruck-calendar-phone .eventDetails-events').append("<div class='eventDetails'>" + summary.toUpperCase() + "</div>");
            noEvents = false;
        }
    }
    
    if (noEvents)
        $('#foodtruck-calendar-phone .eventDetails-events').append("<div class='eventDetails'>NO EVENTS</div>");
            
}

function selectEventDate(eventDate)
{

    //get the date and get the events
    console.log(eventDate);
    
    dateString = eventDate.getDayName() + ", " + eventDate.getMonthName() + " " + eventDate.getDate() + ", " + eventDate.getFullYear();
    console.log(dateString);
    
    $('#events-calendar-phone .eventDetails-date').html(dateString.toUpperCase());
    $('#events-calendar-phone .eventDetails-events').html('');
    
    noEvents = true;
    
    for (var i = 0; i < currentEvents.length; i++){
        summary = currentEvents[i].summary;
        
        startDate = currentEvents[i].start.dateTime == undefined ? currentEvents[i].start.date.replace(/-/g, "/") + " 01:00:00" : currentEvents[i].start.dateTime;
        
        var gCalDate = new Date(startDate);
        
        //timeString = formatAMPM(eventDate) + ' - ' + formatAMPM(eventEndDate);
        
        if(gCalDate.getDate() == eventDate.getDate() && gCalDate.getMonth() == eventDate.getMonth() && summary != undefined && summary.indexOf("OPEN") != 0) {
            
            $event = $("<div class='eventDetails'>" + summary.toUpperCase() + "</div>");
                        
            $event.on('click', {
               theEvent: currentEvents[i],
               theSummary: summary
                }, popupEvent);
            
            $('#events-calendar-phone .eventDetails-events').append($event);
            noEvents = false;
        }
    }
    
    if (noEvents)
        $('#events-calendar-phone .eventDetails-events').append("<div class='eventDetails'>NO EVENTS</div>");
            
}

function updateTruckCalendar(theEvents, date)
{
    var lastDateOfMonth = new Date(date.getFullYear(), date.getMonth()+1, 0,23);
    
    $(".foodtruck .long-month").hide();
    
    //clone the array
    events = theEvents.slice(0);
    
    lastDayOfMonth = lastDateOfMonth.getDate();
    lastDateOfMonth.setDate(1);
    var firstDayOfWeekOfMonth = lastDateOfMonth.getDay();
    var daysProcessed = 0;
    // there are 35 'day' blocks (0-34) in calendar, need to figure out when to start the numbering for the current month
    //only update the calendar depending which view
    if ($(".col-sm-height").css("display") == "table-cell" ){
        $('#foodtruck-calendar .calendar-day').each(function(index) {
            $(this).find('.date').html('');
            if( daysProcessed == 0 && index == firstDayOfWeekOfMonth){
                daysProcessed = 1;
            }
            
            if(index > 34 && daysProcessed <= lastDayOfMonth)
                $(".foodtruck .long-month").show();
            
            if(daysProcessed > 0 && daysProcessed <= lastDayOfMonth) {
                $(this).find('.date').html(''+daysProcessed);
                
                $(this).find('.date').nextAll().remove();
                
                for (var i = 0; i < events.length; i++){
                    summary = events[i].summary;
                    timeDesc = 'brunch';
                    if (summary != undefined && summary.indexOf('Lunch') != -1)
                        timeDesc = 'lunch';
                    else if (summary != undefined && summary.indexOf('Dinner') != -1)
                        timeDesc = 'dinner';
                        
                    startDate = events[i].start.dateTime == undefined ? events[i].start.date.replace(/-/g, "/") + " 01:00:00" : events[i].start.dateTime;
                    
                    gCalDate = new Date(startDate);
                    if(gCalDate.getDate() == daysProcessed && gCalDate.getMonth() == date.getMonth() && summary != undefined && summary.indexOf("OPEN") != 0) {
                        $(this).find('.date').append('<div class="show-info ' + timeDesc + '">' + summary + '</div>');
                        events.splice(i, 1);
                        i--;
                    }
                }
                
                //does this date have any events?
                daysProcessed ++;
            }
        });

    }
    else {
        $('#foodtruck-calendar-phone .calendar-day').removeClass("selected");
        
        $('#foodtruck-calendar-phone .calendar-day').each(function(index) {
            $(this).find('.date').html('');
            $(this).removeClass('hasTrucks');
            $(this).off('click'); //remove click handler
            
            if( daysProcessed == 0 && index == firstDayOfWeekOfMonth){
                daysProcessed = 1;
                $(this).addClass("selected");
            }
            
            if(index > 34 && daysProcessed <= lastDayOfMonth)
                $(".foodtruck .long-month").show();

            
            if(daysProcessed > 0 && daysProcessed <= lastDayOfMonth) {
                addedEvent = false;
                
                $(this).find('.date').html(''+daysProcessed);
                
                $(this).find('.date').nextAll().remove();
                
                for (var i = 0; i < events.length; i++){
                    summary = events[i].summary;
                    //gCalDate = new Date(events[i].start.dateTime == undefined ? events[i].start.date : events[i].start.dateTime);
                    //if(gCalDate.getDate() == daysProcessed && summary != undefined && summary.indexOf("OPEN") != 0) {
                    startDate = events[i].start.dateTime == undefined ? events[i].start.date.replace(/-/g, "/") + " 01:00:00" : events[i].start.dateTime;
                    
                    var gCalDate = new Date(startDate);
                    if(gCalDate.getDate() == daysProcessed && gCalDate.getMonth() == date.getMonth() && summary != undefined && summary.indexOf("OPEN") != 0) {
                        $(this).addClass('hasTrucks');
                        events.splice(i, 1);
                        i--;
                        addedEvent = true;
                    }
                }
                
                date.setDate(daysProcessed);
                newDate = new Date(date.getTime());
                   
                $(this).on('click', {
                           theDate: newDate
                        }, function(event) {
                            $('#foodtruck-calendar-phone .calendar-day').removeClass("selected"); 
                            $(this).addClass("selected"); 
                            selectTruckDate(event.data.theDate); 
                            });
                                 
                //does this date have any events?
                daysProcessed ++;
            }
        });
        
        date.setDate(1);
        newDate = new Date(date.getTime());

        selectTruckDate(date);
    }        
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function popupEvent(event)
{
    thisEvent = event.data.theEvent;
    
    showTimes = thisEvent.start.dateTime == undefined ? false : true;
    
    startDate = thisEvent.start.dateTime == undefined ? thisEvent.start.date.replace(/-/g, "/") + " 01:00:00" : thisEvent.start.dateTime;
    endDate = thisEvent.end.dateTime == undefined ? thisEvent.end.date.replace(/-/g, "/") + " 01:00:00" : thisEvent.end.dateTime;
    eventDate = new Date(startDate);
    eventEndDate = new Date(endDate);
    
    dateString = eventDate.getDayName() + ", " + eventDate.getMonthName() + " " + eventDate.getDate() + ", " + eventDate.getFullYear();

    timeString = formatAMPM(eventDate) + ' - ' + formatAMPM(eventEndDate);
    
    //build the html for the popup
    eventHtml = '<h2>'+ event.data.theSummary+'</h2><h4>'+dateString+'</h4>'+ (showTimes ? '<h5>'+timeString+'</h5>' : '') + (thisEvent.description == undefined ? 'NO DETAILS' : thisEvent.description);
    
    $.magnificPopup.open({
      items: {
          src: '<div class="white-popup">' + eventHtml + '</div>',
          type: 'inline',
      },
      closeBtnInside: true
    }); 
}

function updateEventsCalendar(theEvents, date)
{
    var lastDateOfMonth = new Date(date.getFullYear(), date.getMonth()+1, 0,23);
    
    $(".events .long-month").hide();
    
    //clone the array
    events = theEvents.slice(0);
    
    lastDayOfMonth = lastDateOfMonth.getDate();
    lastDateOfMonth.setDate(1);
    var firstDayOfWeekOfMonth = lastDateOfMonth.getDay();
    var daysProcessed = 0;
    // there are 35 'day' blocks (0-34) in calendar, need to figure out when to start the numbering for the current month
    //only update the calendar depending which view
    if ($(".col-sm-height").css("display") == "table-cell" ){
        $('#events-calendar .calendar-day').each(function(index) {
            $(this).find('.date').html('');
            if( daysProcessed == 0 && index == firstDayOfWeekOfMonth){
                daysProcessed = 1;
            }
            
            if(index > 34 && daysProcessed <= lastDayOfMonth)
                $(".events .long-month").show();
            
            if(daysProcessed > 0 && daysProcessed <= lastDayOfMonth) {
                $(this).find('.date').html(''+daysProcessed);
                
                $(this).find('.date').nextAll().remove();
                
                
                for (var i = 0; i < events.length; i++){
                    summary = events[i].summary;
                    timeDesc = 'events';
                        
                    startDate = events[i].start.dateTime == undefined ? events[i].start.date.replace(/-/g, "/") + " 01:00:00" : events[i].start.dateTime;
                    
                    gCalDate = new Date(startDate);
                    if(gCalDate.getDate() == daysProcessed && gCalDate.getMonth() == date.getMonth() && summary != undefined) {
                        $event = $('<div class="show-info ' + timeDesc + '">' + summary + '</div>');
                        
                        $event.on('click', {
                           theEvent: events[i],
                           theSummary: summary
                            }, popupEvent);
                        
                        $(this).find('.date').append($event);
                        
                        events.splice(i, 1);
                        i--;
                        
                        //set the onclick for this event
                        
                        /*
                        $.magnificPopup.open({
                          items: {
                              src: '<div class="white-popup">Dynamically created popup</div>',
                              type: 'inline'
                          },
                          closeBtnInside: true
                        });*/
                    }
                }
                
                //does this date have any events?
                daysProcessed ++;
            }
        });

    }
    else {
        $('#events-calendar-phone .calendar-day').removeClass("selected");
        
        $('#events-calendar-phone .calendar-day').each(function(index) {
            $(this).find('.date').html('');
            $(this).removeClass('hasTrucks');
            $(this).off('click'); //remove click handler
            
            if( daysProcessed == 0 && index == firstDayOfWeekOfMonth){
                daysProcessed = 1;
                $(this).addClass("selected");
            }
            
            if(index > 34 && daysProcessed <= lastDayOfMonth)
                $(".events .long-month").show();

            
            if(daysProcessed > 0 && daysProcessed <= lastDayOfMonth) {
                addedEvent = false;
                
                $(this).find('.date').html(''+daysProcessed);
                
                $(this).find('.date').nextAll().remove();
                
                for (var i = 0; i < events.length; i++){
                    summary = events[i].summary;
                    //gCalDate = new Date(events[i].start.dateTime == undefined ? events[i].start.date : events[i].start.dateTime);
                    //if(gCalDate.getDate() == daysProcessed && summary != undefined && summary.indexOf("OPEN") != 0) {
                    startDate = events[i].start.dateTime == undefined ? events[i].start.date.replace(/-/g, "/") + " 01:00:00" : events[i].start.dateTime;
                    
                    var gCalDate = new Date(startDate);
                    if(gCalDate.getDate() == daysProcessed && gCalDate.getMonth() == date.getMonth() && summary != undefined) {
                        $(this).addClass('hasTrucks');
                        events.splice(i, 1);
                        i--;
                        addedEvent = true;
                    }
                }
                
                date.setDate(daysProcessed);
                newDate = new Date(date.getTime());
                
                $(this).off('click');   
                $(this).on('click', {
                           theDate: newDate
                        }, function(event) {
                            $('#events-calendar-phone .calendar-day').removeClass("selected"); 
                            $(this).addClass("selected"); 
                            selectEventDate(event.data.theDate); 
                            });
                                 
                //does this date have any events?
                daysProcessed ++;
            }
        });
        
        date.setDate(1);
        newDate = new Date(date.getTime());

        selectEventDate(date);
    }        
}


function loadGoogleCalendar()
{
    //set up the truck calendar
    showGoogleCalendarTruckEventsForDate(todayDate);
    
    //wire up the previous and next months for the food trucks
    
    $('.foodtruck .month-browser .previous').click(function(){
        //load the previous month events
        previous = new Date();
        previous.setYear(currentTruckYear)
        previous.setDate(1);
        previous.setMonth(currentTruckMonth - 1);
        showGoogleCalendarTruckEventsForDate(previous);
    });
       
    $('.foodtruck .month-browser .next').click(function(){
        //load the next month events
        next = new Date();
        next.setYear(currentTruckYear)
        next.setDate(1);
        next.setMonth(currentTruckMonth + 1);
        showGoogleCalendarTruckEventsForDate(next);
    });
    
    //set up the events calendar
    showGoogleCalendarEventsForDate(todayDate);
    
    //wire up the previous and next months for the food trucks
    
    $('.events .month-browser .previous').click(function(){
        //load the previous month events
        previous = new Date();
        previous.setYear(currentEventsYear)
        previous.setDate(1);
        previous.setMonth(currentEventsMonth - 1);
        showGoogleCalendarEventsForDate(previous);
    });
       
    $('.events .month-browser .next').click(function(){
        //load the next month events
        next = new Date();
        next.setYear(currentEventsYear)
        next.setDate(1);
        next.setMonth(currentEventsMonth + 1);
        showGoogleCalendarEventsForDate(next);
    });
   
}

$(document).ready(function() {    
    if(window.location.hash) {
        var hash = '.' + window.location.hash.substring(1); //Puts hash in variable, and removes the # character
        //(hash == 'events' || hash == 'foodtruck') && 
        if ($(".col-sm-height").css("display") != "table-cell") //iphone
        {
            $('.col-md-6'+hash + ' .header-container').first().click();
        }
        else
            $(hash + ' .header-container').click();
            
        // Fragment exists
    }
    
    //handle clicking link in extras for foodtruck
    
    $(".extras .overview [u=foodtruck]").click(function(){
        $(".foodtruck .header-container").click();
        });
 
});

$(document).ready(function ($) {
    var options = {
        $AutoPlay: true,                                    //[Optional] Whether to auto play, to enable slideshow, this option must be set to true, default value is false
        $AutoPlaySteps: 1,                                  //[Optional] Steps to go for each navigation request (this options applys only when slideshow disabled), the default value is 1
        $AutoPlayInterval: 10000,                            //[Optional] Interval (in milliseconds) to go for next slide since the previous stopped if the slider is auto playing, default value is 3000
        $PauseOnHover: 1,                                   //[Optional] Whether to pause when mouse over if a slider is auto playing, 0 no pause, 1 pause for desktop, 2 pause for touch device, 3 pause for desktop and touch device, 4 freeze for desktop, 8 freeze for touch device, 12 freeze for desktop and touch device, default value is 1

        $ArrowKeyNavigation: true,   			            //[Optional] Allows keyboard (arrow key) navigation or not, default value is false
        $SlideEasing: $JssorEasing$.$EaseOutQuint,          //[Optional] Specifies easing for right to left animation, default value is $JssorEasing$.$EaseOutQuad
        $SlideDuration: 800,                                //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500
        $MinDragOffsetToSlide: 20,                          //[Optional] Minimum drag offset to trigger slide , default value is 20
        //$SlideWidth: 600,                                 //[Optional] Width of every slide in pixels, default value is width of 'slides' container
        //$SlideHeight: 300,                                //[Optional] Height of every slide in pixels, default value is height of 'slides' container
        $SlideSpacing: 0, 					                //[Optional] Space between each slide in pixels, default value is 0
        $DisplayPieces: 1,                                  //[Optional] Number of pieces to display (the slideshow would be disabled if the value is set to greater than 1), the default value is 1
        $ParkingPosition: 0,                                //[Optional] The offset position to park slide (this options applys only when slideshow disabled), default value is 0.
        $UISearchMode: 1,                                   //[Optional] The way (0 parellel, 1 recursive, default value is 1) to search UI components (slides container, loading screen, navigator container, arrow navigator container, thumbnail navigator container etc).
        $PlayOrientation: 1,                                //[Optional] Orientation to play slide (for auto play, navigation), 1 horizental, 2 vertical, 5 horizental reverse, 6 vertical reverse, default value is 1
        $DragOrientation: 1,                                //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)

        $ArrowNavigatorOptions: {                           //[Optional] Options to specify and enable arrow navigator or not
            $Class: $JssorArrowNavigator$,                  //[Requried] Class to create arrow navigator instance
            $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
            $AutoCenter: 2,                                 //[Optional] Auto center arrows in parent container, 0 No, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
            $Steps: 1,                                      //[Optional] Steps to go for each navigation request, default value is 1
            $Scale: false                                   //Scales bullets navigator or not while slider scale
        },

        $BulletNavigatorOptions: {                                //[Optional] Options to specify and enable navigator or not
            $Class: $JssorBulletNavigator$,                       //[Required] Class to create navigator instance
            $ChanceToShow: 2,                               //[Required] 0 Never, 1 Mouse Over, 2 Always
            $AutoCenter: 1,                                 //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
            $Steps: 1,                                      //[Optional] Steps to go for each navigation request, default value is 1
            $Lanes: 1,                                      //[Optional] Specify lanes to arrange items, default value is 1
            $SpacingX: 12,                                   //[Optional] Horizontal space between each item in pixel, default value is 0
            $SpacingY: 4,                                   //[Optional] Vertical space between each item in pixel, default value is 0
            $Orientation: 1,                                //[Optional] The orientation of the navigator, 1 horizontal, 2 vertical, default value is 1
            $Scale: false                                   //Scales bullets navigator or not while slider scale
        }
    };

    //Make the element 'slider1_container' visible before initialize jssor slider.
    $("#slider1_container").css("display", "block");
    var jssor_slider1 = new $JssorSlider$("slider1_container", options);
    
    $("#slider1_container div").each(function(){ // the "div" wrapping the "img"

        var number = $(this).index(); // get the slideIndex !!
        $(this).children("div[u=caption]").attr("id","caption_" + number);

    });

    //responsive code begin
    //you can remove responsive code if you don't want the slider scales while window resizes
    function ScaleSlider() {
        var parentWidth = jssor_slider1.$Elmt.parentNode.clientWidth;
        if (parentWidth) {
            jssor_slider1.$ScaleWidth(parentWidth);
        }
        else
            window.setTimeout(ScaleSlider, 30);
    }
    ScaleSlider();

    $(window).bind("load", ScaleSlider);
    $(window).bind("resize", ScaleSlider);
    $(window).bind("orientationchange", ScaleSlider);
    
    
    //responsive code end
    
    jssor_slider1.$On($JssorSlider$.$EVT_PARK,function(slideIndex,fromIndex){
     //alert( 'Slide:' + slideIndex + ' of ' + jssor_slider1.$SlidesCount() + ' Caption:' + $("#caption_" + slideIndex).text());
     //load caption
     
     $('#displayIndex').text((slideIndex + 1) + ' / ' + jssor_slider1.$SlidesCount());
     $('.slider-caption').text($("#caption_" + (slideIndex+1)).text());
   });
});