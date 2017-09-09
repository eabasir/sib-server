/**
 * Created by user on 8/13/2017.
 */
var jmoment = require('jalali-moment');
var moment = require('moment');


getGregorianNow = () => {

    return moment().utc().format();
};

getJalaliNow = () => {
    let gNow = jmoment();
    return jmoment(gNow.format('YYYY-MM-DD'), 'YYYY-MM-DD').format('jYYYY-jMM-jDD');
};

getJalaliStartOfMonth = () => {

    let gNow = jmoment();
    return gNow.startOf('jMonth').format('jYYYY-jMM-jDD');
};

getGregorianStartOfMonth = () => {

    let gNow = jmoment();
    return gNow.startOf('jMonth').utc().format();
};
getGregorianStartOfNextMonth = () => {

    let gNow = jmoment();
    return gNow.startOf('jMonth').add(1, 'jMonth').utc().format();
};


getGregorianStartOfSevenLaterMonth = () => {

    let gNow = jmoment();
    return gNow.startOf('jMonth').add(7, 'jMonth').utc().format();
};


getJalaliEndOfMonth = () => {

    let gNow = jmoment();
    return gNow.endOf('jMonth').format('jYYYY-jMM-jDD');
};

getGregorianEndOfMonth = () => {

    let gNow = jmoment();
    return gNow.endOf('jMonth').utc().format();
};


getGregorianLastSixMonth = () => {

    let dates = [];


    for (let i = 5; i >= 0; i--) {
        let gNow = jmoment();
        dates.push(gNow.startOf('jMonth').subtract(i, 'jMonth').utc().format())
    }
    return dates;
};

getGregorianFutureSixMonth = () => {

    let dates = [];

    for (let i = 0; i <= 5; i++) {
        let gNow = jmoment();
        dates.push(gNow.startOf('jMonth').add(i, 'jMonth').utc().format())
    }
    return dates;
};


convertUTCGregorianToJalali = (utc) => {
    try {
        return jmoment(utc).format('jYYYY/jMM/jDD');
    }
    catch (err) {
        return '';

    }
};


convertJalaliToUTCGregorian = (jalali) => {

    return jmoment(jalali, 'jYYYY-jMM-jDD').utc().add(1, 'days').format('YYYY-MM-DD') + 'T00:00:00Z';
};

module.exports = {
    getGregorianNow,
    getJalaliNow,
    getJalaliStartOfMonth,
    getGregorianStartOfMonth,
    getGregorianStartOfNextMonth,
    getGregorianStartOfSevenLaterMonth,
    getJalaliEndOfMonth,
    getGregorianEndOfMonth,
    getGregorianLastSixMonth,
    getGregorianFutureSixMonth,
    convertUTCGregorianToJalali,
    convertJalaliToUTCGregorian

};