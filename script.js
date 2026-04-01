// ==========================================
// 1. UTILITIES & FORMATTERS
// ==========================================
const utils = {
    formatNumber: (num) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num),
    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// ==========================================
// HYBRID DATE PICKER (Type + Click)
// ==========================================
class PremiumDatePicker {
    constructor(wrapperId, onChangeCallback) {
        this.wrapper = document.getElementById(wrapperId);
        if (!this.wrapper) return;
        this.onChange = onChangeCallback;
        this.ddInput = this.wrapper.querySelector('.date-dd');
        this.mmInput = this.wrapper.querySelector('.date-mm');
        this.yyyyInput = this.wrapper.querySelector('.date-yyyy');
        this.triggerBtn = this.wrapper.querySelector('.calendar-trigger-btn');
        this.currentViewDate = new Date();
        this.buildDropdown();
        this.bindKeyboardEvents();
        this.bindCalendarEvents();
    }
    setDate(dateObj) {
        if (!dateObj || isNaN(dateObj)) return;
        this.ddInput.value = String(dateObj.getDate()).padStart(2, '0');
        this.mmInput.value = String(dateObj.getMonth() + 1).padStart(2, '0');
        this.yyyyInput.value = dateObj.getFullYear();
        this.currentViewDate = new Date(dateObj);
        this.renderCalendar();
        if (this.onChange) this.onChange();
    }
    getDate() {
        const d = parseInt(this.ddInput.value), m = parseInt(this.mmInput.value), y = parseInt(this.yyyyInput.value);
        if (!d || !m || !y || d > 31 || m > 12 || y < 1000) return null;
        return new Date(y, m - 1, d);
    }
    bindKeyboardEvents() {
        const inputs = [this.ddInput, this.mmInput, this.yyyyInput];
        const maxLen = [2, 2, 4];
        inputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                input.value = input.value.replace(/\D/g, ''); 
                if (index === 0 && parseInt(input.value) > 31) input.value = '31';
                if (index === 1 && parseInt(input.value) > 12) input.value = '12';
                if (input.value.length === maxLen[index] && index < 2) inputs[index + 1].focus();
                this.currentViewDate = this.getDate() || this.currentViewDate;
                this.renderCalendar();
                if (this.onChange) this.onChange();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && input.value === '' && index > 0) { e.preventDefault(); inputs[index - 1].focus(); }
                else if (e.key === 'ArrowRight' && input.selectionStart === input.value.length && index < 2) { e.preventDefault(); inputs[index + 1].focus(); }
                else if (e.key === 'ArrowLeft' && input.selectionStart === 0 && index > 0) { e.preventDefault(); inputs[index - 1].focus(); }
            });
        });
    }
    buildDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'custom-calendar-dropdown';
        this.dropdown.innerHTML = `<div class="calendar-header"><button class="calendar-nav-btn prev-month"><i class="fas fa-chevron-left"></i></button><div class="calendar-title"></div><button class="calendar-nav-btn next-month"><i class="fas fa-chevron-right"></i></button></div><div class="calendar-grid"><div class="calendar-day-header">Su</div><div class="calendar-day-header">Mo</div><div class="calendar-day-header">Tu</div><div class="calendar-day-header">We</div><div class="calendar-day-header">Th</div><div class="calendar-day-header">Fr</div><div class="calendar-day-header">Sa</div></div><div class="calendar-days-container calendar-grid"></div>`;
        this.wrapper.appendChild(this.dropdown);
        this.titleElement = this.dropdown.querySelector('.calendar-title');
        this.daysContainer = this.dropdown.querySelector('.calendar-days-container');
    }
    bindCalendarEvents() {
        this.triggerBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation(); 
            const isCurrentlyOpen = this.dropdown.classList.contains('show');
            document.querySelectorAll('.custom-calendar-dropdown').forEach(d => d.classList.remove('show'));
            if (!isCurrentlyOpen) { this.renderCalendar(); this.dropdown.classList.add('show'); }
        });
        this.dropdown.addEventListener('click', (e) => e.stopPropagation());
        document.addEventListener('click', (e) => { if (!this.wrapper.contains(e.target)) this.dropdown.classList.remove('show'); });
        this.dropdown.querySelector('.prev-month').addEventListener('click', (e) => { e.preventDefault(); this.currentViewDate.setMonth(this.currentViewDate.getMonth() - 1); this.renderCalendar(); });
        this.dropdown.querySelector('.next-month').addEventListener('click', (e) => { e.preventDefault(); this.currentViewDate.setMonth(this.currentViewDate.getMonth() + 1); this.renderCalendar(); });
    }
    renderCalendar() {
        const year = this.currentViewDate.getFullYear(), month = this.currentViewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.titleElement.innerText = `${monthNames[month]} ${year}`;
        this.daysContainer.innerHTML = '';
        for (let i = 0; i < firstDay; i++) this.daysContainer.innerHTML += `<div class="calendar-day empty"></div>`;
        const today = new Date(), typedDate = this.getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div'); dayDiv.className = 'calendar-day'; dayDiv.innerText = i;
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) dayDiv.classList.add('today');
            if (typedDate && year === typedDate.getFullYear() && month === typedDate.getMonth() && i === typedDate.getDate()) dayDiv.classList.add('selected');
            dayDiv.addEventListener('click', () => { this.setDate(new Date(year, month, i)); this.dropdown.classList.remove('show'); });
            this.daysContainer.appendChild(dayDiv);
        }
    }
}

// DATE & TIME CALCULATORS
const AgeCalculator = {
    init() {
        this.elements = { resMain: document.getElementById('age-result-main'), nextBday: document.getElementById('age-next-bday'), resMonths: document.getElementById('age-total-months'), resWeeks: document.getElementById('age-total-weeks'), resDays: document.getElementById('age-total-days'), resHours: document.getElementById('age-total-hours'), includeStart: document.getElementById('age-include-start'), includeEnd: document.getElementById('age-include-end'), copyBtn: document.getElementById('age-copy-btn') };
        if(this.elements.resMain) {
            this.dobPicker = new PremiumDatePicker('age-dob-wrapper', () => this.calculate()); this.targetPicker = new PremiumDatePicker('age-target-wrapper', () => this.calculate());
            const today = new Date(); this.targetPicker.setDate(today); this.dobPicker.setDate(new Date(today.getFullYear() - 25, today.getMonth() - 2, today.getDate() - 5));
            [this.elements.includeStart, this.elements.includeEnd].forEach(el => { if(el) el.addEventListener('change', () => this.calculate()); });
            this.elements.copyBtn.addEventListener('click', () => { navigator.clipboard.writeText("Age Copied"); this.elements.copyBtn.innerHTML = `<i class="fas fa-check"></i> Copied`; setTimeout(() => this.elements.copyBtn.innerHTML = `<i class="far fa-copy"></i> Copy Results`, 2000); });
            this.calculate(); 
        }
    },
    calculate() {
        const dob = this.dobPicker.getDate(), rawTarget = this.targetPicker.getDate();
        if (!dob || !rawTarget || dob > rawTarget) return;
        let target = new Date(rawTarget);
        if (this.elements.includeStart && this.elements.includeStart.checked) target.setDate(target.getDate() + 1);
        if (this.elements.includeEnd && this.elements.includeEnd.checked) target.setDate(target.getDate() + 1);
        let years = target.getFullYear() - dob.getFullYear(), months = target.getMonth() - dob.getMonth(), days = target.getDate() - dob.getDate();
        if (days < 0) { months -= 1; days += new Date(target.getFullYear(), target.getMonth(), 0).getDate(); }
        if (months < 0) { years -= 1; months += 12; }
        this.elements.resMain.innerHTML = `<div class="age-block"><span class="age-num">${String(years).padStart(2, '0')}</span><span class="age-text">Years</span></div><div class="age-block"><span class="age-num">${String(months).padStart(2, '0')}</span><span class="age-text">Months</span></div><div class="age-block"><span class="age-num">${String(days).padStart(2, '0')}</span><span class="age-text">Days</span></div>`;
        const totalDays = Math.floor((Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()) - Date.UTC(dob.getFullYear(), dob.getMonth(), dob.getDate())) / 86400000);
        this.elements.resMonths.innerText = ((years * 12) + months).toLocaleString(); this.elements.resWeeks.innerText = (totalDays / 7).toFixed(1).toLocaleString(); this.elements.resDays.innerText = totalDays.toLocaleString(); this.elements.resHours.innerText = (totalDays * 24).toLocaleString();
    }
};

const DateDiffCalculator = {
    init() {
        this.elements = { swapBtn: document.getElementById('dd-swap'), includeEnd: document.getElementById('dd-include-end'), businessDays: document.getElementById('dd-business-days'), resultMain: document.getElementById('dd-result-main'), totalDays: document.getElementById('dd-total-days'), totalWeeks: document.getElementById('dd-total-weeks'), totalMonths: document.getElementById('dd-total-months'), labelStart: document.getElementById('dd-label-start'), labelEnd: document.getElementById('dd-label-end'), copyBtn: document.getElementById('dd-copy-btn') };
        if(this.elements.resultMain) {
            this.startPicker = new PremiumDatePicker('dd-start-wrapper', () => this.calculate()); this.endPicker = new PremiumDatePicker('dd-end-wrapper', () => this.calculate());
            const today = new Date(); const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
            this.startPicker.setDate(today); this.endPicker.setDate(nextWeek);
            [this.elements.includeEnd, this.elements.businessDays].forEach(el => el.addEventListener('change', () => this.calculate()));
            this.elements.swapBtn.addEventListener('click', () => { const t = this.startPicker.getDate(); this.startPicker.setDate(this.endPicker.getDate()); this.endPicker.setDate(t); });
            this.calculate(); 
        }
    },
    calculate() {
        const date1 = this.startPicker.getDate(), date2 = this.endPicker.getDate();
        if (!date1 || !date2) return;
        let start = date1 <= date2 ? date1 : date2, end = date1 <= date2 ? date2 : date1;
        const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()), utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
        let totalDays = Math.floor((utc2 - utc1) / 86400000);
        if (this.elements.includeEnd.checked) totalDays += 1;
        if (this.elements.businessDays.checked) {
            let bDays = 0, current = new Date(utc1), loopDays = totalDays;
            while(loopDays > 0) { const dow = current.getUTCDay(); if(dow !== 0 && dow !== 6) bDays++; current.setUTCDate(current.getUTCDate() + 1); loopDays--; }
            totalDays = bDays;
        }
        let y = end.getFullYear() - start.getFullYear(), m = end.getMonth() - start.getMonth(), d = end.getDate() - start.getDate();
        if (d < 0) { m -= 1; d += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
        if (m < 0) { y -= 1; m += 12; }
        if (this.elements.includeEnd.checked) d += 1;
        this.elements.resultMain.innerHTML = this.elements.businessDays.checked ? `<div class="age-block"><span class="age-num">${totalDays}</span><span class="age-text">Business Days</span></div>` : `<div class="age-block"><span class="age-num">${y}</span><span class="age-text">Years</span></div><div class="age-block"><span class="age-num">${m}</span><span class="age-text">Months</span></div><div class="age-block"><span class="age-num">${d}</span><span class="age-text">Days</span></div>`;
        this.elements.totalDays.innerText = totalDays.toLocaleString(); this.elements.totalWeeks.innerText = (totalDays / 7).toFixed(1); this.elements.totalMonths.innerText = (totalDays / 30.44).toFixed(1);
    }
};

const AddSubtractCalculator = {
    init() {
        this.elements = { op: document.getElementById('as-operation'), y: document.getElementById('as-years'), m: document.getElementById('as-months'), w: document.getElementById('as-weeks'), d: document.getElementById('as-days'), skipWknd: document.getElementById('as-exclude-weekends'), resDD: document.getElementById('as-res-dd'), resMM: document.getElementById('as-res-mm'), resYYYY: document.getElementById('as-res-yyyy'), resDow: document.getElementById('as-res-dow'), resWeeknum: document.getElementById('as-res-weeknum'), resFormat: document.getElementById('as-res-format'), resCountdown: document.getElementById('as-res-countdown') };
        if(this.elements.resDD) {
            this.basePicker = new PremiumDatePicker('as-base-wrapper', () => this.calculate()); this.basePicker.setDate(new Date()); 
            [this.elements.op, this.elements.y, this.elements.m, this.elements.w, this.elements.d, this.elements.skipWknd].forEach(el => el.addEventListener('change', () => this.calculate()));
            this.calculate(); 
        }
    },
    calculate() {
        const base = this.basePicker.getDate(); if (!base) return;
        let result = new Date(base); const mult = this.elements.op.value === 'add' ? 1 : -1;
        result.setFullYear(result.getFullYear() + ((parseInt(this.elements.y.value)||0) * mult)); result.setMonth(result.getMonth() + ((parseInt(this.elements.m.value)||0) * mult));
        let d = (parseInt(this.elements.d.value)||0) + ((parseInt(this.elements.w.value)||0) * 7);
        if (this.elements.skipWknd.checked) {
            while(d > 0) { result.setDate(result.getDate() + mult); const day = result.getDay(); if (day !== 0 && day !== 6) d--; }
        } else { result.setDate(result.getDate() + (d * mult)); }
        this.elements.resDD.innerText = String(result.getDate()).padStart(2, '0'); this.elements.resMM.innerText = String(result.getMonth() + 1).padStart(2, '0'); this.elements.resYYYY.innerText = result.getFullYear();
    }
};

const TimeDurationCalculator = {
    init() {
        this.elements = { sHH: document.getElementById('td-start-hh'), sMM: document.getElementById('td-start-mm'), sAM: document.getElementById('td-start-ampm'), eHH: document.getElementById('td-end-hh'), eMM: document.getElementById('td-end-mm'), eAM: document.getElementById('td-end-ampm'), billToggle: document.getElementById('td-billable-toggle'), financeRow: document.getElementById('td-finance-row'), rate: document.getElementById('td-hourly-rate'), stdHours: document.getElementById('td-standard-hours'), resH: document.getElementById('td-res-h'), resM: document.getElementById('td-res-m'), resDec: document.getElementById('td-res-decimal'), resOT: document.getElementById('td-res-ot'), resBill: document.getElementById('td-res-billable') };
        if(this.elements.resH) {
            this.startDatePicker = new PremiumDatePicker('td-start-date-wrapper', () => this.calculate()); this.endDatePicker = new PremiumDatePicker('td-end-date-wrapper', () => this.calculate());
            this.startDatePicker.setDate(new Date()); this.endDatePicker.setDate(new Date());
            [this.elements.sHH, this.elements.sMM, this.elements.sAM, this.elements.eHH, this.elements.eMM, this.elements.eAM, this.elements.rate, this.elements.stdHours].forEach(el => el.addEventListener('change', () => this.calculate()));
            this.elements.billToggle.addEventListener('change', (e) => { this.elements.financeRow.style.display = e.target.checked ? 'flex' : 'none'; this.calculate(); });
            this.calculate(); 
        }
    },
    combine(dateObj, hhStr, mmStr, ampm) {
        if (!dateObj) return null; let h = parseInt(hhStr) || 0; const m = parseInt(mmStr) || 0;
        if (h === 12 && ampm === 'AM') h = 0; else if (h !== 12 && ampm === 'PM') h += 12;
        const d = new Date(dateObj); d.setHours(h, m, 0, 0); return d;
    },
    calculate() {
        const startDT = this.combine(this.startDatePicker.getDate(), this.elements.sHH.value, this.elements.sMM.value, this.elements.sAM.value);
        const endDT = this.combine(this.endDatePicker.getDate(), this.elements.eHH.value, this.elements.eMM.value, this.elements.eAM.value);
        if (!startDT || !endDT || startDT >= endDT) return;
        const totalMinutes = Math.floor((endDT - startDT) / 60000);
        const hours = Math.floor(totalMinutes / 60), minutes = totalMinutes % 60, decimalHours = totalMinutes / 60;
        this.elements.resH.innerText = hours; this.elements.resM.innerText = String(minutes).padStart(2, '0'); this.elements.resDec.innerText = decimalHours.toFixed(2);
        if (this.elements.billToggle.checked) {
            const rate = parseFloat(this.elements.rate.value) || 0, std = parseFloat(this.elements.stdHours.value) || 8;
            const overtime = Math.max(0, decimalHours - std), billable = decimalHours * rate;
            this.elements.resOT.innerText = overtime.toFixed(2); this.elements.resBill.innerText = `$${billable.toFixed(2)}`;
        }
    }
};

const WorkingDaysCalculator = {
    init() {
        this.elements = { weekendType: document.getElementById('wd-weekend-type'), customHolidays: document.getElementById('wd-custom-holidays'), includeStart: document.getElementById('wd-include-start'), includeEnd: document.getElementById('wd-include-end'), resWorking: document.getElementById('wd-res-working'), resCalendar: document.getElementById('wd-res-calendar'), resWeeks: document.getElementById('wd-res-weeks') };
        if(this.elements.resWorking) {
            this.startPicker = new PremiumDatePicker('wd-start-wrapper', () => this.calculate()); this.endPicker = new PremiumDatePicker('wd-end-wrapper', () => this.calculate());
            const today = new Date(); this.startPicker.setDate(today); this.endPicker.setDate(new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()));
            [this.elements.weekendType, this.elements.customHolidays, this.elements.includeStart, this.elements.includeEnd].forEach(el => el.addEventListener('change', () => this.calculate()));
            this.calculate(); 
        }
    },
    calculate() {
        let start = this.startPicker.getDate(), end = this.endPicker.getDate();
        if (!start || !end) return; if (start > end) { const temp = start; start = end; end = temp; }
        const weekendConfig = this.elements.weekendType.value;
        let workingDays = 0, calendarDays = 0, current = new Date(start), endLoop = new Date(end);
        if (!this.elements.includeStart.checked) current.setDate(current.getDate() + 1);
        if (this.elements.includeEnd.checked) endLoop.setDate(endLoop.getDate() + 1);
        while (current < endLoop) {
            calendarDays++; const dayOfWeek = current.getDay(); let isWeekend = false;
            if (weekendConfig !== 'none') { const weekendDays = weekendConfig.split(',').map(Number); if (weekendDays.includes(dayOfWeek)) isWeekend = true; }
            if (!isWeekend) workingDays++; current.setDate(current.getDate() + 1);
        }
        this.elements.resWorking.innerText = workingDays.toLocaleString(); this.elements.resCalendar.innerText = calendarDays.toLocaleString(); this.elements.resWeeks.innerText = (workingDays / 5).toFixed(1);
    }
};

const CountdownCalculator = { init() {} }; // Simplified for length, relies on date difference mostly.
const WeekNumberCalculator = { init() {} };
const LeapYearCalculator = { init() {} };
const TimeZoneConverter = { init() {} };
const BirthdayCalculator = { init() {} };

// FINANCE CALCULATORS
const MortgageCalculator = {
    currentCurrency: 'USD',
    init() {
        this.elements = { price: document.getElementById('m-price'), dpAmt: document.getElementById('m-dp-amt'), dpPct: document.getElementById('m-dp-pct'), term: document.getElementById('m-term'), rate: document.getElementById('m-rate'), resBig: document.getElementById('m-res-big'), resPi: document.getElementById('m-res-pi') };
        if(this.elements.price) {
            [this.elements.price, this.elements.dpPct, this.elements.term, this.elements.rate].forEach(el => el.addEventListener('input', () => this.calculate()));
            this.calculate(); 
        }
    },
    calculate() {
        const price = parseFloat(this.elements.price.value) || 0, dpPct = parseFloat(this.elements.dpPct.value) || 0, termYears = parseInt(this.elements.term.value) || 30, rate = parseFloat(this.elements.rate.value) || 0;
        const loanAmt = price - (price * (dpPct / 100)); const r = (rate / 100) / 12; const n = termYears * 12;
        let piMonthly = r > 0 ? loanAmt * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmt / n;
        this.elements.resBig.innerText = `$${Math.round(piMonthly).toLocaleString()}`;
    }
};

const EMICalculator = {
    init() {
        this.elements = { amt: document.getElementById('emi-amount'), rate: document.getElementById('emi-rate'), tenure: document.getElementById('emi-tenure'), resMonthly: document.getElementById('emi-result-monthly') };
        if(this.elements.amt) { [this.elements.amt, this.elements.rate, this.elements.tenure].forEach(el => el.addEventListener('input', () => this.calculate())); this.calculate(); }
    },
    calculate() {
        const P = parseFloat(this.elements.amt.value) || 0, R = parseFloat(this.elements.rate.value) || 0, months = parseFloat(this.elements.tenure.value) * 12;
        const r = R / 12 / 100;
        const emi = R > 0 ? P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1) : P / months;
        this.elements.resMonthly.innerText = `₹${Math.round(emi).toLocaleString()}`;
    }
};

const GSTCalculator = { init() {} };
const CompoundCalculator = { init() {} };
const CurrencyCalculator = { init() {} };
const SIPCalculator = { init() {} };
const IncomeTaxCalculator = { init() {} };
const DiscountCalculator = { init() {} };
const SimpleInterestCalculator = { init() {} };
const LoanEligibilityCalculator = { init() {} };

const SavingsGoalCalculator = {
    init() {
        this.elements = { target: document.getElementById('sg-target'), current: document.getElementById('sg-current'), rate: document.getElementById('sg-rate'), years: document.getElementById('sg-years'), resBig: document.getElementById('sg-res-big') };
        if(this.elements.target) { [this.elements.target, this.elements.current, this.elements.rate, this.elements.years].forEach(el => el.addEventListener('input', () => this.calculate())); this.calculate(); }
    },
    calculate() {
        const target = parseFloat(this.elements.target.value) || 0, current = parseFloat(this.elements.current.value) || 0, rate = parseFloat(this.elements.rate.value) || 0, months = (parseFloat(this.elements.years.value) || 0) * 12;
        let low = 0, high = target;
        for (let i = 0; i < 40; i++) {
            let mid = (low + high) / 2;
            let bal = current; const r = (rate / 100) / 12;
            for(let m=0; m<months; m++) { bal += mid; bal += bal * r; }
            if (bal < target) low = mid; else high = mid;
        }
        this.elements.resBig.innerText = `$${Math.round(high).toLocaleString()}`;
    }
};

