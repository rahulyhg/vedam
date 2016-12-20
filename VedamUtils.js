'use strict'
var path = require('path')
var TAMIL_CALENDAR_DATA = path.resolve('data/TamilCalendar.json')
var fs = require('fs');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
var smtpTransport = nodemailer.createTransport(smtpTransport({
    host: "smtp.gmail.com",
    secureConnection: false,
    port: 587,
    auth: {
        user: "username",
        pass: "password"
    }
}));

class VedamUtils {

    constructor() {
        this.tamilCalendar
    }

    readCalendarData() {
        console.log('Getting Tamil Calendar')
        var calendarData
        var content = fs.readFileSync(TAMIL_CALENDAR_DATA)
        calendarData = JSON.parse(content)
        //  console.log('Data from Tamil Calendar',calendarData[0])
        this.tamilCalendar = calendarData
        return calendarData
    }

    getTamilDay(englishDate) {
        if (this.calendarData === undefined) {
            console.log('=Getting Calendar Data =>Calling read calendar data')
            this.readCalendarData()
        }

        var tamilDay = this.tamilCalendar.filter(function (o) {
            return (o.EngDate === englishDate);
        });

        //console.log('--->',tamilDay[0])
        return tamilDay[0]
    }

    getTamilToday() {
        var d = new Date();
        console.log('Date is', d)
        let dayOfMonth = d.getDate()
        let month = d.getMonth() + 1
        let year = d.getFullYear()
        console.log("Sai Date:" + month + "/" + dayOfMonth)
        let day = month + '/' + dayOfMonth + '/' + year
        console.log('Date is ', day)
        let tamilDay = this.getTamilDay(day)
        return tamilDay
    }

    getBirthdayReminders(listOfPeople) {
        var birthdayReminders = []
        var today = this.getTamilToday()

        let tamilMonth = today.Month
        let tamilStar = today.Star
        console.log('Matching -->', tamilStar)

        birthdayReminders = listOfPeople.filter(function (elem) {
            return (elem[3] === tamilStar);
        });

        return birthdayReminders
    }


    getReminderNotSet(listOfPeople) {
        var reminderNotSet = []
        listOfPeople.forEach(function (person, index) {
            //    console.log("--->" + index);
            person[10] = index
        });

        reminderNotSet = listOfPeople.filter(function (elem) {
            return (elem[7] === undefined);
        });

        return reminderNotSet
    }


    calculateReminders(listOfPeople) {
        var that=this
       listOfPeople.forEach(function (person, index) {
            //    console.log("--->" + index);
            person[7] = that.getReminderForPerson(person[2],person[3],that.getNoOfDays(person[4]))
        });
       return listOfPeople

    }


    getReminderForPerson(month,nakshatram,noOfDays){
        if (this.calendarData === undefined) {
            console.log('=Getting Calendar Data =>Calling read calendar data')
            this.readCalendarData()
        }
        console.log("checking for "+month+" and "+nakshatram)
        var englishDay = this.tamilCalendar.filter(function (o) {
            return (o.Month.toUpperCase() === month.toUpperCase() && o.Star.toUpperCase() === nakshatram.toUpperCase() );
        });

        console.log('Eng Date --->',englishDay[0])
        let englishDate=englishDay[0].EngDate
        let eng=new Date(englishDate)
        eng.setDate(eng.getDate()-noOfDays);
        console.log("English Date",eng )
        let engDateFormat = (eng.getMonth()+1)+"/"+eng.getDate()+"/"+eng.getFullYear()
        return engDateFormat
    }

    getNoOfDays(textDays){
        if(textDays==='On Nakshatra Birthday')
            return 0

        return Number(textDays.substring(0,1))
    }

    getPersonsWithReminderToday(listOfPeople){
       var personsToBeIntimatedToday = []
        var dateToday = new Date();
        console.log('For sending Reminders Date is', dateToday)
        let dayOfMonth = dateToday.getDate()
        let month = dateToday.getMonth() + 1
        let year = dateToday.getFullYear()
        let todayDate=month+'/'+dayOfMonth+"/"+year
        personsToBeIntimatedToday = listOfPeople.filter(function (elem) {
            return (elem[7] === todayDate && elem[8] !== 'Mail Sent');
        });
        return personsToBeIntimatedToday
    }


    sendEmail(name, emailId, nakshatram, month) {
        console.log('Sending email to ' + emailId)

        var htmlBody = 'Greetings !!<br/><br/>' +
            'Thank you for supporting our VRNT Veda samrakshanam scheme and for registering to receive monthly and yearly reminders for your donations.<br/>'
            + '<br/>Below is a summary of your information registered:<br/>'
            + '<br/><br/><b>Name:' + name + '</b><br/>'
            + '<b>Email:' + emailId + '</b><br/>'
            + '<b>Nakshatram:' + nakshatram + '</b><br/>'
            + '<b>Month:' + month + '</b><br/>'
            + '<br/><b>Kanchi Shankara Kamakoti Shankara</b> !!'
            + '<br/><br/>Best regards,'
            + '<br/>KKSF Midwest Chapter'
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"KKSF Midwest Vedasamrakshanam" <kksfvedasamrakshanam@gmail.com>', // sender address
            to: emailId, // list of receivers
            subject: 'Vedasamrakshanam Registration Acknowledgement:' + name, // Subject line
            html: htmlBody
            // html body
        };

        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    }

}

module.exports = VedamUtils