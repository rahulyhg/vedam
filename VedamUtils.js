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
        user: "replace with user name here",
        pass: "replace with password here"
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
        console.log("Sai Date:" + month + "/" + dayOfMonth)
        let day = month + '/' + dayOfMonth + '/2017'
        let tamilDay = this.getTamilDay(day)
        return tamilDay
    }

    getBirthdayReminders(listOfPeople){
        var birthdayReminders=[]
        var today=this.getTamilToday()

        let tamilMonth=today.Month
        let tamilStar=today.Star
        console.log('Matching -->',tamilStar)
        
        birthdayReminders = listOfPeople.filter(function (elem) {
            return (elem[3] === tamilStar);
        });

        return birthdayReminders
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