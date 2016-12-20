'use strict'
const expect = require('chai').expect
var path = require('path')
var VedamUtils = require(path.resolve('VedamUtils'))

var testData= [ [ '3/5/2016 23:57:40',
    'Sudharshun',
    'Karthikai',
    'Aswini',
    '2 days before Nakshatra Birthday',
    'Sudharshun@gmail.com',
    '8475942450',
    '12/19/2016',
    'Mail Sent' ],
  [ '3/6/2016 0:23:35',
    'Vadiehi',
    'Maargazhi',
    'Magam',
    '1 days before Nakshatra Birthday',
    'vaidehi0605@gmail.com',
    '8475942450',
    '12/19/2016' ],
  [ '3/6/2016 0:42:49',
    'Ravichander',
    'Maasi',
    'Magam',
    'On Nakshatra Birthday',
    'sudharshun@gmail.com',
    '8475942450' ],
  [ '3/6/2016 0:53:37',
    'Sudharshun Ravichander',
    'Maargazhi',
    'Avittam',
    '2 days before Nakshatra Birthday',
    'sudharshun@gmail.com',
    '8475942450' ],
  [ '3/6/2016 1:14:48',
    'Karthik',
    'Maargazhi',
    'Karthigai',
    '2 days before Nakshatra Birthday',
    'Sudharshun@gmail.com',
    '8476557476' ],
  [ '3/7/2016 0:09:35',
    'Sethuraman Venkataraman',
    'Maasi',
    'Sathayam',
    '1 day before Nakshatra Birthday',
    'vsethuraman@yahoo.com',
    '6305445186' ],
  [ '12/11/2016 20:05:13',
    'SUdharshun',
    'Maargazhi',
    'Avittam',
    '2 days before Nakshatra Birthday',
    'Sudharshun@gmail.com',
    '8475942450' ],
  [ '12/17/2016 14:40:27',
    'Asha',
    'Chithirai',
    'Sathayam',
    '1 day before Nakshatra Birthday',
    'Sudharshun@gmail.com',
    '8475942450' ],
  [ '12/18/2016 20:53:37',
    'Sudharshun',
    'Aani',
    'Aswini',
    '1 day before Nakshatra Birthday',
    'Sudharshun@gmail.com',
    '8475942450' ] ]


describe('Given a Veda Utils Class', () => {
    describe('When trying to read Calendar Data', () => {
        it('Then it is able to initialise the client', () => {
            let vedamUtils = new VedamUtils()
            expect(vedamUtils).to.not.be.eql(undefined)
          })

        it('Then should be able to read from Calendar File',()=>{
            let vedamUtils = new VedamUtils()
            let calendarData = vedamUtils.readCalendarData()
            expect(calendarData[0].EngDate).to.be.eql('12/1/2016')  
        })

        it('Then should find out Tamil Nakshatram for a given English Date',()=>{
            let vedamUtils = new VedamUtils()
            let day='8/18/2017'
              let tamilDay=vedamUtils.getTamilDay(day)
            expect(tamilDay.TamilDay).to.be.eql(2)
            expect(tamilDay.Month).to.be.eql('Aavani')
            expect(tamilDay.Star).to.be.eql('Avittam')
            })

        it('Then should find out Tamil Nakshatram for a todays Date',()=>{
            let vedamUtils = new VedamUtils()
                 let tamilToday=vedamUtils.getTamilToday()
         //        vedamUtils.sendEmail('Sudharshun','Sudharshun@gmail.com','Avittam','Aavani')
            expect(tamilToday.TamilDay).to.be.eql(4)
            expect(tamilToday.Month).to.be.eql('Maargazhi')
            expect(tamilToday.Star).to.be.eql('Magam')
            })

         it('Then should find out who is having janmanakshatram today',()=>{
            let vedamUtils = new VedamUtils()
            let bdayToday=vedamUtils.getBirthdayReminders(testData)
            console.log('Got bdays')     
            console.log('Birthday star today',bdayToday)       
            expect(bdayToday.length).to.be.eql(2)
          })

           it('Then should find out who not having registration date set',()=>{
            let vedamUtils = new VedamUtils()
            let unRegistered=vedamUtils.getReminderNotSet(testData)
            console.log('Got reminder Date not set')     
            console.log('Unregistered in list',unRegistered)       
            expect(unRegistered.length).to.be.eql(7)
          })

          it('Then should find out Translated Date for list of unregisted users',()=>{
            let vedamUtils = new VedamUtils()
            let unRegistered=vedamUtils.getReminderNotSet(testData)
            let reminderDateSet=vedamUtils.calculateReminders(unRegistered)
            console.log('Got reminder Date set')     
            console.log('Unregistered in list',reminderDateSet)       
            expect(reminderDateSet[0][1]).to.be.eql('Ravichander')
          })

         it('Then should be able to give me english date for nakshakram and maasam',()=>{
            let vedamUtils = new VedamUtils()
            let reminderDate = vedamUtils.getReminderForPerson('Maargazhi','Hastam',3)
            expect(reminderDate).to.be.eql('12/19/2016')  
         })


         it('Then should be able to translate days before to number',()=>{
            let vedamUtils = new VedamUtils()
            expect( vedamUtils.getNoOfDays(testData[0][4])).to.be.eql(2)
            expect( vedamUtils.getNoOfDays(testData[1][4])).to.be.eql(1)
            expect( vedamUtils.getNoOfDays(testData[2][4])).to.be.eql(0)
        
         })


          it('Then should find list of reminders that match today',()=>{
            let vedamUtils = new VedamUtils()
            let listOfPersons=testData
            listOfPersons[0][7]='12/19/2016'
            
            listOfPersons[2][7]='12/19/2016'
            
            listOfPersons[3][7]='12/19/2016'
            listOfPersons[3][8]='Mail Sent'

            let remindersTobeSent=vedamUtils.getPersonsWithReminderToday(listOfPersons)

            console.log('Got reminder Date not set')     
            console.log('Todays Match in list',remindersTobeSent)       
            expect(remindersTobeSent.length).to.be.eql(2)
          })

    })

})
