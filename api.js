const appointmentTypeSelector = document.getElementById('types');
const dateSelector = document.getElementById('date');
const timeSelector = document.getElementById('time');
const submitBtn = document.getElementById('submit');
const email = document.getElementById('email');
const fullName = document.getElementById('fName');
const errorDisplay = document.getElementById('error');
import config from './config.js'

const API_KEY = config.API_KEY;
const PROVIDER_ID = config.PROVIDER_ID;

const apiRequests = {
  getAllAppointmentTypes: async () => {
    try {
      const res = await fetch(
        'https://api.spurwing.io/api/v2/appointment_types',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      if (res.ok) {
        const jsonRes = await res.json();
        jsonRes.forEach((type) => {
          createListElements(type, appointmentTypeSelector);
        });
      } else {
        const errorRes = await res.json();
        errorDisplay.innerText = errorRes.message;
      }
    } catch (err) {
      errorDisplay.innerText = 'Connection error';
    }
  },
  getAvailableDays: async (dateFromMonth, appointmentTypeId) => {
    try {
      const res = await fetch(
        `https://api.spurwing.io/api/v2/bookings/days_available?date_from_month=${dateFromMonth}&appointment_type_id=${appointmentTypeId}&provider_id=${PROVIDER_ID}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        }
      );

      if (res.ok) {
        const jsonRes = await res.json();
        jsonRes.days_available.forEach((date) => {
          date = {
            id: date,
            name: date,
          };
          createListElements(date, dateSelector, appointmentTypeId);
        });
      } else {
        const errorRes = await res.json();
        errorDisplay.innerText = errorRes.message;
      }
    } catch (err) {
      errorDisplay.innerText = 'Connection error';
    }
  },
  getAvailableSlots: async (startDate, appointmentTypeId) => {
    try {
      const res = await fetch(
        `https://api.spurwing.io/api/v2/bookings/slots_available?start_date=${startDate}&appointment_type_id=${appointmentTypeId}&provider_id=${PROVIDER_ID}&end_date=${startDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        }
      );

      if (res.ok) {
        const jsonRes = await res.json();
        jsonRes.slots_available.forEach((slot) => {
          slot = {
            id: slot.date,
            name: slot.date,
          };
          createListElements(slot, timeSelector, appointmentTypeId);
        });
      } else {
        const errorRes = await res.json();
        errorDisplay.innerText = errorRes.message;
      }
    } catch (err) {
      errorDisplay.innerText = 'Connection error';
    }
  },
  completeBooking: async (
    email,
    firstName,
    lastName,
    appointmentTypeId,
    dateTime
  ) => {
    try {
      const res = await fetch(
        `https://api.spurwing.io/api/v2/bookings/complete_booking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            provider_id: PROVIDER_ID,
            email,
            first_name: firstName,
            last_name: lastName,
            appointment_type_id: appointmentTypeId,
            date: dateTime,
          }),
        }
      );

      if (res.ok) {
        await res.json();
        alert('Appointment booked');
      } else {
        const errorRes = await res.json();
        errorDisplay.innerText = errorRes.message;
      }
    } catch (err) {
      errorDisplay.innerText = 'Connection error';
    }
  },
};

apiRequests.getAllAppointmentTypes();

const createListElements = (value, selector) => {
  const option = document.createElement('option');

  option.value = value.id;
  option.innerText = value.name;

  selector.appendChild(option);
};

appointmentTypeSelector.addEventListener('change', () => {
  const date = new Date().toDateString();
  if (appointmentTypeSelector.value) {
    apiRequests.getAvailableDays(date, appointmentTypeSelector.value);
  }
});

dateSelector.addEventListener('change', () => {
  if (appointmentTypeSelector.value && dateSelector.value) {
    apiRequests.getAvailableSlots(
      dateSelector.value,
      appointmentTypeSelector.value
    );
  }
});

submitBtn.addEventListener('click', () => {
  if (
    !email.value ||
    !fullName.value ||
    !appointmentTypeSelector.value ||
    !dateSelector.value ||
    !timeSelector.value
  ) {
    return;
  }

  const fullname = fullName.value.trim().split(' ');

  apiRequests.completeBooking(
    email.value,
    fullname[0],
    fullname[1],
    appointmentTypeSelector.value,
    timeSelector.value
  );
});
